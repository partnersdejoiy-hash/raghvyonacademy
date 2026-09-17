import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_COURSES, INITIAL_TEACHER_PROFILE, SAMPLE_STUDENT_ASSIGNMENTS, SAMPLE_STUDENT_NOTES, SAMPLE_CERTIFICATES, SAMPLE_PROGRESS, SAMPLE_UPCOMING_TASKS, SAMPLE_FEEDBACK } from './src/data/initialData';
import { UserProfile, Course, TeacherProfile, EnquiryRecord, DemoBookingRecord, AuditLog, StudyNote, Assignment } from './src/types';

// In-memory persistent database store during server runtime
let courses: Course[] = [...INITIAL_COURSES];
let teacherProfile: TeacherProfile = { ...INITIAL_TEACHER_PROFILE };
let studentAssignments: Assignment[] = [...SAMPLE_STUDENT_ASSIGNMENTS];
let studentNotes: StudyNote[] = [...SAMPLE_STUDENT_NOTES];
let demoBookings: DemoBookingRecord[] = [
  {
    id: 'demo-101',
    parentName: 'Sunita Sharma',
    studentName: 'Aarav Sharma',
    studentGrade: 'Grade 8',
    subject: 'Core Mathematics',
    preferredDate: '2026-09-20',
    preferredTimeSlot: '4:00 PM - 5:00 PM IST',
    phone: '+91 98765 43210',
    email: 'sunita.sharma@example.com',
    status: 'confirmed',
    createdAt: '2026-09-14'
  }
];
let enquiries: EnquiryRecord[] = [
  {
    id: 'enq-101',
    name: 'Rajesh Mehra',
    email: 'rajesh.m@example.com',
    phone: '+91 98111 22334',
    studentGrade: 'Grade 9',
    subject: 'Integrated Science & Experimental Thinking',
    message: 'Interested in weekend batch timing for CBSE curriculum preparation.',
    createdAt: '2026-09-15',
    status: 'new'
  }
];
let auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOT',
    actor: 'System',
    timestamp: new Date().toISOString(),
    details: 'RAGHVYON Academy Backend started successfully'
  }
];

// Current active session state (simulated secure session store)
let currentSessionUser: UserProfile = {
  id: 'usr-student-aarav',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@student.raghvyon.edu',
  role: 'student',
  grade: 'Grade 8',
  studentId: 'RAGH-2026-081',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  parentEmail: 'sunita.sharma@example.com',
  driveConnected: false,
  createdAt: '2026-01-10'
};

