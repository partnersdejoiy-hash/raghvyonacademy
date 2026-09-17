/**
 * Typed API client. All auth state lives in httpOnly session cookies —
 * the browser never sees tokens, and role is always decided by the server.
 *
 * DEPLOYMENT: The frontend (static) and the API (Express) may live on
 * different origins. Set VITE_API_URL at build time (e.g.
 * https://raghvyon-backend.onrender.com) to point at the API server.
 * When unset, requests go to the same origin (preview/dev & single-host prod).
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiUrl = (path: string): string => `${API_BASE}/api${path}`;

export interface ApiUser {
  id: string;
  numericId?: number;
  name: string;
  email: string;
  role: 'guest' | 'student' | 'parent' | 'admin';
  avatar?: string;
  grade?: string;
  studentId?: string;
  googleEmail?: string;
}

export interface ApiCourse {
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
  curriculumOutline?: any[];
  instructor?: string;
}

export interface ApiAssignment {
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

export interface ApiNote {
  id: string;
  title: string;
  subject: string;
  summary: string;
  content: string;
  updatedAt: string;
  driveSaved: boolean;
  driveFileLink?: string;
}

export interface ApiCertificate {
  id: string;
  title: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  gradeAchieved: string;
  verificationCode: string;
}

export interface ApiProgress {
  subject: string;
  completedLessons: number;
  totalLessons: number;
  scoreAvg: number;
  attendancePercentage: number;
}

export interface ApiTask {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

export interface ApiDriveStatus {
  isConnected: boolean;
  isConfigured?: boolean;
  connectedEmail?: string;
  storageLocation?: string;
  folderName?: string;
  rootFolderId?: string;
  scope?: string;
  connectedAt?: string;
  lastVerifiedAt?: string;
}

export interface StudentDashboardData {
  profile: ApiUser;
  enrolledCourses: ApiCourse[];
  assignments: ApiAssignment[];
  notes: ApiNote[];
  certificates: ApiCertificate[];
  progress: ApiProgress[];
  upcomingTasks: ApiTask[];
  driveStatus: ApiDriveStatus;
}

export interface ParentChildData {
  child: {
    profile: ApiUser;
    enrolledCourses: ApiCourse[];
    assignments: ApiAssignment[];
    progress: ApiProgress[];
    upcomingTasks: ApiTask[];
    certificates: ApiCertificate[];
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  config: () => request<{ googleSignIn: boolean; driveOAuth: boolean; gemini: boolean; demoMode: boolean }>('/config'),
  session: () => request<{ user: ApiUser | null }>('/auth/session'),

  login: (email: string, password: string) =>
    request<{ user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  switchRoleDemo: (role: 'student' | 'parent' | 'admin') =>
    request<{ user: ApiUser }>('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),

  courses: () => request<{ courses: ApiCourse[] }>('/courses'),
  teacherProfile: () => request<{ teacherProfile: any }>('/teacher-profile'),

  studentDashboard: () => request<StudentDashboardData>('/student/dashboard'),
  createNote: (payload: { title: string; subject: string; summary?: string; content?: string; saveToDrive?: boolean }) =>
    request<{ note: ApiNote; error?: string }>('/student/notes', { method: 'POST', body: JSON.stringify(payload) }),
  submitAssignment: (assignmentId: string, file: File | null, saveToDrive: boolean) => {
    const form = new FormData();
    if (file) form.append('file', file);
    form.append('saveToDrive', String(saveToDrive));
    return fetch(apiUrl(`/student/assignments/${assignmentId}/submit`), {
      method: 'POST',
      credentials: 'include',
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Submission failed');
      return data;
    });
  },
  deleteAccount: () => request<{ success: boolean; message: string }>('/student/delete-account', { method: 'POST' }),

  driveStatus: () => request<ApiDriveStatus>('/drive/status'),
  driveFolderLink: () => request<{ url: string }>('/drive/folder-link'),
  driveFiles: () => request<{ files: Array<{ kind: string; name: string; driveFileId: string; link?: string; date: string }> }>('/student/drive/files'),
  driveDisconnect: () =>
    request<{ success: boolean; message: string }>('/drive/disconnect', { method: 'POST', body: JSON.stringify({ revoke: true }) }),

  parentChildren: () =>
    request<{ children: Array<{ id: number; profile: ApiUser; driveConnected: boolean }> }>('/parent/children'),
  parentChildData: (studentId: number) => request<ParentChildData>(`/parent/child-data/${studentId}`),

  adminOverview: () =>
    request<{ stats: Record<string, number> }>('/admin/overview'),
  adminEnquiries: () => request<{ enquiries: any[] }>('/admin/enquiries'),
  adminDemoBookings: () => request<{ demoBookings: any[] }>('/admin/demo-bookings'),
  adminUsers: () => request<{ users: any[] }>('/admin/users'),
  adminParentLinks: () => request<{ links: any[] }>('/admin/parent-links'),
  adminDriveConnections: () => request<{ connections: any[] }>('/admin/drive-connections'),
  adminAuditLogs: () => request<{ logs: any[] }>('/admin/audit-logs'),
  adminUpdateEnquiry: (id: string, status: string) =>
    request<{ success: boolean }>(`/admin/enquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminUpdateBooking: (id: string, status: string) =>
    request<{ success: boolean }>(`/admin/demo-bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminToggleCourse: (id: string) =>
    request<{ success: boolean; active: boolean }>(`/admin/courses/${id}/status`, { method: 'PATCH' }),
  adminAddCourse: (payload: any) =>
    request<{ success: boolean }>('/admin/courses', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateTeacher: (payload: any) =>
    request<{ teacherProfile: any }>('/admin/teacher-profile', { method: 'PUT', body: JSON.stringify(payload) }),

  askAI: (payload: { question: string; subject?: string; gradeLevel?: string }) =>
    request<{ explanation: string; disclaimer?: string; fallbackExplanation?: string }>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  bookDemo: (payload: any) =>
    request<{ success: boolean }>('/demo-bookings', { method: 'POST', body: JSON.stringify(payload) }),
  submitEnquiry: (payload: any) =>
    request<{ success: boolean }>('/enquiries', { method: 'POST', body: JSON.stringify(payload) }),
};
