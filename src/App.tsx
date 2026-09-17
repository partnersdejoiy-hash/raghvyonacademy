import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Hero 
} from './components/Hero';
import { 
  TrustTeacherSection 
} from './components/TrustTeacherSection';
import { 
  SubjectsCoursesSection 
} from './components/SubjectsCoursesSection';
import { 
  TeachingApproachSection 
} from './components/TeachingApproachSection';
import { 
  TestimonialsSection 
} from './components/TestimonialsSection';
import { 
  Footer 
} from './components/Footer';
import { 
  PortalLoadingFallback 
} from './components/PortalLoadingFallback';

// Code Splitting: Lazy-loaded Dashboards and Portals
const StudentDashboard = lazy(() =>
  import('./components/StudentDashboard').then(m => ({ default: m.StudentDashboard }))
);
const ParentDashboard = lazy(() =>
  import('./components/ParentDashboard').then(m => ({ default: m.ParentDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const DocumentationView = lazy(() =>
  import('./components/DocumentationView').then(m => ({ default: m.DocumentationView }))
);

// Code Splitting: Lazy-loaded Modals
const LoginModal = lazy(() =>
  import('./components/LoginModal').then(m => ({ default: m.LoginModal }))
);
const DemoBookingModal = lazy(() =>
  import('./components/DemoBookingModal').then(m => ({ default: m.DemoBookingModal }))
);
const EnquiryModal = lazy(() =>
  import('./components/EnquiryModal').then(m => ({ default: m.EnquiryModal }))
);
const CourseDetailModal = lazy(() =>
  import('./components/CourseDetailModal').then(m => ({ default: m.CourseDetailModal }))
);
const AIStudyAssistantModal = lazy(() =>
  import('./components/AIStudyAssistantModal').then(m => ({ default: m.AIStudyAssistantModal }))
);
import { 
  UserProfile, 
  Course, 
  TeacherProfile, 
  Assignment, 
  StudyNote, 
  Certificate, 
  LearningProgress, 
  UpcomingTask, 
  TeacherFeedback, 
  GoogleDriveStatus, 
  Enquiry, 
  DemoBooking, 
  UserRole 
} from './types';
import { 
  initialCourses, 
  initialTeacherProfile, 
  sampleAssignments, 
  sampleNotes, 
  sampleCertificates, 
  sampleProgress, 
  sampleTasks, 
  sampleFeedback, 
  sampleEnquiries, 
  sampleDemoBookings 
} from './data/initialData';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Globe2
} from 'lucide-react';

export default function App() {
  // Current Active View: 'home' | 'student' | 'parent' | 'admin' | 'docs'
  const [currentView, setCurrentView] = useState<'home' | 'student' | 'parent' | 'admin' | 'docs'>('home');

  // Active User State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'guest_1',
    name: 'Guest Visitor',
    email: '',
    role: 'guest'
  });

  // Domain State (with initial mock fallback and API sync)
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(initialTeacherProfile);
  const [assignments, setAssignments] = useState<Assignment[]>(sampleAssignments);
  const [notes, setNotes] = useState<StudyNote[]>(sampleNotes);
  const [certificates, setCertificates] = useState<Certificate[]>(sampleCertificates);
  const [progress, setProgress] = useState<LearningProgress[]>(sampleProgress);
  const [tasks, setTasks] = useState<UpcomingTask[]>(sampleTasks);
  const [feedback, setFeedback] = useState<TeacherFeedback[]>(sampleFeedback);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(sampleEnquiries);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>(sampleDemoBookings);

  // Google Drive Status
  const [driveStatus, setDriveStatus] = useState<GoogleDriveStatus>({
    isConnected: false,
    folderName: 'RAGHVYON Academy Learning Portfolio',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  // Modal Visibility States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false);
  const [aiAssistantInitialTopic, setAiAssistantInitialTopic] = useState<string | undefined>(undefined);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [modalPreselectedCourse, setModalPreselectedCourse] = useState<Course | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial Fetch from backend server
  useEffect(() => {
    // Fetch courses
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCourses(data);
      })
      .catch(() => {
        // Fallback already populated via initialCourses
      });

    // Fetch teacher profile
    fetch('/api/teacher-profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setTeacherProfile(data);
      })
      .catch(() => {});

    // Check Google Drive status
    fetch('/api/drive/status')
      .then(res => res.json())
      .then(data => {
        if (data) setDriveStatus(data);
      })
      .catch(() => {});
  }, []);

  // Navigation Handler
  const handleNavigate = (view: 'home' | 'student' | 'parent' | 'admin' | 'docs', sectionId?: string) => {
    setCurrentView(view);
    if (view === 'home' && sectionId) {
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Login Handler
  const handleLogin = (email: string, role: UserRole) => {
    if (role === 'student') {
      setCurrentUser({
        id: 'std_01',
        name: 'Aarav Sharma',
        email: email || 'aarav.sharma@student.raghvyon.com',
        role: 'student',
        studentId: 'RAGH-2026-081',
        grade: 'Grade 8',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80'
      });
      setCurrentView('student');
      showToast('Signed in to Student Portal as Aarav Sharma (Grade 8)');
    } else if (role === 'parent') {
      setCurrentUser({
        id: 'prt_01',
        name: 'Sunita Sharma',
        email: email || 'sunita.sharma@parent.raghvyon.com',
        role: 'parent',
        linkedChildId: 'std_01',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'
      });
      setCurrentView('parent');
      showToast('Signed in to Parent Portal (Viewing Aarav Sharma, Grade 8)');
    } else if (role === 'admin') {
      setCurrentUser({
        id: 'adm_01',
        name: 'Academy Administrator',
        email: email || 'admin@raghvyonacademy.com',
        role: 'admin'
      });
      setCurrentView('admin');
      showToast('Signed in to Faculty Administration Portal');
    }
  };

  const handleLogout = () => {
    setCurrentUser({
      id: 'guest_1',
      name: 'Guest Visitor',
      email: '',
      role: 'guest'
    });
    setCurrentView('home');
    showToast('Successfully signed out.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to request data erasure? All student logs and assignments will be scheduled for permanent removal.')) {
      handleLogout();
      showToast('Account data erasure request logged with Academy Administrator.');
    }
  };

  // Google Drive Actions
  const handleConnectDrive = () => {
    setDriveStatus({
      isConnected: true,
      connectedEmail: currentUser.email || 'aarav.student@gmail.com',
      folderId: 'folder_raghvyon_drive_081',
      folderName: 'RAGHVYON Academy Learning Portfolio',
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    showToast('Google Drive connected! Isolated educational folder ready: RAGHVYON Academy Learning Portfolio');
  };

  const handleDisconnectDrive = () => {
    setDriveStatus({
      isConnected: false,
      folderName: 'RAGHVYON Academy Learning Portfolio',
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    showToast('Google Drive access disconnected.');
  };

  // Student Actions
  const handleSubmitAssignment = (assignmentId: string, fileName: string, saveToDrive: boolean) => {
    setAssignments(prev => prev.map(asg => {
      if (asg.id === assignmentId) {
        return {
          ...asg,
          status: 'submitted',
          submittedAt: 'Today',
          fileName
        };
      }
      return asg;
    }));

    if (saveToDrive) {
      showToast(`Assignment submitted & archived to Google Drive Portfolio (${fileName})`);
    } else {
      showToast(`Assignment submitted successfully: ${fileName}`);
    }
  };

  const handleCreateNote = (title: string, subject: string, content: string, saveToDrive: boolean) => {
    const newNote: StudyNote = {
      id: `note_${Date.now()}`,
      studentId: currentUser.id,
      title,
      subject,
      content,
      summary: content.slice(0, 80) + '...',
      updatedAt: 'Just now',
      driveSaved: saveToDrive
    };
    setNotes(prev => [newNote, ...prev]);

    if (saveToDrive) {
      showToast(`Note "${title}" created and synced to Google Drive Portfolio!`);
    } else {
      showToast(`Note "${title}" saved to your personal study notebook.`);
    }
  };

  // Demo Booking & Enquiry Form Submissions
  const handleDemoBookingSubmit = async (bookingData: any) => {
    try {
      const res = await fetch('/api/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (data.booking) {
        setDemoBookings(prev => [data.booking, ...prev]);
      }
    } catch {
      // Local fallback
      setDemoBookings(prev => [{
        id: `demo_${Date.now()}`,
        status: 'pending',
        createdAt: 'Just now',
        ...bookingData
      }, ...prev]);
    }
    showToast('Free Demo Class Request Received! Our faculty will confirm via WhatsApp.');
  };

  const handleEnquirySubmit = async (enquiryData: any) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData)
      });
      const data = await res.json();
      if (data.enquiry) {
        setEnquiries(prev => [data.enquiry, ...prev]);
      }
    } catch {
      setEnquiries(prev => [{
        id: `enq_${Date.now()}`,
        status: 'new',
        createdAt: 'Just now',
        ...enquiryData
      }, ...prev]);
    }
    showToast('Enquiry Submitted! We will respond within 4 hours.');
  };

  // Admin Actions
  const handleAddCourse = async (newCourseData: Partial<Course>) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourseData)
      });
      const data = await res.json();
      if (data.course) {
        setCourses(prev => [...prev, data.course]);
      }
    } catch {
      const courseWithId: Course = {
        id: `course_${Date.now()}`,
        title: newCourseData.title || 'New Course',
        subject: newCourseData.subject || 'Mathematics',
        gradeLevel: newCourseData.gradeLevel || 'Grades 6–8',
        description: newCourseData.description || '',
        duration: newCourseData.duration || '12 Weeks',
        fee: newCourseData.fee || 'Contact for Batch Pricing',
        highlights: newCourseData.highlights || [],
        curriculumOutline: newCourseData.curriculumOutline || [],
        active: true
      };
      setCourses(prev => [...prev, courseWithId]);
    }
    showToast(`Course "${newCourseData.title}" successfully added!`);
  };

  const handleToggleCourseStatus = (courseId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, active: !c.active } : c));
    showToast('Course visibility status updated.');
  };

  const handleUpdateTeacherProfile = (updatedProfile: Partial<TeacherProfile>) => {
    setTeacherProfile(prev => ({ ...prev, ...updatedProfile }));
    showToast('Teacher profile credentials and bio updated.');
  };

  const handleUpdateEnquiryStatus = (id: string, status: Enquiry['status']) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    showToast(`Enquiry marked as ${status}.`);
  };

  const handleUpdateBookingStatus = (id: string, status: DemoBooking['status']) => {
    setDemoBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Demo booking marked as ${status}.`);
  };

  // Open modal helpers
  const handleOpenDemoWithCourse = (course?: Course) => {
    setModalPreselectedCourse(course || null);
    setIsDemoModalOpen(true);
  };

  const handleOpenEnquiryWithCourse = (course?: Course) => {
    setModalPreselectedCourse(course || null);
    setIsEnquiryModalOpen(true);
  };

  const handleOpenAIAssistant = (topic?: string) => {
    setAiAssistantInitialTopic(topic);
    setIsAIAssistantModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EE] text-[#172B4D] selection:bg-[#35B8A6] selection:text-white font-sans antialiased">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B4D] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-[#35B8A6]/40 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#35B8A6] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-gray-400 hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenDemoBooking={() => handleOpenDemoWithCourse()}
        onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* Hero Section with Interactive 3D Mascot & Academic Geometry */}
            <Hero
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onExploreCourses={() => handleNavigate('home', 'courses')}
            />

            {/* Verified Faculty Trust Section */}
            <TrustTeacherSection
              teacherProfile={teacherProfile}
              onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
            />

            {/* Subjects & Interactive Courses Section */}
            <SubjectsCoursesSection
              courses={courses}
              onOpenDemoBooking={(c) => handleOpenDemoWithCourse(c)}
              onOpenEnquiry={(c) => handleOpenEnquiryWithCourse(c)}
              onSelectCourse={(c) => setSelectedCourseForDetail(c)}
            />

            {/* Concept-Focused Teaching Approach Section */}
            <TeachingApproachSection
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
            />

            {/* Verified Student & Parent Testimonials Section */}
            <TestimonialsSection
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
            />

            {/* Direct WhatsApp Call to Action & Delhi Center Address Banner */}
            <section id="contact" className="py-16 sm:py-20 bg-white border-t border-[#2454A6]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-[#FFF9EE] to-white rounded-3xl p-8 sm:p-12 border-2 border-[#2454A6]/15 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center space-x-1.5 bg-white border border-[#2454A6]/15 px-3 py-1 rounded-full text-xs font-bold text-[#2454A6]">
                        <Globe2 className="w-3.5 h-3.5 text-[#35B8A6]" />
                        <span>DELHI ACADEMY & GLOBAL ONLINE CLASSROOMS</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2454A6] tracking-tight">
                        Have Questions Regarding Curriculum or Batches?
                      </h2>
                      <p className="text-sm sm:text-base text-[#172B4D]/75 max-w-xl">
                        Connect directly with our lead academic mentor on WhatsApp or book a free 45-minute concept diagnostic assessment.
                      </p>
                      
                      <div className="pt-2 text-xs font-semibold text-gray-500">
                        Official Premises: House no: J-393, Dakshinpuri, New Delhi-110062
                      </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                      <a
                        href="https://wa.me/12133960065"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 text-center"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Chat on WhatsApp (+1 213 396-0065)</span>
                      </a>

                      <button
                        onClick={() => handleOpenDemoWithCourse()}
                        className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Schedule Free Demo Session</span>
                        <ArrowRight className="w-4 h-4 text-[#F7C948]" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: STUDENT DASHBOARD */}
        {currentView === 'student' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Student Learning Portal..." />}>
            <StudentDashboard
              user={currentUser}
              enrolledCourses={courses.slice(0, 3)}
              assignments={assignments}
              notes={notes}
              certificates={certificates}
              progress={progress}
              tasks={tasks}
              feedback={feedback}
              driveStatus={driveStatus}
              onConnectDrive={handleConnectDrive}
              onDisconnectDrive={handleDisconnectDrive}
              onSubmitAssignment={handleSubmitAssignment}
              onCreateNote={handleCreateNote}
              onOpenAIAssistant={handleOpenAIAssistant}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
            />
          </Suspense>
        )}

        {/* VIEW 3: PARENT DASHBOARD */}
        {currentView === 'parent' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Parent Oversight Portal..." />}>
            <ParentDashboard
              parentUser={currentUser}
              childProfile={{
                name: 'Aarav Sharma',
                grade: 'Grade 8',
                studentId: 'RAGH-2026-081',
                attendanceOverall: '96%',
                enrolledCourses: courses.slice(0, 3),
                assignments,
                progress,
                feedback
              }}
              onOpenConsultationRequest={() => {
                handleOpenEnquiryWithCourse();
                showToast('Consultation request form opened.');
              }}
              onLogout={handleLogout}
            />
          </Suspense>
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Faculty Administration Portal..." />}>
            <AdminDashboard
              adminUser={currentUser}
              courses={courses}
              teacherProfile={teacherProfile}
              enquiries={enquiries}
              demoBookings={demoBookings}
              onAddCourse={handleAddCourse}
              onToggleCourseStatus={handleToggleCourseStatus}
              onUpdateTeacherProfile={handleUpdateTeacherProfile}
              onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onLogout={handleLogout}
            />
          </Suspense>
        )}

        {/* VIEW 5: DOCUMENTATION & SPECIFICATIONS */}
        {currentView === 'docs' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Academy Architectural Documentation..." />}>
            <DocumentationView />
          </Suspense>
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenDemoBooking={() => handleOpenDemoWithCourse()}
        onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Code-Split Modals rendered on demand */}
      <Suspense fallback={<PortalLoadingFallback isModal />}>
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLogin}
          />
        )}

        {isDemoModalOpen && (
          <DemoBookingModal
            isOpen={isDemoModalOpen}
            onClose={() => { setIsDemoModalOpen(false); setModalPreselectedCourse(null); }}
            preselectedCourse={modalPreselectedCourse}
            onBookingSubmitted={handleDemoBookingSubmit}
          />
        )}

        {isEnquiryModalOpen && (
          <EnquiryModal
            isOpen={isEnquiryModalOpen}
            onClose={() => { setIsEnquiryModalOpen(false); setModalPreselectedCourse(null); }}
            preselectedCourse={modalPreselectedCourse}
            onEnquirySubmitted={handleEnquirySubmit}
          />
        )}

        {selectedCourseForDetail && (
          <CourseDetailModal
            course={selectedCourseForDetail}
            onClose={() => setSelectedCourseForDetail(null)}
            onBookDemo={(c) => { setSelectedCourseForDetail(null); handleOpenDemoWithCourse(c); }}
            onEnquire={(c) => { setSelectedCourseForDetail(null); handleOpenEnquiryWithCourse(c); }}
          />
        )}

        {isAIAssistantModalOpen && (
          <AIStudyAssistantModal
            isOpen={isAIAssistantModalOpen}
            onClose={() => setIsAIAssistantModalOpen(false)}
            initialTopic={aiAssistantInitialTopic}
          />
        )}
      </Suspense>

    </div>
  );
}