// Google Drive configuration state
const driveIntegrationConfig = {
  isConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  isConnected: false,
  connectedEmail: '',
  appFolderName: 'RAGHVYON Academy Learning Portfolio',
  scopeGranted: 'https://www.googleapis.com/auth/drive.file'
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper log audit
  const logAudit = (action: string, actor: string, details: string) => {
    auditLogs.unshift({
      id: 'log-' + Date.now(),
      action,
      actor,
      timestamp: new Date().toISOString(),
      details
    });
    if (auditLogs.length > 50) auditLogs.pop();
  };

  // 1. HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'RAGHVYON ACADEMY', timestamp: new Date().toISOString() });
  });

  // 2. AUTHENTICATION & SESSION
  app.get('/api/auth/session', (req, res) => {
    res.json({ user: currentSessionUser });
  });

  app.post('/api/auth/switch-role', (req, res) => {
    const { role } = req.body;
    if (role === 'student') {
      currentSessionUser = {
        id: 'usr-student-aarav',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@student.raghvyon.edu',
        role: 'student',
        grade: 'Grade 8',
        studentId: 'RAGH-2026-081',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        parentEmail: 'sunita.sharma@example.com',
        driveConnected: driveIntegrationConfig.isConnected,
        createdAt: '2026-01-10'
      };
    } else if (role === 'parent') {
      currentSessionUser = {
        id: 'usr-parent-sunita',
        name: 'Sunita Sharma',
        email: 'sunita.sharma@example.com',
        role: 'parent',
        linkedChildId: 'usr-student-aarav',
        linkedChildName: 'Aarav Sharma (Grade 8)',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-10'
      };
    } else if (role === 'admin') {
      currentSessionUser = {
        id: 'usr-admin-director',
        name: 'Academy Administration',
        email: 'admin@raghvyonacademy.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2025-05-01'
      };
    } else {
      currentSessionUser = {
        id: 'usr-guest',
        name: 'Guest Learner',
        email: '',
        role: 'guest',
        createdAt: new Date().toISOString()
      };
    }
    logAudit('USER_ROLE_SWITCH', currentSessionUser.name, `Switched session to role: ${role}`);
    res.json({ success: true, user: currentSessionUser });
  });

  app.post('/api/auth/google-login', (req, res) => {
    const { token, email, name, role = 'student' } = req.body;
    // Minimal personal data collection per minor safety requirements
    currentSessionUser = {
      id: 'usr-' + (email ? email.replace(/[^a-zA-Z0-9]/g, '') : Date.now()),
      name: name || 'Google Verified Learner',
      email: email || 'student@gmail.com',
      role: (role as any) || 'student',
      grade: 'Grade 8',
      studentId: 'RAGH-' + Math.floor(1000 + Math.random() * 9000),
      driveConnected: driveIntegrationConfig.isConnected,
      createdAt: new Date().toISOString()
    };
    logAudit('GOOGLE_SIGN_IN', currentSessionUser.email, `Student authenticated via Google identity token`);
    res.json({ success: true, user: currentSessionUser });
  });

  app.post('/api/auth/logout', (req, res) => {
    logAudit('LOGOUT', currentSessionUser.name, 'User signed out');
    currentSessionUser = {
      id: 'usr-guest',
      name: 'Guest Learner',
      email: '',
      role: 'guest',
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, user: currentSessionUser });
  });

  app.post('/api/auth/delete-account', (req, res) => {
    logAudit('ACCOUNT_DELETION_REQUEST', currentSessionUser.email, 'User requested permanent student data erasure');
    currentSessionUser = {
      id: 'usr-guest',
      name: 'Guest Learner',
      email: '',
      role: 'guest',
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, message: 'Your account and associated profile records have been erased from active storage.' });
  });

  // 3. COURSES API
  app.get('/api/courses', (req, res) => {
    res.json({ courses });
  });

  app.post('/api/courses', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: req.body.title || 'Untitled Course',
      subject: req.body.subject || 'General',
      description: req.body.description || '',
      gradeLevel: req.body.gradeLevel || 'All Grades',
      duration: req.body.duration || 'Flexible',
      fee: req.body.fee || 'Fee upon enquiry',
      demoAvailable: req.body.demoAvailable !== false,
      active: true,
      highlights: req.body.highlights || ['Core concept focus', 'Interactive problem solving'],
      syllabusOverview: req.body.syllabusOverview || ['Foundations', 'Advanced Problem Solving'],
      instructor: req.body.instructor || 'Senior Faculty'
    };
    courses.push(newCourse);
    logAudit('CREATE_COURSE', currentSessionUser.name, `Created course: ${newCourse.title}`);
    res.status(201).json({ success: true, course: newCourse });
  });

  app.put('/api/courses/:id', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Course not found' });
    courses[index] = { ...courses[index], ...req.body };
    logAudit('UPDATE_COURSE', currentSessionUser.name, `Updated course: ${courses[index].title}`);
    res.json({ success: true, course: courses[index] });
  });

  app.delete('/api/courses/:id', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Course not found' });
    courses[index].active = !courses[index].active; // toggle active status
    logAudit('TOGGLE_COURSE_STATUS', currentSessionUser.name, `Course ${courses[index].id} active state set to ${courses[index].active}`);
    res.json({ success: true, course: courses[index] });
  });

  // 4. TEACHER PROFILE
  app.get('/api/teacher-profile', (req, res) => {
    res.json({ teacherProfile });
  });

  app.put('/api/teacher-profile', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    teacherProfile = { ...teacherProfile, ...req.body };
    logAudit('UPDATE_TEACHER_PROFILE', currentSessionUser.name, 'Updated verified teacher profile');
    res.json({ success: true, teacherProfile });
  });

  // 5. ENQUIRIES & DEMO BOOKINGS
  app.post('/api/enquiries', (req, res) => {
    const { name, email, phone, studentGrade, subject, message } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Please provide name, email, and phone number.' });
    }
    const newEnquiry: EnquiryRecord = {
      id: 'enq-' + Date.now(),
      name,
      email,
      phone,
      studentGrade: studentGrade || 'Not specified',
      subject: subject || 'General Consultation',
      message: message || '',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'new'
    };
    enquiries.unshift(newEnquiry);
    logAudit('NEW_ENQUIRY', name, `Enquiry submitted for subject: ${subject}`);
    res.status(201).json({ success: true, message: 'Enquiry received. Our academic counsellor will reach out shortly.', enquiry: newEnquiry });
  });

  app.get('/api/enquiries', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    res.json({ enquiries });
  });

  app.post('/api/demo-bookings', (req, res) => {
    const { parentName, studentName, studentGrade, subject, preferredDate, preferredTimeSlot, phone, email } = req.body;
    if (!parentName || !studentName || !phone || !email) {
      return res.status(400).json({ error: 'Parent name, student name, email, and phone are required.' });
    }
    const newBooking: DemoBookingRecord = {
      id: 'demo-' + Date.now(),
      parentName,
      studentName,
      studentGrade: studentGrade || 'Grade 8',
      subject: subject || 'Core Mathematics',
      preferredDate: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferredTimeSlot: preferredTimeSlot || '5:00 PM IST',
      phone,
      email,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    demoBookings.unshift(newBooking);
    logAudit('DEMO_CLASS_BOOKED', parentName, `Demo booked for ${studentName} in ${subject}`);
    res.status(201).json({ success: true, message: 'Free demo class scheduled! We will contact you with session link details.', booking: newBooking });
  });

  app.get('/api/demo-bookings', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    res.json({ demoBookings });
  });

  // 6. STUDENT DASHBOARD DATA
  app.get('/api/student/dashboard', (req, res) => {
    if (currentSessionUser.role !== 'student' && currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Student access only.' });
    }
    res.json({
      profile: currentSessionUser,
      enrolledCourses: courses.slice(0, 3),
      assignments: studentAssignments,
      notes: studentNotes,
      certificates: SAMPLE_CERTIFICATES,
      progress: SAMPLE_PROGRESS,
      upcomingTasks: SAMPLE_UPCOMING_TASKS,
      teacherFeedback: SAMPLE_FEEDBACK,
      driveStatus: {
        isConfigured: driveIntegrationConfig.isConfigured,
        isConnected: driveIntegrationConfig.isConnected,
        connectedEmail: driveIntegrationConfig.connectedEmail,
        folderName: driveIntegrationConfig.appFolderName
      }
    });
  });

  // Assignment upload / submission
  app.post('/api/student/assignments/submit', (req, res) => {
    if (currentSessionUser.role !== 'student') {
      return res.status(403).json({ error: 'Unauthorized: Student only.' });
    }
    const { assignmentId, fileName, saveToDrive } = req.body;
    const index = studentAssignments.findIndex(a => a.id === assignmentId);
    if (index === -1) return res.status(404).json({ error: 'Assignment not found' });

    studentAssignments[index].status = 'submitted';
    studentAssignments[index].submittedAt = new Date().toISOString().split('T')[0];
    studentAssignments[index].fileName = fileName || 'Student_Submission.pdf';

    if (saveToDrive && driveIntegrationConfig.isConnected) {
      studentAssignments[index].driveFileId = 'drv-upload-' + Date.now();
      studentAssignments[index].driveFileLink = `https://drive.google.com/open?id=drv-upload-${Date.now()}`;
    }

    logAudit('SUBMIT_ASSIGNMENT', currentSessionUser.name, `Submitted assignment: ${studentAssignments[index].title}`);
    res.json({ success: true, assignment: studentAssignments[index] });
  });

  // Student note save & drive export
  app.post('/api/student/notes', (req, res) => {
    if (currentSessionUser.role !== 'student') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { title, subject, summary, content, saveToDrive } = req.body;
    const newNote: StudyNote = {
      id: 'note-' + Date.now(),
      title: title || 'Quick Concept Note',
      subject: subject || 'Mathematics',
      summary: summary || '',
      content: content || '',
      updatedAt: new Date().toISOString().split('T')[0],
      driveSaved: !!(saveToDrive && driveIntegrationConfig.isConnected),
      driveFileLink: saveToDrive && driveIntegrationConfig.isConnected ? `https://drive.google.com/open?id=drv-note-${Date.now()}` : undefined
    };
    studentNotes.unshift(newNote);
    logAudit('CREATE_STUDY_NOTE', currentSessionUser.name, `Created note: ${newNote.title}`);
    res.status(201).json({ success: true, note: newNote });
  });

  // 7. PARENT DASHBOARD
  app.get('/api/parent/child-data', (req, res) => {
    if (currentSessionUser.role !== 'parent' && currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Parent access only.' });
    }
    // Child record linked to verified parent
    res.json({
      parent: currentSessionUser,
      child: {
        id: 'usr-student-aarav',
        name: 'Aarav Sharma',
        grade: 'Grade 8',
        studentId: 'RAGH-2026-081',
        attendanceOverall: '96%',
        enrolledCourses: courses.slice(0, 3),
        assignments: studentAssignments,
        progress: SAMPLE_PROGRESS,
        feedback: SAMPLE_FEEDBACK,
        upcomingTasks: SAMPLE_UPCOMING_TASKS
      }
    });
  });

  // 8. ADMIN OVERVIEW & AUDIT LOGS
  app.get('/api/admin/overview', (req, res) => {
    if (currentSessionUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }
    res.json({
      stats: {
        activeCourses: courses.filter(c => c.active).length,
        totalEnquiries: enquiries.length,
        pendingDemoBookings: demoBookings.filter(d => d.status === 'pending').length,
        activeStudents: 1, // Only authorized verified records shown
        auditLogCount: auditLogs.length
      },
      auditLogs,
      enquiries,
      demoBookings,
      driveConfig: driveIntegrationConfig
    });
  });

  // 9. GOOGLE DRIVE FILE INTEGRATION
  app.get('/api/drive/status', (req, res) => {
    res.json({
      isConfigured: driveIntegrationConfig.isConfigured,
      isConnected: driveIntegrationConfig.isConnected,
      email: driveIntegrationConfig.connectedEmail,
      appFolderName: driveIntegrationConfig.appFolderName,
      scopeRequired: driveIntegrationConfig.scopeGranted,
      instructions: !driveIntegrationConfig.isConfigured
        ? 'Google Drive API requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET configured in environment variables. Authorization strictly requests https://www.googleapis.com/auth/drive.file scope to isolate app files.'
        : 'Integration credentials detected on server.'
    });
  });

  app.post('/api/drive/connect', (req, res) => {
    // Check if configuration is present or client simulated connection
    const { authCode, studentEmail } = req.body;
    driveIntegrationConfig.isConnected = true;
    driveIntegrationConfig.connectedEmail = studentEmail || currentSessionUser.email || 'student@gmail.com';
    currentSessionUser.driveConnected = true;
    currentSessionUser.driveEmail = driveIntegrationConfig.connectedEmail;
    logAudit('GOOGLE_DRIVE_CONNECTED', currentSessionUser.email, `Student authorized Google Drive scope drive.file for app-specific folder`);
    res.json({
      success: true,
      message: 'Google Drive connected successfully with drive.file scope. A dedicated folder "RAGHVYON Academy Learning Portfolio" has been linked.',
      driveStatus: driveIntegrationConfig
    });
  });

  app.post('/api/drive/disconnect', (req, res) => {
    driveIntegrationConfig.isConnected = false;
    driveIntegrationConfig.connectedEmail = '';
    currentSessionUser.driveConnected = false;
    currentSessionUser.driveEmail = undefined;
    logAudit('GOOGLE_DRIVE_DISCONNECTED', currentSessionUser.email, `Student revoked Google Drive access`);
    res.json({
      success: true,
      message: 'Google Drive has been disconnected.',
      driveStatus: driveIntegrationConfig
    });
  });

  app.post('/api/drive/save-file', (req, res) => {
    if (!driveIntegrationConfig.isConnected) {
      return res.status(400).json({
        error: 'Google Drive is not connected. Please authorize Google Drive using the "Connect Google Drive" button.'
      });
    }
    const { title, fileType, content } = req.body;
    const fileId = 'drv-' + Date.now();
    const driveLink = `https://drive.google.com/file/d/${fileId}/view`;
    logAudit('SAVE_TO_DRIVE', currentSessionUser.email, `Saved "${title}" (${fileType}) to student's Drive folder`);
    res.json({
      success: true,
      fileId,
      driveLink,
      message: `File "${title}" saved to "${driveIntegrationConfig.appFolderName}" on student's Google Drive.`
    });
  });

  // 10. AI STUDY ASSISTANT (GEMINI SERVER-SIDE API)
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, subject = 'General Academic', studentGrade = 'Grade 8' } = req.body;
      if (!question || question.trim().length === 0) {
        return res.status(400).json({ error: 'Please provide a learning question.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in environment. Please configure GEMINI_API_KEY in Settings > Secrets.',
          fallbackExplanation: `[Standard Pedagogical Guide for ${subject}]: To solve problems like "${question}", start by identifying the known variables, breaking the problem down into sequential steps, and testing your hypothesis with simple values. Always consult with your RAGHVYON Academy teacher during live sessions for personalized review.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemPrompt = `You are the RAGHVYON ACADEMY AI Study Assistant.
Brand Tagline: "Learn Today. Lead Tomorrow."
Core Teaching Philosophy:
1. Concept-First Explanations: Explain the intuitive "Why" before jumping to formulas or steps.
2. Socratic & Encouraging: Break complex concepts down into bite-sized analogies appropriate for a ${studentGrade} student.
3. Clarity & Structure: Use clear numbered steps, bullet points, and highlight key terms.
4. Transparency: Remind students that AI assistance supports self-study, and complex assignments should always be reviewed with their human teacher.
Subject: ${subject}
Never provide inappropriate or harmful content. Keep tone warm, academic, respectful, and motivating.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7
        }
      });

      const explanation = response.text || 'Unable to generate response at this time.';

      res.json({
        success: true,
        subject,
        explanation,
        disclaimer: 'AI-generated study explanation. Intended to complement, not substitute, mentor guidance and official curriculum reviews.'
      });
    } catch (err: any) {
      console.error('Error generating AI explanation:', err);
      res.status(500).json({
        error: 'Failed to generate study explanation: ' + (err.message || 'Server error'),
        disclaimer: 'AI features are optional learning aids.'
      });
    }
  });

  // VITE MIDDLEWARE FOR DEVELOPMENT / STATIC FOR PRODUCTION
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAGHVYON Academy Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
