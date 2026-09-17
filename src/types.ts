export type UserRole = 'guest' | 'student' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  grade?: string;
  studentId?: string;
  linkedChildId?: string;
  linkedChildName?: string;
  parentEmail?: string;
  driveConnected?: boolean;
  driveEmail?: string;
  createdAt?: string;
}

export interface CurriculumWeek {
  weekNumber: number;
  title: string;
  topics: string[];
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  gradeLevel: string;
  duration: string;
  fee: string;
  imageUrl?: string;
  demoAvailable?: boolean;
  active: boolean;
  highlights: string[];
  syllabusOverview?: string[];
  curriculumOutline?: CurriculumWeek[];
  instructor?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
  submittedAt?: string;
  fileName?: string;
  driveFileId?: string;
  driveFileLink?: string;
  teacherFeedback?: string;
}

export interface StudyNote {
  id: string;
  studentId?: string;
  title: string;
  subject: string;
  summary: string;
  content: string;
  updatedAt: string;
  driveSaved: boolean;
  driveFileLink?: string;
}

export interface Certificate {
  id: string;
  title: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  gradeAchieved: string;
  verificationCode: string;
}

export interface LearningProgress {
  subject: string;
  completedLessons: number;
  totalLessons: number;
  scoreAvg: number;
  attendancePercentage: number;
}

export interface UpcomingTask {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface TeacherFeedback {
  id: string;
  courseName: string;
  date: string;
  teacherName: string;
  comment: string;
  strengths: string[];
  focusAreas: string[];
  rating: number; // 1-5
}

export interface TeacherProfile {
  name: string;
  title: string;
  experienceYears: number;
  studentReach: string;
  bio: string;
  methodology: string[];
  subjectsTaught: string[];
  contactEmail: string;
  phone: string;
  address: string;
  photoUrl?: string;
}

export interface Enquiry {
  id: string;
  parentName?: string;
  studentName?: string;
  name?: string;
  email: string;
  phone: string;
  gradeLevel?: string;
  studentGrade?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted' | 'resolved';
}

export type EnquiryRecord = Enquiry;

export interface DemoBooking {
  id: string;
  parentName: string;
  studentName: string;
  gradeLevel?: string;
  studentGrade?: string;
  subject: string;
  preferredDate: string;
  preferredTimeSlot: string;
  phone: string;
  email?: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
}

export type DemoBookingRecord = DemoBooking;

export interface GoogleDriveStatus {
  isConfigured?: boolean;
  isConnected: boolean;
  connectedEmail?: string;
  email?: string;
  scopeGranted?: string;
  scopes?: string[];
  appFolderName?: string;
  folderName?: string;
  folderId?: string;
  instructions?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  subject: string;
  quote: string;
  highlight: string;
  verified: boolean;
}
