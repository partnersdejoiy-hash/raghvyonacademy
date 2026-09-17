import { Course, TeacherProfile, LearningProgress, Assignment, StudyNote, Certificate, UpcomingTask, TeacherFeedback } from '../types';

export const INITIAL_TEACHER_PROFILE: TeacherProfile = {
  name: 'Lead Academic Mentor & Educator',
  title: 'Founder & Senior Instructor',
  experienceYears: 7,
  studentReach: 'Experience teaching students in India & American students',
  bio: 'With over 7 years of dedicated teaching experience, our lead instructor specializes in building deep mathematical intuition, scientific curiosity, and linguistic clarity. Teaching both Indian curriculum students and US-based students has shaped a culturally adaptive, highly communicative, and concept-first pedagogy.',
  photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=80',
  methodology: [
    'Concept-First Deep Dives (Understanding the "Why" before formulas)',
    'Personalized Diagnostic Pace tailored to each student’s confidence',
    'Interactive Socratic Questioning & Real-World Problem Solving',
    'Continuous Formative Feedback without cognitive overload',
    'Safe, encouraging, student-friendly learning environment'
  ],
  subjectsTaught: [
    'Mathematics (Elementary to Advanced Algebra & Geometry)',
    'General & Applied Science (Physics, Chemistry, Biology)',
    'English Language Arts & Reading Comprehension',
    'Social Studies & World Perspectives',
    'Computer & Practical Digital Skills',
    'Spoken English & Communication Mastery',
    'Competitive Exam Foundation'
  ],
  contactEmail: 'contact@raghvyonacademy.com',
  phone: '+1 (213) 396-0065',
  address: 'House no: J-393, Dakshinpuri, New Delhi-110062'
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-math',
    title: 'Core Mathematics & Analytical Thinking',
    subject: 'Mathematics',
    description: 'Master foundational and advanced mathematical concepts with visual problem solving, mental math strategies, and deep logical reasoning.',
    gradeLevel: 'Grade 3 to Grade 10',
    duration: 'Ongoing / 40 Weeks per Academic Year (Placeholder)',
    fee: 'Custom batch pricing upon consultation (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Senior Math Faculty',
    highlights: [
      'Arithmetic, Pre-Algebra, Algebra I & Geometry',
      'Mental calculation techniques & speed drills',
      'Step-by-step problem breakdown',
      'Interactive visual graphs & geometry manipulatives'
    ],
    syllabusOverview: [
      'Module 1: Number Systems & Operations',
      'Module 2: Fractions, Decimals & Percentages',
      'Module 3: Algebraic Expressions & Equations',
      'Module 4: Spatial Geometry & Measurement',
      'Module 5: Real-World Word Problems & Data'
    ]
  },
  {
    id: 'course-science',
    title: 'Integrated Science & Experimental Thinking',
    subject: 'Science',
    description: 'Cultivate keen scientific observation through interactive models, real-world case studies, and conceptual clarity across Physics, Chemistry, and Biology.',
    gradeLevel: 'Grade 4 to Grade 10',
    duration: '36 Weeks / 3 Classes per Week (Placeholder)',
    fee: 'Enquire for batch details (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Science Specialist',
    highlights: [
      'Interactive 3D representations of scientific phenomena',
      'Concept notes with illustrated diagrams',
      'Inquiry-based learning following CBSE/ICSE & US Standards',
      'Regular formative assessments & doubt clearing'
    ],
    syllabusOverview: [
      'Module 1: Motion, Forces & Energy',
      'Module 2: Matter, Atoms & Chemical Reactions',
      'Module 3: Living Systems & Human Physiology',
      'Module 4: Earth, Environment & Space Science'
    ]
  },
  {
    id: 'course-english',
    title: 'English Language, Grammar & Comprehension',
    subject: 'English',
    description: 'Develop strong reading comprehension, persuasive writing, advanced vocabulary, and flawless grammatical expression.',
    gradeLevel: 'Grade 2 to Grade 9',
    duration: '32 Weeks / 2 Classes per Week (Placeholder)',
    fee: 'Standard tier available (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Language Faculty',
    highlights: [
      'Structural grammar breakdown',
      'Critical reading of classic and modern passages',
      'Creative and expository essay composition',
      'Vocabulary enrichment routines'
    ],
    syllabusOverview: [
      'Module 1: Parts of Speech & Sentence Architecture',
      'Module 2: Active Reading & Inferential Skills',
      'Module 3: Paragraph & Essay Construction',
      'Module 4: Editing, Proofreading & Vocabulary'
    ]
  },
  {
    id: 'course-spoken-english',
    title: 'Spoken English & Confident Public Speaking',
    subject: 'Spoken English',
    description: 'Transform hesitant speakers into articulate, confident communicators with accent refinement, conversational drills, and public speaking practice.',
    gradeLevel: 'Age 7+ & Young Adults',
    duration: '16 Weeks Intensive (Placeholder)',
    fee: 'Specialized batch rate (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Communication Mentor',
    highlights: [
      'One-on-one and small group speaking rotations',
      'Pronunciation, intonation, and rhythm training',
      'Impromptu speaking & speech structuring',
      'Overcoming hesitation and stage fright'
    ],
    syllabusOverview: [
      'Module 1: Everyday Conversational Fluency',
      'Module 2: Pronunciation & Clear Articulation',
      'Module 3: Storytelling & Presentation Skills',
      'Module 4: Debate, Interview & Discussion Etiquette'
    ]
  },
  {
    id: 'course-social-studies',
    title: 'Social Studies & Global Perspectives',
    subject: 'Social Studies',
    description: 'Explore history, geography, civics, and global economies through engaging narratives that connect past events to contemporary global issues.',
    gradeLevel: 'Grade 5 to Grade 9',
    duration: '28 Weeks (Placeholder)',
    fee: 'Standard batch tier (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Humanities Lead',
    highlights: [
      'Interactive historical timelines and maps',
      'Connecting historical causes to modern consequences',
      'Civics, democratic processes, and world geography',
      'Synthesized revision notes'
    ],
    syllabusOverview: [
      'Module 1: Ancient & Modern Civilizations',
      'Module 2: Physical & Human Geography',
      'Module 3: Governance, Rights & Civic Institutions',
      'Module 4: Global Interdependence & Trade'
    ]
  },
  {
    id: 'course-computer-skills',
    title: 'Computer Science, Logic & Digital Skills',
    subject: 'Computer & Skills',
    description: 'Empower young minds with algorithmic thinking, foundational coding concepts, safe internet navigation, and practical productivity tools.',
    gradeLevel: 'Grade 3 to Grade 10',
    duration: '24 Weeks Hands-on (Placeholder)',
    fee: 'Interactive lab access included (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Tech Mentor',
    highlights: [
      'Logic gates, algorithms, and computational thinking',
      'Introduction to programming foundations (Python/Scratch)',
      'Digital literacy, spreadsheets, and document mastery',
      'Safe online habits & cybersecurity basics'
    ],
    syllabusOverview: [
      'Module 1: Fundamentals of Computing & Operating Systems',
      'Module 2: Algorithmic Logic & Flowcharts',
      'Module 3: Visual Coding & Scripting Basics',
      'Module 4: Productivity Tools & Digital Portfolio'
    ]
  },
  {
    id: 'course-exam-prep',
    title: 'Targeted Exam Preparation & Test Strategy',
    subject: 'Exam Preparation',
    description: 'Rigorous preparation focused on past paper analysis, time management strategies, error diagnosis, and exam-day mental conditioning.',
    gradeLevel: 'Grade 8 to Grade 12',
    duration: '12 to 24 Weeks Focused Batches (Placeholder)',
    fee: 'Subject-specific module fee (Placeholder)',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&h=340&q=80',
    demoAvailable: true,
    active: true,
    instructor: 'RAGHVYON Senior Examination Team',
    highlights: [
      'Simulated timed mock tests with in-depth analysis',
      'High-yield topic prioritization and mark schemes',
      'Personalized mistake log reviews',
      'Stress management and pacing coaching'
    ],
    syllabusOverview: [
      'Module 1: Comprehensive Diagnostic & Gap Analysis',
      'Module 2: Core Concept Reinforcement & Drills',
      'Module 3: Speed, Accuracy & Answer Writing Formats',
      'Module 4: Full-Length Proctored Mocks & Debriefs'
    ]
  }
];

