import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle2, FileText, HardDrive, Award, Plus, Upload, ExternalLink,
  AlertCircle, Check, MessageSquare, Calendar, LogOut, Trash2, Brain, ShieldAlert,
  Loader2, RefreshCw, Link2, Unlink, Cloud, X,
} from 'lucide-react';
import { api, ApiUser, StudentDashboardData, ApiNote, apiUrl } from '../lib/api';

interface StudentDashboardProps {
  user: ApiUser | null;
  onOpenAIAssistant: (initialTopic?: string) => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'student' | 'parent' | 'admin' | 'docs', sectionId?: string) => void;
  showToast: (m: string) => void;
}

type Tab = 'overview' | 'assignments' | 'notes' | 'certificates' | 'feedback' | 'drive';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onOpenAIAssistant,
  onLogout,
  showToast,
}) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('Mathematics');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSaveDrive, setNewNoteSaveDrive] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  // Assignment upload state
  const [selectedAssignmentForUpload, setSelectedAssignmentForUpload] = useState<StudentDashboardData['assignments'][number] | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaveDrive, setUploadSaveDrive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.studentDashboard();
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || noteSaving) return;
    setNoteSaving(true);
    try {
      const { note, error: driveError } = await api.createNote({
        title: newNoteTitle,
        subject: newNoteSubject,
        content: newNoteContent,
        saveToDrive: newNoteSaveDrive,
      });
      setData(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : prev);
      if (newNoteSaveDrive && !driveError) {
        showToast(`Note "${note.title}" created and saved to YOUR Google Drive.`);
      } else if (driveError) {
        showToast(`Note saved in Academy records, but Drive sync failed: ${driveError}`);
      } else {
        showToast(`Note "${note.title}" saved to your study notebook.`);
      }
      setShowNoteModal(false);
      setNewNoteTitle(''); setNewNoteContent(''); setNewNoteSaveDrive(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save the note.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForUpload || uploading) return;
    setUploading(true);
    try {
      const result = await api.submitAssignment(String(selectedAssignmentForUpload.id), uploadFile, uploadSaveDrive && uploadFile != null);
      const { assignments } = data ? data : ({} as StudentDashboardData);
      if (data) {
        setData({
          ...data,
          assignments: data.assignments.map(a =>
            a.id === String(selectedAssignmentForUpload.id)
              ? {
                  ...a,
                  status: 'submitted',
                  submittedAt: new Date().toISOString().slice(0, 10),
                  fileName: uploadFile?.name ?? a.fileName,
                  driveFileId: (result as any).driveFileId,
                  driveFileLink: (result as any).driveLink,
                }
              : a
          ),
        });
      }
      showToast(uploadFile && uploadSaveDrive
        ? 'Assignment submitted & archived to YOUR Google Drive.'
        : 'Assignment submitted successfully.');
      setSelectedAssignmentForUpload(null);
      setUploadFile(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Google Drive? The Academy will delete its stored authorization and can no longer save files to your Drive. Files already saved remain YOURS in your own Drive. Academy academic records are not affected.')) return;
    try {
      const res = await api.driveDisconnect();
      showToast(res.message);
      await loadDashboard();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not disconnect Drive.');
    }
  };

  const handleOpenFolder = async () => {
    try {
      const { url } = await api.driveFolderLink();
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not open your Drive folder.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PortalLoading />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-[#F28C72] mx-auto" />
          <h3 className="text-lg font-bold text-[#172B4D]">We couldn't load your dashboard</h3>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={loadDashboard} className="bg-[#2454A6] text-white text-xs font-bold px-5 py-2.5 rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { profile, enrolledCourses, assignments, notes, certificates, progress, upcomingTasks, driveStatus } = data;

  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover shadow-md shadow-[#2454A6]/20 border-2 border-white shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#2454A6] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#2454A6]/20 shrink-0">
                {profile.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">{profile.name}</h1>
                <span className="bg-[#35B8A6]/15 text-[#218174] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#35B8A6]/30">Student</span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">
                ID: {profile.studentId ?? '—'} • {profile.grade ?? ''} • {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => onOpenAIAssistant()} className="flex items-center space-x-1.5 bg-[#FFF9EE] hover:bg-[#ffefd2] border border-[#F7C948] text-[#172B4D] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors">
              <Brain className="w-4 h-4 text-[#2454A6]" />
              <span>AI Study Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-colors ${
                driveStatus.isConnected ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Drive: {driveStatus.isConnected ? 'Connected' : 'Not Connected'}</span>
            </button>
            <button onClick={onLogout} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200" title="Sign Out" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none" role="tablist">
          {([
            ['overview', 'Academic Overview'],
            ['assignments', `Assignments (${assignments.length})`],
            ['notes', `Notes (${notes.length})`],
            ['certificates', `Certificates (${certificates.length})`],
            ['feedback', 'Teacher Feedback'],
            ['drive', 'Google Drive'],
          ] as Array<[Tab, string]>).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === key ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard label="Enrolled Courses" value={String(enrolledCourses.length)} color="text-[#2454A6]" sub="Active sessions" />
              <StatCard label="Assignments Submitted" value={`${assignments.filter(a => a.status !== 'pending').length}/${assignments.length}`} color="text-[#35B8A6]" sub="This term" />
              <StatCard label="Avg Test Score" value={progress.some(p => p.scoreAvg > 0) ? `${Math.round(progress.filter(p => p.scoreAvg > 0).reduce((s, p) => s + p.scoreAvg, 0) / progress.filter(p => p.scoreAvg > 0).length)}%` : '—'} color="text-[#F28C72]" sub="Concept evaluations" />
              <StatCard label="Certificates" value={String(certificates.length)} color="text-[#F7C948]" sub="Verified credentials" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
                  <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-[#2454A6]" />
                    <span>Enrolled Courses & Conceptual Progress</span>
                  </h3>
                  {progress.length === 0 ? (
                    <EmptyState icon={<BookOpen className="w-8 h-8 text-gray-300" />} title="No enrollments yet" body="Your Academy will enroll you in courses — check back after your first session." />
                  ) : (
                    <div className="space-y-4">
                      {progress.map((item, idx) => {
                        const percentage = Math.round((item.completedLessons / item.totalLessons) * 100);
                        return (
                          <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#172B4D]">
                              <span>{item.subject}</span>
                              <span className="text-[#2454A6]">{percentage}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-[#2454A6] h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                              <span>{item.completedLessons} of {item.totalLessons} tasks finished</span>
                              <span>Avg Score: <strong className="text-[#35B8A6]">{item.scoreAvg > 0 ? `${item.scoreAvg}%` : '—'}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
                  <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#F28C72]" />
                    <span>Upcoming Tasks & Deadlines</span>
                  </h3>
                  {upcomingTasks.length === 0 ? (
                    <EmptyState icon={<CheckCircle2 className="w-8 h-8 text-gray-300" />} title="All caught up!" body="No pending tasks. Great work!" />
                  ) : (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#2454A6]/40 shadow-2xs flex items-start space-x-3">
                          <div className="w-5 h-5 rounded-md border-2 border-gray-300 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-[#172B4D]">{task.title}</p>
                            <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-1">
                              <span>{task.courseName}</span>
                              <span>•</span>
                              <span className="text-[#F28C72] font-medium">{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drive quick card */}
                <div className="bg-gradient-to-br from-[#2454A6] to-[#1d4487] text-white p-6 rounded-3xl shadow-md space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-[#F7C948]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold">Google Drive Portfolio</h4>
                      <p className="text-xs text-white/70">{driveStatus.isConnected ? 'Connected to YOUR Drive' : 'Ready for your connection'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Your assignments, notes and certificates are saved in <strong>your own Google Drive</strong> — owned by your Google account, using your storage. The Academy never uses a shared Drive for your files.
                  </p>
                  <button onClick={() => setActiveTab('drive')} className="w-full bg-[#F7C948] hover:bg-[#eab308] text-[#172B4D] font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs">
                    {driveStatus.isConnected ? 'Manage Drive Integration' : 'Connect Google Drive'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Assignments & Homework Submissions</h3>
              <p className="text-xs sm:text-sm text-gray-500">Submit problem solutions and view feedback from your lead instructor.</p>
            </div>
            {assignments.length === 0 ? (
              <EmptyState icon={<FileText className="w-8 h-8 text-gray-300" />} title="No assignments yet" body="Assignments from your enrolled courses will appear here." />
            ) : (
              <div className="space-y-4">
                {assignments.map((asg) => (
                  <div key={asg.id} className="bg-[#FFF9EE]/30 p-5 sm:p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#2454A6]">{asg.courseName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          asg.status === 'graded' ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : asg.status === 'submitted' ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {asg.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#172B4D]">{asg.title}</h4>
                      <p className="text-xs text-[#172B4D]/75">{asg.description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                        <span>Due: <strong className="text-gray-700">{asg.dueDate}</strong></span>
                        {asg.score !== undefined && <span>Score: <strong className="text-[#35B8A6]">{asg.score} / {asg.maxScore}</strong></span>}
                        {asg.fileName && (
                          <span className="text-[#2454A6] font-medium flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{asg.fileName}</span>
                            {asg.driveFileLink && (
                              <a href={asg.driveFileLink} target="_blank" rel="noopener noreferrer" className="underline text-[#35B8A6] flex items-center gap-0.5" title="Open in your Google Drive">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </span>
                        )}
                      </div>
                      {asg.teacherFeedback && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-[#172B4D]/85 mt-2">
                          <span className="font-bold text-[#2454A6]">Teacher Feedback: </span>{asg.teacherFeedback}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      {asg.status === 'pending' ? (
                        <button onClick={() => setSelectedAssignmentForUpload(asg)} className="bg-[#2454A6] hover:bg-[#1d4487] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Upload Solution</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submitted {asg.submittedAt}</span>
                        </div>
                      )}
                      <button onClick={() => onOpenAIAssistant(`Help me understand concept questions for ${asg.title}`)} className="text-xs font-bold text-[#2454A6] hover:underline flex items-center space-x-1 justify-center py-1">
                        <Brain className="w-3.5 h-3.5" />
                        <span>Ask AI Study Hint</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Study Notes & Knowledge Notebook</h3>
                <p className="text-xs sm:text-sm text-gray-500">Create concept summaries and optionally save them into your own Google Drive.</p>
              </div>
              <button onClick={() => setShowNoteModal(true)} className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                <span>Create New Study Note</span>
              </button>
            </div>
            {notes.length === 0 ? (
              <EmptyState icon={<FileText className="w-8 h-8 text-gray-300" />} title="No notes yet" body="Create your first concept note — you can save a copy straight into your Google Drive." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onExplain={() => onOpenAIAssistant(`Can you explain or give practice questions based on: ${note.title}?`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Academic Certificates of Completion</h3>
              <p className="text-xs sm:text-sm text-gray-500">Official certificates verified by RAGHVYON ACADEMY mentors.</p>
            </div>
            {certificates.length === 0 ? (
              <EmptyState icon={<Award className="w-8 h-8 text-gray-300" />} title="No certificates yet" body="Complete a course to earn your first verified certificate." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-gradient-to-br from-[#FFF9EE] to-white p-6 sm:p-8 rounded-3xl border-2 border-[#2454A6]/20 shadow-sm relative overflow-hidden space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#2454A6] text-[#F7C948] flex items-center justify-center shadow-md">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-600">{cert.verificationCode}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#35B8A6] uppercase tracking-wider block">Certificate of Achievement</span>
                      <h4 className="text-lg font-extrabold text-[#2454A6] mt-1">{cert.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Awarded to: <strong className="text-[#172B4D]">{cert.studentName}</strong></p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-[#172B4D]">
                      <span>Course: <strong>{cert.courseName}</strong></span>
                      <span>Date: <strong>{cert.issueDate}</strong></span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-[#F28C72]">{cert.gradeAchieved}</span>
                      <span className="text-[11px] text-gray-500">Signed: Lead Academic Mentor</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Detailed Teacher Feedback & Progress Notes</h3>
              <p className="text-xs sm:text-sm text-gray-500">Formative insights directly from live diagnostic teaching sessions.</p>
            </div>
            {assignments.filter(a => a.teacherFeedback).length === 0 ? (
              <EmptyState icon={<MessageSquare className="w-8 h-8 text-gray-300" />} title="No feedback yet" body="Your teachers will leave feedback as your assignments are graded." />
            ) : (
              <div className="space-y-4">
                {assignments.filter(a => a.teacherFeedback).map((a) => (
                  <div key={`fb-${a.id}`} className="bg-[#FFF9EE]/40 p-6 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-[#2454A6]">{a.courseName}</h4>
                        <p className="text-xs text-gray-500">Assignment: {a.title} • {a.submittedAt}</p>
                      </div>
                      {a.score !== undefined && (
                        <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-[#172B4D]">
                          <span>Score:</span>
                          <span className="text-[#35B8A6]">{a.score} / {a.maxScore}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#172B4D]/85 leading-relaxed">"{a.teacherFeedback}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Google Drive Learning Portfolio</h3>
              <p className="text-xs sm:text-sm text-gray-500">Securely store assignments, class notes, and certificates in YOUR personal Google Drive.</p>
            </div>

            {/* Ownership disclosure */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm text-blue-950">
              <div className="flex items-center space-x-2 font-bold text-blue-900">
                <ShieldAlert className="w-5 h-5 text-[#2454A6]" />
                <span>Your files stay YOURS — strict drive.file isolation</span>
              </div>
              <p className="leading-relaxed">
                Your files are stored in <strong>your own Google Drive</strong> and use <strong>your Google account's</strong> available storage. RAGHVYON Academy does not use a shared Academy Drive for your personal learning files, and never uses a service account to own your files.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-900/80">
                <li>Scope requested: <code>{driveStatus.scope || 'https://www.googleapis.com/auth/drive.file'}</code> — per-file access only</li>
                <li>The Academy cannot browse your other Drive files, Gmail, Contacts, or Photos</li>
                <li>You can disconnect at any time; files already saved remain yours</li>
              </ul>
            </div>

            {/* Connection card */}
            <div className="bg-[#FFF9EE] rounded-2xl p-6 border border-[#2454A6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${driveStatus.isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <h4 className="text-base font-bold text-[#172B4D]">
                    {driveStatus.isConnected ? 'Google Drive Connected' : 'Google Drive Not Connected'}
                  </h4>
                </div>
                {driveStatus.isConnected ? (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p>Connected Google Account: <strong className="text-[#172B4D]">{driveStatus.connectedEmail}</strong></p>
                    <p>Storage: <strong className="text-[#172B4D]">Your Google Drive</strong></p>
                    <p>Folder: <strong className="text-[#172B4D]">{driveStatus.folderName || 'RAGHVYON Academy'}</strong></p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 max-w-md">
                    Connect your own Google Drive to save assignments, notes and certificates. RAGHVYON Academy will use your Google Drive to save your learning files. You control this access and can disconnect it later.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {driveStatus.isConnected ? (
                  <>
                    <button onClick={handleOpenFolder} className="bg-white hover:bg-gray-50 border border-gray-200 text-[#172B4D] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1.5">
                      <FolderOpenIcon />
                      <span>Open Drive Folder</span>
                    </button>
                    <button onClick={() => setShowNoteModal(true)} className="bg-white hover:bg-gray-50 border border-gray-200 text-[#172B4D] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1.5">
                      <Plus className="w-4 h-4 text-[#2454A6]" />
                      <span>Save Note</span>
                    </button>
                    <button onClick={handleDisconnect} className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1.5">
                      <Unlink className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : (
                  <a
                    href={apiUrl('/drive/connect')}
                    className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors ${
                      driveStatus.isConfigured === false
                        ? 'bg-gray-100 text-gray-400 pointer-events-none'
                        : 'bg-[#2454A6] hover:bg-[#1d4487] text-white'
                    }`}
                  >
                    <HardDrive className="w-4 h-4 text-[#F7C948]" />
                    <span>Connect Google Drive</span>
                  </a>
                )}
              </div>
            </div>

            {driveStatus.isConfigured === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Drive OAuth isn't configured on this server yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). The Academy team will enable it shortly — your account remains fully usable.</span>
              </div>
            )}

            <DriveFilesSection connected={driveStatus.isConnected} />
          </div>
        )}

        {/* Privacy & deletion */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            <span>Minor Data Protection: Only minimal necessary academic records are preserved.</span>
          </div>
          <button
            onClick={async () => {
              if (!window.confirm('Delete your account and platform learning records? Files in your own Google Drive are NOT touched. This cannot be undone.')) return;
              try {
                await api.deleteAccount();
                showToast('Your account and records were deleted. Files in your own Drive remain yours.');
                onLogout();
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Deletion failed.');
              }
            }}
            className="text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Request Student Account & Data Erasure</span>
          </button>
        </div>
      </div>

      {/* Note modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#2454A6]">Create Study Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Title</label>
                <input type="text" required placeholder="e.g. Pythagoras Theorem Visual Proof" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject</label>
                <select value={newNoteSubject} onChange={(e) => setNewNoteSubject(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]">
                  {['Mathematics', 'Science', 'English', 'Social Studies', 'Computer & Skills', 'Spoken English', 'Exam Preparation'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Note Content</label>
                <textarea rows={4} placeholder="Key concepts, step explanations, formula derivations..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6] focus:outline-none" />
              </div>
              <div className="flex items-start space-x-2 bg-[#FFF9EE] p-3 rounded-xl border border-[#2454A6]/10">
                <input type="checkbox" id="saveDriveCheck" checked={newNoteSaveDrive} onChange={(e) => setNewNoteSaveDrive(e.target.checked)} className="rounded border-gray-300 text-[#2454A6] focus:ring-[#2454A6] mt-0.5" />
                <label htmlFor="saveDriveCheck" className="text-xs text-[#172B4D] cursor-pointer">
                  Also save a copy to <strong>my own Google Drive</strong>{driveStatus.isConnected ? '' : ' (connect Drive first — see the Google Drive tab)'}
                </label>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={noteSaving} className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs disabled:opacity-60 flex items-center space-x-2">
                  {noteSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{noteSaving ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment upload modal */}
      {selectedAssignmentForUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#2454A6]">Upload Assignment Solution</h3>
              <button onClick={() => { setSelectedAssignmentForUpload(null); setUploadFile(null); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600">Submitting for: <strong>{selectedAssignmentForUpload.title}</strong></p>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2 bg-[#FFF9EE]/20 cursor-pointer hover:border-[#2454A6]/50 transition-colors">
                <Upload className="w-8 h-8 text-[#2454A6] mx-auto" />
                <p className="text-xs font-semibold text-[#172B4D]">{uploadFile ? uploadFile.name : 'Click to attach your solution document'}</p>
                <span className="text-[10px] text-gray-500 block">PDF, DOCX, PPTX, images, text — max 10 MB</span>
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
              </label>

              <div className="flex items-start space-x-2 bg-[#FFF9EE] p-3 rounded-xl border border-[#2454A6]/10">
                <input type="checkbox" id="uploadDriveCheck" checked={uploadSaveDrive} onChange={(e) => setUploadSaveDrive(e.target.checked)} className="rounded border-gray-300 text-[#2454A6] focus:ring-[#2454A6] mt-0.5" />
                <label htmlFor="uploadDriveCheck" className="text-xs text-[#172B4D] cursor-pointer">
                  Archive a copy to <strong>my own Google Drive</strong>{driveStatus.isConnected ? '' : ' (Drive not connected — the Academy copy is still saved)'}
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => { setSelectedAssignmentForUpload(null); setUploadFile(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={uploading || (!uploadFile && selectedAssignmentForUpload.status !== 'pending')} className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs disabled:opacity-60 flex items-center space-x-2">
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{uploading ? 'Submitting...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- small subcomponents ---------- */

const StatCard = ({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
    <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
    <p className={`text-2xl font-black ${color} mt-1`}>{value}</p>
    <span className="text-[11px] text-gray-500 mt-1 block">{sub}</span>
  </div>
);

const EmptyState = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="text-center py-12 px-6">
    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">{icon}</div>
    <p className="text-base font-bold text-[#172B4D]">{title}</p>
    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{body}</p>
  </div>
);

const NoteCard: React.FC<{ note: ApiNote; onExplain: () => void }> = ({ note, onExplain }) => (
  <div className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold bg-white text-[#2454A6] px-2.5 py-0.5 rounded-md border border-[#2454A6]/20">{note.subject}</span>
        <span className="text-[10px] text-gray-400">{note.updatedAt}</span>
      </div>
      <h4 className="text-base font-bold text-[#172B4D]">{note.title}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{note.summary}</p>
      <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-xs text-[#172B4D]/80 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
        {note.content}
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 text-xs">
      {note.driveSaved ? (
        <a href={note.driveFileLink} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold flex items-center space-x-1 text-[11px] hover:underline">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Saved to my Drive</span>
        </a>
      ) : (
        <span className="text-gray-400 text-[11px]">Academy notebook</span>
      )}
      <button onClick={onExplain} className="text-[#2454A6] font-bold text-[11px] hover:underline">Explain in AI Tutor</button>
    </div>
  </div>
);

const FolderOpenIcon = () => <Link2 className="w-4 h-4 text-[#2454A6]" />;

const DriveFilesSection: React.FC<{ connected: boolean }> = ({ connected }) => {
  const [files, setFiles] = useState<Array<{ kind: string; name: string; driveFileId: string; link?: string; date: string }> | null>(null);
  useEffect(() => {
    if (!connected) return;
    api.driveFiles().then(d => setFiles(d.files)).catch(() => setFiles([]));
  }, [connected]);

  if (!connected) return null;
  if (!files) return (
    <div className="flex items-center space-x-2 text-xs text-gray-400 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading your Drive files...</div>
  );
  return (
    <div className="space-y-3">
      <h4 className="text-base font-bold text-[#172B4D]">Files saved to your Drive through the Academy</h4>
      {files.length === 0 ? (
        <p className="text-xs text-gray-400">Nothing yet — submitted assignments and notes saved to Drive will appear here with direct links.</p>
      ) : (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                {f.kind === 'note' ? <FileText className="w-4 h-4 text-[#35B8A6]" /> : <FileText className="w-4 h-4 text-[#2454A6]" />}
                <span className="font-semibold">{f.name}</span>
              </div>
              {f.link ? (
                <a href={f.link} target="_blank" rel="noopener noreferrer" className="text-[#2454A6] font-bold flex items-center gap-1 hover:underline">
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-emerald-700 font-bold">Saved</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PortalLoading = () => (
  <div className="flex flex-col items-center space-y-4 p-8 animate-in fade-in duration-300">
    <div className="relative">
      <div className="w-16 h-16 rounded-3xl bg-[#FFF9EE] border border-[#2454A6]/20 flex items-center justify-center shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2454A6]" />
      </div>
      <div className="w-3 h-3 rounded-full bg-[#35B8A6] absolute -top-1 -right-1 animate-pulse" />
    </div>
    <p className="text-sm font-bold text-[#172B4D]">Loading your learning portal...</p>
  </div>
);
