import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, BookOpen, Users, MessageSquare, Calendar, HardDrive, Plus,
  CheckCircle2, AlertCircle, LogOut, RefreshCw, KeyRound, ScrollText, UserCog,
  LinkIcon, FileCheck,
} from 'lucide-react';
import { api, ApiUser } from '../lib/api';

interface AdminDashboardProps {
  user: ApiUser | null;
  onLogout: () => void;
  showToast: (m: string) => void;
  onNavigate: (view: 'home' | 'student' | 'parent' | 'admin' | 'docs', sectionId?: string) => void;
}

type Tab = 'overview' | 'courses' | 'enquiries' | 'demos' | 'users' | 'drive' | 'audit' | 'access';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, showToast, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [demoBookings, setDemoBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [permData, setPermData] = useState<{ role: string; permissions: string[]; labels: Record<string, string>; endpoints: Array<{ method: string; endpoint: string; permission: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add course modal
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '', subject: 'Mathematics', gradeLevel: 'Grades 6–8', description: '',
    duration: '12 Weeks (3 Sessions / Week)', fee: 'Contact for Batch Pricing',
    highlights: 'Concept visualization, Interactive practice worksheets',
  });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cr, en, db_] = await Promise.all([
        api.adminOverview(),
        api.courses().then(d => d.courses.concat([])),
        api.adminEnquiries(),
        api.adminDemoBookings(),
      ]);
      setStats(ov.stats);
      setCourses(cr);
      setEnquiries(en.enquiries);
      setDemoBookings(db_.demoBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // RBAC introspection — this admin's live capability set from the server.
  useEffect(() => {
    api.authPermissions().then(setPermData).catch(() => {});
  }, []);

  const loadUsersTab = () => {
    api.adminUsers().then(d => setUsers(d.users)).catch(() => {});
    api.adminParentLinks().then(d => setLinks(d.links)).catch(() => {});
  };
  const loadDriveTab = () => {
    api.adminDriveConnections().then(d => setConnections(d.connections)).catch(() => {});
  };
  const loadAuditTab = () => {
    api.adminAuditLogs().then(d => setLogs(d.logs)).catch(() => {});
  };

  const switchTab = (t: Tab) => {
    setActiveTab(t);
    if (t === 'users') loadUsersTab();
    if (t === 'drive') loadDriveTab();
    if (t === 'audit') loadAuditTab();
  };

  const handleToggleCourse = async (id: string) => {
    try {
      await api.adminToggleCourse(id);
      showToast('Course visibility updated.');
      const d = await api.courses();
      setCourses(d.courses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;
    try {
      await api.adminAddCourse({
        title: courseForm.title,
        subject: courseForm.subject,
        gradeLevel: courseForm.gradeLevel,
        description: courseForm.description,
        duration: courseForm.duration,
        fee: courseForm.fee,
        highlights: courseForm.highlights.split(',').map(s => s.trim()).filter(Boolean),
      });
      showToast(`Course "${courseForm.title}" successfully added!`);
      setCourseForm({ ...courseForm, title: '', description: '' });
      setShowAddCourseModal(false);
      const d = await api.courses();
      setCourses(d.courses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create the course.');
    }
  };

  const handleSaveTeacher = async (bio: string, phone: string, address: string) => {
    try {
      await api.adminUpdateTeacher({ bio, phone, address });
      showToast('Faculty profile saved.');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white border border-[#2454A6]/20 flex items-center justify-center shadow-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-[#2454A6]" />
          </div>
          <p className="text-sm font-bold text-[#172B4D]">Loading Administration Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-[#F28C72] mx-auto" />
          <h3 className="text-lg font-bold text-[#172B4D]">Administration Panel</h3>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={loadAll} className="bg-[#2454A6] text-white text-xs font-bold px-5 py-2.5 rounded-xl">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2454A6] text-[#F7C948] flex items-center justify-center shadow-md shadow-[#2454A6]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">Academy Administration Panel</h1>
                <span className="bg-[#2454A6]/10 text-[#2454A6] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2454A6]/20">Role: Admin</span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">Logged in as <strong>{user?.name}</strong></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Online</span>
            </span>
            <button onClick={onLogout} className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl">Sign Out</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none" role="tablist">
          {([
            ['overview', 'Overview'],
            ['courses', `Courses (${courses.length})`],
            ['enquiries', `Enquiries (${enquiries.length})`],
            ['demos', `Demos (${demoBookings.length})`],
            ['users', 'Users & Links'],
            ['drive', 'Drive Status'],
            ['audit', 'Audit Logs'],
            ['access', 'Access Control'],
          ] as Array<[Tab, string]>).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => switchTab(key)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === key ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              ['Active Courses', stats.activeCourses, 'text-[#2454A6]'],
              ['Students', stats.students, 'text-[#35B8A6]'],
              ['Parents', stats.parents, 'text-[#F7C948]'],
              ['Drive Connected', stats.driveConnected, 'text-[#F28C72]'],
              ['Enquiries', stats.totalEnquiries, 'text-[#2454A6]'],
              ['Pending Demos', stats.pendingDemoBookings, 'text-[#35B8A6]'],
              ['Audit Entries', stats.auditLogCount, 'text-[#172B4D]'],
              ['Drive: Students', stats.driveConnected, 'text-[#2454A6]'],
            ].map(([label, value, color], i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
                <p className={`text-2xl font-black ${color} mt-1`}>{String(value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* COURSES */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Live Course Offerings</h3>
                <p className="text-xs sm:text-sm text-gray-500">Manage curriculum outlines, grade tiers, fees, and active public visibility.</p>
              </div>
              <button onClick={() => setShowAddCourseModal(true)} className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B4D]">
                <thead className="bg-[#FFF9EE] border-y border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Course & Subject</th>
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button onClick={() => handleToggleCourse(c.id)} className="text-xs font-semibold text-[#2454A6] hover:underline">
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

        {/* ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Parent & Student Enquiries</h3>
              <p className="text-xs sm:text-sm text-gray-500">Inquiries received through the public web portal.</p>
            </div>
            {enquiries.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No enquiries yet.</p>
            ) : (
              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="bg-[#FFF9EE]/30 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#172B4D]">{enq.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${enq.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {enq.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Email: <strong>{enq.email}</strong> • Phone: <strong>{enq.phone}</strong> • Grade: <strong>{enq.studentGrade}</strong></p>
                      {enq.message && <p className="text-xs text-[#172B4D]/85 italic bg-white p-2.5 rounded-xl border border-gray-200 mt-1">"{enq.message}"</p>}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button onClick={() => api.adminUpdateEnquiry(enq.id, 'contacted').then(loadAll)} className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 rounded-xl">Mark Contacted</button>
                      <button onClick={() => api.adminUpdateEnquiry(enq.id, 'converted').then(loadAll)} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Enroll Student</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEMOS */}
        {activeTab === 'demos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Free Diagnostic Demo Class Bookings</h3>
              <p className="text-xs sm:text-sm text-gray-500">Scheduled 1-on-1 concept evaluation sessions.</p>
            </div>
            {demoBookings.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No demo bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {demoBookings.map((demo) => (
                  <div key={demo.id} className="bg-[#FFF9EE]/30 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#172B4D]">{demo.studentName}</span>
                        <span className="text-xs font-semibold text-[#2454A6] bg-white px-2 py-0.5 rounded-md border border-gray-200">{demo.subject}</span>
                      </div>
                      <p className="text-xs text-gray-600">Parent: <strong>{demo.parentName}</strong> • Phone: <strong>{demo.phone}</strong> • Grade: <strong>{demo.studentGrade}</strong></p>
                      <p className="text-xs text-[#2454A6] font-semibold flex items-center space-x-1.5 pt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Slot: {demo.preferredDate} at {demo.preferredTimeSlot}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button onClick={() => api.adminUpdateBooking(demo.id, 'confirmed').then(loadAll)} className="px-3 py-1.5 text-xs font-bold bg-[#2454A6] text-white rounded-xl">Confirm Slot</button>
                      <button onClick={() => api.adminUpdateBooking(demo.id, 'completed').then(loadAll)} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 text-[#172B4D] rounded-xl hover:bg-gray-50">Completed</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS & LINKS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-xl font-bold text-[#172B4D] flex items-center space-x-2"><Users className="w-5 h-5 text-[#2454A6]" /><span>Platform Users</span></h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#172B4D]">
                  <thead className="bg-[#FFF9EE] border-y border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Student Code</th><th className="py-3 px-4">Google Linked</th><th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold">{u.name}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2454A6]/10 text-[#2454A6]">{u.role}</span></td>
                        <td className="py-3 px-4">{u.studentCode ?? '—'}</td>
                        <td className="py-3 px-4">{u.googleLinked ? 'Yes' : '—'}</td>
                        <td className="py-3 px-4 text-gray-400">{String(u.createdAt).slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-xl font-bold text-[#172B4D] flex items-center space-x-2"><LinkIcon className="w-5 h-5 text-[#35B8A6]" /><span>Verified Parent–Student Links</span></h3>
              {links.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No verified links yet.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((l) => (
                    <div key={l.id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span><strong className="text-[#172B4D]">{l.parent_name}</strong> ({l.parent_email}) → <strong className="text-[#2454A6]">{l.student_name}</strong> ({l.student_email})</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${l.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {l.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRIVE STATUS */}
        {activeTab === 'drive' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D] flex items-center space-x-2"><HardDrive className="w-5 h-5 text-[#2454A6]" /><span>Google Drive Connections (Application Metadata Only)</span></h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Admins see connection status and masked emails for support purposes only. OAuth tokens are encrypted and NEVER visible to administrators — each student's Drive is owned and controlled by that student.
              </p>
            </div>
            {connections.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No Drive connections recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {connections.map((c) => (
                  <div key={c.userId} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#172B4D]">{c.studentName}</span>
                      <span className="text-gray-500"> ({c.academyEmail})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">Google: <strong>{c.googleEmail ?? '—'}</strong></span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${c.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {String(c.status).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 text-xs text-[#172B4D]/85 flex items-start space-x-2">
              <KeyRound className="w-4 h-4 text-[#F7C948] shrink-0 mt-0.5" />
              <span>Drive scope is strictly <code>https://www.googleapis.com/auth/drive.file</code>. Tokens are AES-256-GCM encrypted at rest and never returned by any admin endpoint.</span>
            </div>
          </div>
        )}

        {/* ACCESS CONTROL (RBAC) */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-[#35B8A6]" />
                <h3 className="text-xl font-bold text-[#172B4D]">Role-Based Access Control</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Live capability map enforced by the server on every request. Hiding UI is cosmetic — the API denies anything outside these permissions, and every denial is audit-logged.
              </p>
              {permData && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-[#FFF9EE] border border-[#2454A6]/15 rounded-full px-4 py-1.5 text-xs font-bold text-[#2454A6]">
                  <span>Your session role:</span>
                  <span className="uppercase tracking-wide">{permData.role}</span>
                  <span className="text-gray-400">·</span>
                  <span>{permData.permissions.length} permissions</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {(['student', 'parent', 'admin'] as const).map((r) => {
                const rolePerms = permData
                  ? Object.keys(permData.labels).filter((p) => permData.permissions.includes(p) && permData.role === r)
                  : [];
                const matrixNote: Record<string, string> = {
                  student: 'Own data only. Cannot reach any other student, parent or admin resource.',
                  parent: 'Verified children only — never by email. No OAuth tokens, ever.',
                  admin: 'Application metadata only. Drive tokens are architecturally invisible.',
                };
                return (
                  <div key={r} className="bg-white rounded-3xl border border-gray-200 shadow-2xs p-5">
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      r === 'admin' ? 'bg-[#2454A6]/10 text-[#2454A6]' : r === 'parent' ? 'bg-[#F7C948]/20 text-[#172B4D]' : 'bg-[#35B8A6]/10 text-[#0e7d6f]'
                    }`}>
                      <UserCog className="w-3.5 h-3.5" />
                      <span>{r}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 mb-3">{matrixNote[r]}</p>
                    <ul className="space-y-1.5">
                      {(permData
                        ? Object.entries(permData.labels)
                            .filter(([perm]) => perm.startsWith(`${r}:`))
                            .map(([perm, label]) => ({ perm, label, mine: permData.permissions.includes(perm) }))
                        : []
                      ).map(({ perm, label, mine }) => (
                        <li key={perm} className="flex items-start space-x-2 text-[11px] text-[#172B4D]/85">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${mine ? 'text-[#35B8A6]' : 'text-gray-300'}`} />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {permData && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
                <h4 className="text-sm font-bold text-[#172B4D] mb-3">Endpoint → Permission enforcement</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-[#172B4D]">
                    <thead className="bg-[#FFF9EE] border-y border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Method</th>
                        <th className="py-2.5 px-4">Endpoint</th>
                        <th className="py-2.5 px-4">Required permission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permData.endpoints.map((e, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2 px-4 font-mono font-bold text-[#35B8A6]">{e.method}</td>
                          <td className="py-2 px-4 font-mono">{e.endpoint}</td>
                          <td className="py-2 px-4 font-mono text-[#2454A6]">{e.permission}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D] flex items-center space-x-2"><ScrollText className="w-5 h-5 text-[#2454A6]" /><span>Security Audit Trail</span></h3>
              <p className="text-xs sm:text-sm text-gray-500">Live records from the database — logins, Drive events, submissions, and admin actions. Secrets are never logged.</p>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No audit entries yet.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((l) => (
                  <div key={l.id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2 h-2 rounded-full ${l.action.startsWith('DRIVE') ? 'bg-[#35B8A6]' : l.action.includes('FAILED') ? 'bg-red-400' : 'bg-[#2454A6]'}`} />
                      <span className="font-bold text-[#2454A6]">{l.action}</span>
                      <span className="text-gray-600">{l.actor} — {l.details}</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">{String(l.timestamp).replace('T', ' ').slice(0, 19)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add course modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#2454A6]">Create New Course</h3>
            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Course Title</label>
                <input type="text" required placeholder="e.g. Advanced Geometry & Proofs" value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject</label>
                  <select value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]">
                    {['Mathematics', 'Science', 'English', 'Spoken English', 'Social Studies', 'Computer & Skills', 'Exam Preparation'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Grade Level</label>
                  <input type="text" required value={courseForm.gradeLevel} onChange={(e) => setCourseForm({ ...courseForm, gradeLevel: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Description</label>
                <textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Duration</label>
                  <input type="text" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Fee</label>
                  <input type="text" value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Highlights (comma separated)</label>
                <input type="text" value={courseForm.highlights} onChange={(e) => setCourseForm({ ...courseForm, highlights: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]" />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setShowAddCourseModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