export const SAMPLE_STUDENT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    courseId: 'course-math',
    courseName: 'Core Mathematics & Analytical Thinking',
    title: 'Quadratic Equations & Geometric Area Models',
    description: 'Solve the 8 applied word problems showing complete derivation steps and diagrams.',
    dueDate: '2026-09-22',
    status: 'submitted',
    score: 94,
    maxScore: 100,
    submittedAt: '2026-09-15',
    fileName: 'Math_Assignment_Quadratic_Models.pdf',
    driveFileId: 'drv-sample-file-01',
    driveFileLink: '#drive-view-file-01',
    teacherFeedback: 'Great application of factoring models. Note the sign adjustment on Problem 6!'
  },
  {
    id: 'asg-02',
    courseId: 'course-science',
    courseName: 'Integrated Science & Experimental Thinking',
    title: 'Photosynthesis & Light Absorption Investigation',
    description: 'Summarize the light-dependent reaction stage and calculate chlorophyll absorption spectrum values.',
    dueDate: '2026-09-25',
    status: 'pending',
    maxScore: 50
  },
  {
    id: 'asg-03',
    courseId: 'course-english',
    courseName: 'English Language, Grammar & Comprehension',
    title: 'Persuasive Speech Analysis Essay',
    description: 'Write a 400-word analysis exploring rhetorical ethos, pathos, and logos in the assigned historical speech.',
    dueDate: '2026-09-18',
    status: 'graded',
    score: 48,
    maxScore: 50,
    submittedAt: '2026-09-12',
    fileName: 'Persuasive_Speech_Analysis.docx',
    teacherFeedback: 'Outstanding structural thesis statement and excellent vocabulary choices.'
  }
];

