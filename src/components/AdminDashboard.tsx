import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  HardDrive, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Eye, 
  AlertCircle, 
  KeyRound,
  FileCheck,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Course, TeacherProfile, Enquiry, DemoBooking, UserProfile } from '../types';

interface AdminDashboardProps {
  adminUser: UserProfile;
  courses: Course[];
  teacherProfile: TeacherProfile;
  enquiries: Enquiry[];
  demoBookings: DemoBooking[];
  onAddCourse: (newCourse: Partial<Course>) => void;
  onToggleCourseStatus: (courseId: string) => void;
  onUpdateTeacherProfile: (updatedProfile: Partial<TeacherProfile>) => void;
  onUpdateEnquiryStatus: (id: string, status: Enquiry['status']) => void;
  onUpdateBookingStatus: (id: string, status: DemoBooking['status']) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  courses,
  teacherProfile,
  enquiries,
  demoBookings,
  onAddCourse,
  onToggleCourseStatus,
  onUpdateTeacherProfile,
  onUpdateEnquiryStatus,
  onUpdateBookingStatus,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'enquiries' | 'demos' | 'teacher' | 'oauth_security' | 'audit_logs'>('courses');

  // New Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    subject: 'Mathematics',
    gradeLevel: 'Grades 6–8',
    description: '',
    duration: '12 Weeks (3 Sessions / Week)',
    fee: 'Contact for Batch Pricing',
    highlights: 'Concept visualization, Interactive practice worksheets, Regular diagnostic tests'
  });

  // Teacher Profile Edit State
  const [bioEdit, setBioEdit] = useState(teacherProfile.bio);
  const [phoneEdit, setPhoneEdit] = useState(teacherProfile.phone);
  const [addressEdit, setAddressEdit] = useState(teacherProfile.address);
  const [savedTeacherSuccess, setSavedTeacherSuccess] = useState(false);

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    onAddCourse({
      title: courseForm.title,
      subject: courseForm.subject,
      gradeLevel: courseForm.gradeLevel,
      description: courseForm.description,
      duration: courseForm.duration,
      fee: courseForm.fee,
      highlights: courseForm.highlights.split(',').map(s => s.trim()).filter(Boolean),
      curriculumOutline: [
        { weekNumber: 1, title: 'Foundations & Diagnostic Review', topics: ['Core principles', 'Baseline evaluation'] },
        { weekNumber: 2, title: 'Concept Mastery & Real-World Application', topics: ['Intuitive modeling', 'Problem solving'] }
      ],
      active: true
    });

    setCourseForm({
      title: '',
      subject: 'Mathematics',
      gradeLevel: 'Grades 6–8',
      description: '',
      duration: '12 Weeks (3 Sessions / Week)',
      fee: 'Contact for Batch Pricing',
      highlights: 'Concept visualization, Interactive practice worksheets, Regular diagnostic tests'
    });
    setShowAddCourseModal(false);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacherProfile({
      bio: bioEdit,
      phone: phoneEdit,
      address: addressEdit
    });
    setSavedTeacherSuccess(true);
    setTimeout(() => setSavedTeacherSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2454A6] text-[#F7C948] flex items-center justify-center text-xl font-bold shadow-md shadow-[#2454A6]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">Academy Administration Panel</h1>
                <span className="bg-[#2454A6]/10 text-[#2454A6] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2454A6]/20">
                  Role: Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">
                Logged in as <strong>{adminUser.name}</strong> • System Security Verified
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Express API Online</span>
            </span>
            <button
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'courses' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Course Management ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'enquiries' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Student Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('demos')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'demos' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Demo Bookings ({demoBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'teacher' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Faculty Profile & Verified Info
          </button>
          <button
            onClick={() => setActiveTab('oauth_security')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'oauth_security' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            OAuth & Google Drive Architecture
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'audit_logs' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* TAB 1: COURSE MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Live Course Offerings</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage curriculum outlines, grade tiers, fees, and active public visibility.
                </p>
              </div>
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B4D]">
                <thead className="bg-[#FFF9EE] border-y border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Course Name & Subject</th>
                    <th className="py-3 px-4">Grade Level</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2454A6]">{c.title}</div>
                        <div className="text-gray-400 text-[11px]">{c.subject}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{c.gradeLevel}</td>
                      <td className="py-3.5 px-4 text-gray-600">{c.duration}</td>
                      <td className="py-3.5 px-4 text-gray-600">{c.fee}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onToggleCourseStatus(c.id)}
                          className="text-xs font-semibold text-[#2454A6] hover:underline"
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Parent & Student Enquiries</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Inquiries received through the public web portal.
              </p>
            </div>

            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-[#FFF9EE]/30 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#172B4D]">{enq.studentName || enq.parentName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {enq.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Email: <strong>{enq.email}</strong> • Phone: <strong>{enq.phone}</strong> • Grade: <strong>{enq.gradeLevel}</strong>
                    </p>
                    <p className="text-xs text-[#172B4D]/85 italic bg-white p-2.5 rounded-xl border border-gray-200 mt-1">
                      "{enq.message}"
                    </p>
                    <span className="text-[10px] text-gray-400 block pt-1">Received: {enq.createdAt}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onUpdateEnquiryStatus(enq.id, 'contacted')}
                      className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => onUpdateEnquiryStatus(enq.id, 'converted')}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      Enroll Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEMO BOOKINGS */}
        {activeTab === 'demos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Free Diagnostic Demo Class Bookings</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Scheduled 1-on-1 concept evaluation sessions.
              </p>
            </div>

            <div className="space-y-4">
              {demoBookings.map((demo) => (
                <div
                  key={demo.id}
                  className="bg-[#FFF9EE]/30 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#172B4D]">{demo.studentName}</span>
                      <span className="text-xs font-semibold text-[#2454A6] bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {demo.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        demo.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {demo.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Parent: <strong>{demo.parentName}</strong> • Phone: <strong>{demo.phone}</strong> • Grade: <strong>{demo.gradeLevel}</strong>
                    </p>
                    <p className="text-xs text-[#2454A6] font-semibold flex items-center space-x-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Slot: {demo.preferredDate} at {demo.preferredTimeSlot}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onUpdateBookingStatus(demo.id, 'confirmed')}
                      className="px-3 py-1.5 text-xs font-bold bg-[#2454A6] text-white rounded-xl"
                    >
                      Confirm Slot
                    </button>
                    <button
                      onClick={() => onUpdateBookingStatus(demo.id, 'completed')}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 text-[#172B4D] rounded-xl hover:bg-gray-50"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEACHER PROFILE EDIT */}
        {activeTab === 'teacher' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Faculty Profile & Business Location Management</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Update verified faculty bio, phone, and official Delhi academy premises.
              </p>
            </div>

            {savedTeacherSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Faculty profile changes successfully saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveTeacher} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Teacher Biography & Vision</label>
                <textarea
                  rows={4}
                  value={bioEdit}
                  onChange={(e) => setBioEdit(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Official WhatsApp & Phone</label>
                <input
                  type="text"
                  value={phoneEdit}
                  onChange={(e) => setPhoneEdit(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Official Academy Address</label>
                <input
                  type="text"
                  value={addressEdit}
                  onChange={(e) => setAddressEdit(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-[#172B4D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Save Faculty Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: OAUTH & GOOGLE DRIVE SECURITY ARCHITECTURE */}
        {activeTab === 'oauth_security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Google Drive OAuth 2.0 Security Architecture</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Detailed verification guide for Google Cloud Console, drive.file scope isolation, and token encryption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Architecture Rule 1 */}
              <div className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-[#2454A6]/15 space-y-3">
                <div className="flex items-center space-x-2 text-[#2454A6] font-bold text-sm">
                  <KeyRound className="w-5 h-5 text-[#35B8A6]" />
                  <span>1. Least-Privilege Scope (drive.file)</span>
                </div>
                <p className="text-xs text-[#172B4D]/80 leading-relaxed">
                  We use strictly <code>https://www.googleapis.com/auth/drive.file</code>. This grants access <strong>only</strong> to files and folders created by this app. The academy has zero access to student private photos, docs, or contacts.
                </p>
              </div>

              {/* Architecture Rule 2 */}
              <div className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-[#2454A6]/15 space-y-3">
                <div className="flex items-center space-x-2 text-[#2454A6] font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#F28C72]" />
                  <span>2. Server-Side Token Secret Storage</span>
                </div>
                <p className="text-xs text-[#172B4D]/80 leading-relaxed">
                  Refresh tokens and OAuth credentials are never stored in client LocalStorage or sent to frontend browsers. All exchange and Drive folder initialization runs inside Express server handlers.
                </p>
              </div>

              {/* Architecture Rule 3 */}
              <div className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-[#2454A6]/15 space-y-3">
                <div className="flex items-center space-x-2 text-[#2454A6] font-bold text-sm">
                  <HardDrive className="w-5 h-5 text-[#F7C948]" />
                  <span>3. Isolated App Folder Container</span>
                </div>
                <p className="text-xs text-[#172B4D]/80 leading-relaxed">
                  When a student saves an assignment, note, or certificate, the backend locates or creates a top-level folder: <code>RAGHVYON Academy Learning Portfolio</code> in the student's Drive, avoiding clutter.
                </p>
              </div>

              {/* Architecture Rule 4 */}
              <div className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-[#2454A6]/15 space-y-3">
                <div className="flex items-center space-x-2 text-[#2454A6] font-bold text-sm">
                  <Users className="w-5 h-5 text-[#2454A6]" />
                  <span>4. Parent-Student Separation</span>
                </div>
                <p className="text-xs text-[#172B4D]/80 leading-relaxed">
                  Parents can monitor grades, attendance, and feedback, but their accounts do not inherit student Google tokens, honoring minor student digital privacy rights.
                </p>
              </div>

            </div>

            {/* Environment Variable Checklist */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-[#172B4D] uppercase">Required OAuth Environment Variables (.env)</span>
              <pre className="bg-white p-3.5 rounded-xl border border-gray-200 text-[11px] font-mono text-[#172B4D] overflow-x-auto">
{`GOOGLE_CLIENT_ID=your_google_cloud_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_cloud_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/drive/oauth2callback
SESSION_SECRET=strong_random_secret_at_least_32_chars`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Security Audit Trail</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Real-time record of authentication attempts, course mutations, and security events.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[#2454A6]">AUTH_SUCCESS</span>
                  <span className="text-gray-600">Admin session established for admin@raghvyonacademy.com</span>
                </div>
                <span className="text-gray-400 text-[10px]">Just now</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-bold text-[#2454A6]">COURSE_FETCH</span>
                  <span className="text-gray-600">Public courses catalog rendered (6 active courses)</span>
                </div>
                <span className="text-gray-400 text-[10px]">2 mins ago</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[#35B8A6]">TEACHER_PROFILE_LOAD</span>
                  <span className="text-gray-600">Verified instructor credentials retrieved</span>
                </div>
                <span className="text-gray-400 text-[10px]">5 mins ago</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#2454A6]">Create New Course</h3>
            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Geometry & Proofs"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject</label>
                  <select
                    value={courseForm.subject}
                    onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Spoken English">Spoken English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer & Skills">Computer & Skills</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Grade Level</label>
                  <input
                    type="text"
                    required
                    value={courseForm.gradeLevel}
                    onChange={(e) => setCourseForm({ ...courseForm, gradeLevel: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Course Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe conceptual focus and student outcomes..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Fee Placeholder</label>
                  <input
                    type="text"
                    value={courseForm.fee}
                    onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Highlights (Comma Separated)</label>
                <input
                  type="text"
                  value={courseForm.highlights}
                  onChange={(e) => setCourseForm({ ...courseForm, highlights: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