export const SAMPLE_STUDENT_NOTES: StudyNote[] = [
  {
    id: 'note-01',
    title: 'Linear Inequalities Quick Reference',
    subject: 'Mathematics',
    summary: 'Rules for flipping inequality signs when multiplying/dividing by negative coefficients.',
    content: '1. Addition & Subtraction: Never change the inequality sign.\n2. Multiplication & Division: If by a NEGATIVE number, reverse the direction.\n3. Graphing: Open circle for < or >, Closed circle for <= or >=.',
    updatedAt: '2026-09-14',
    driveSaved: true,
    driveFileLink: '#drive-note-01'
  },
  {
    id: 'note-02',
    title: 'Newtonian Mechanics Summary & Formula Sheet',
    subject: 'Science',
    summary: 'First, second, and third laws with free-body diagram breakdown.',
    content: 'Law 1 (Inertia): Objects maintain state unless acted on by external unbalanced force.\nLaw 2: F = ma\nLaw 3: Every action has an equal and opposite reaction.\nConservation of Momentum: Total initial momentum = Total final momentum.',
    updatedAt: '2026-09-10',
    driveSaved: false
  },
  {
    id: 'note-03',
    title: 'Vocabulary Boost: Rhetorical & Literary Devices',
    subject: 'English',
    summary: 'Key terminology for advanced reading comprehension and persuasive writing.',
    content: 'Metaphor: Direct comparison without like/as.\nHyperbole: Deliberate exaggeration for emphasis.\nAlliteration: Repetition of initial consonant sounds.\nJuxtaposition: Placing two contrasting elements side by side.',
    updatedAt: '2026-09-08',
    driveSaved: true,
    driveFileLink: '#drive-note-03'
  }
];

export const SAMPLE_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-01',
    title: 'Excellence in Mathematical Logic & Problem Solving',
    studentName: 'Aarav Sharma',
    courseName: 'Core Mathematics & Analytical Thinking',
    issueDate: 'August 2026',
    gradeAchieved: 'Grade A+ (Distinction)',
    verificationCode: 'RAGH-2026-MATH-091'
  },
  {
    id: 'cert-02',
    title: 'Junior Orator & Spoken English Certification',
    studentName: 'Aarav Sharma',
    courseName: 'Spoken English & Confident Public Speaking',
    issueDate: 'June 2026',
    gradeAchieved: 'Honor Roll',
    verificationCode: 'RAGH-2026-ENG-442'
  }
];

export const SAMPLE_PROGRESS: LearningProgress[] = [
  {
    subject: 'Mathematics',
    completedLessons: 28,
    totalLessons: 36,
    scoreAvg: 92,
    attendancePercentage: 96
  },
  {
    subject: 'Science',
    completedLessons: 22,
    totalLessons: 32,
    scoreAvg: 88,
    attendancePercentage: 93
  },
  {
    subject: 'English',
    completedLessons: 20,
    totalLessons: 24,
    scoreAvg: 95,
    attendancePercentage: 100
  },
  {
    subject: 'Computer & Skills',
    completedLessons: 14,
    totalLessons: 18,
    scoreAvg: 90,
    attendancePercentage: 94
  }
];

export const SAMPLE_UPCOMING_TASKS: UpcomingTask[] = [
  {
    id: 'task-1',
    title: 'Review Chapter 5 Geometry Theorem Proofs',
    courseName: 'Core Mathematics',
    dueDate: 'Tomorrow at 5:00 PM',
    priority: 'high',
    completed: false
  },
  {
    id: 'task-2',
    title: 'Submit Science Lab Simulation Report',
    courseName: 'Integrated Science',
    dueDate: 'Friday at 6:00 PM',
    priority: 'medium',
    completed: false
  },
  {
    id: 'task-3',
    title: 'Spoken English Topic Prep: "My Favorite Invention"',
    courseName: 'Spoken English',
    dueDate: 'Saturday at 11:00 AM',
    priority: 'low',
    completed: true
  }
];

export const SAMPLE_FEEDBACK: TeacherFeedback[] = [
  {
    id: 'fb-1',
    courseName: 'Core Mathematics',
    date: '2026-09-14',
    teacherName: 'Senior Math Faculty',
    comment: 'Aarav has shown outstanding improvement in coordinate geometry and area calculations. He actively asks clarifying questions and helps verify peer solutions.',
    strengths: ['Analytical rigor', 'Attention to sign convention', 'Active class participation'],
    focusAreas: ['Speed on multi-step fraction word problems'],
    rating: 5
  },
  {
    id: 'fb-2',
    courseName: 'Integrated Science',
    date: '2026-09-07',
    teacherName: 'Science Specialist',
    comment: 'Thorough understanding of electrical circuits and Ohm’s Law. Lab analysis was clearly structured with labeled schematics.',
    strengths: ['Scientific vocabulary', 'Diagram precision'],
    focusAreas: ['Unit conversions for milli-amps'],
    rating: 4.8
  }
];

export const SAMPLE_ENQUIRIES = [
  {
    id: 'enq-01',
    parentName: 'Sunita Sharma',
    email: 'sunita.sharma@parent.raghvyon.com',
    phone: '+91 98765 43210',
    gradeLevel: 'Grade 8',
    subject: 'Mathematics',
    message: 'Interested in personalized 1-on-1 pacing for Algebra and Geometry competitions.',
    createdAt: '2026-09-15',
    status: 'contacted' as const
  },
  {
    id: 'enq-02',
    parentName: 'David Miller',
    email: 'david.miller@gmail.com',
    phone: '+1 213 555 0192',
    gradeLevel: 'US Middle School',
    subject: 'Science',
    message: 'Seeking Common Core curriculum prep and interactive science foundations for 7th grader.',
    createdAt: '2026-09-14',
    status: 'new' as const
  }
];

export const SAMPLE_DEMO_BOOKINGS = [
  {
    id: 'demo-01',
    studentName: 'Aarav Sharma',
    parentName: 'Sunita Sharma',
    phone: '+91 98765 43210',
    email: 'sunita.sharma@parent.raghvyon.com',
    gradeLevel: 'Grade 8',
    subject: 'Mathematics',
    preferredDate: '2026-09-18',
    preferredTimeSlot: '5:00 PM - 6:00 PM IST (Evening)',
    status: 'confirmed' as const,
    createdAt: '2026-09-15'
  },
  {
    id: 'demo-02',
    studentName: 'Maya Miller',
    parentName: 'David Miller',
    phone: '+1 213 555 0192',
    email: 'david.miller@gmail.com',
    gradeLevel: 'US Middle School',
    subject: 'Science',
    preferredDate: '2026-09-19',
    preferredTimeSlot: 'US Evening Slot (EST 6:00 PM)',
    status: 'pending' as const,
    createdAt: '2026-09-14'
  }
];

// Convenient exported aliases
export const initialCourses = INITIAL_COURSES;
export const initialTeacherProfile = INITIAL_TEACHER_PROFILE;
export const sampleAssignments = SAMPLE_STUDENT_ASSIGNMENTS;
export const sampleNotes = SAMPLE_STUDENT_NOTES;
export const sampleCertificates = SAMPLE_CERTIFICATES;
export const sampleProgress = SAMPLE_PROGRESS;
export const sampleTasks = SAMPLE_UPCOMING_TASKS;
export const sampleFeedback = SAMPLE_FEEDBACK;
export const sampleEnquiries = SAMPLE_ENQUIRIES;
export const sampleDemoBookings = SAMPLE_DEMO_BOOKINGS;
