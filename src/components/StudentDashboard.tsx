import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  FolderPlus, 
  HardDrive, 
  Award, 
  Plus, 
  Upload, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  MessageSquare, 
  Calendar,
  LogOut,
  Trash2,
  Brain,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, Course, Assignment, StudyNote, Certificate, LearningProgress, UpcomingTask, TeacherFeedback, GoogleDriveStatus } from '../types';

interface StudentDashboardProps {
  user: UserProfile;
  enrolledCourses: Course[];
  assignments: Assignment[];
  notes: StudyNote[];
  certificates: Certificate[];
  progress: LearningProgress[];
  tasks: UpcomingTask[];
  feedback: TeacherFeedback[];
  driveStatus: GoogleDriveStatus;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  onSubmitAssignment: (assignmentId: string, fileName: string, saveToDrive: boolean) => void;
  onCreateNote: (title: string, subject: string, content: string, saveToDrive: boolean) => void;
  onOpenAIAssistant: (initialTopic?: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  enrolledCourses,
  assignments,
  notes,
  certificates,
  progress,
  tasks,
  feedback,
  driveStatus,
  onConnectDrive,
  onDisconnectDrive,
  onSubmitAssignment,
  onCreateNote,
  onOpenAIAssistant,
  onLogout,
  onDeleteAccount
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'notes' | 'certificates' | 'feedback' | 'drive'>('overview');
  
  // Note Modal State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('Mathematics');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSaveDrive, setNewNoteSaveDrive] = useState(false);

  // Assignment submission modal state
  const [selectedAssignmentForUpload, setSelectedAssignmentForUpload] = useState<Assignment | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [uploadSaveDrive, setUploadSaveDrive] = useState(false);

  // Task local check state
  const [localTasks, setLocalTasks] = useState(tasks);

  const toggleTask = (taskId: string) => {
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    onCreateNote(newNoteTitle, newNoteSubject, newNoteContent, newNoteSaveDrive);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteSaveDrive(false);
    setShowNoteModal(false);
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForUpload || !submissionFileName) return;
    onSubmitAssignment(selectedAssignmentForUpload.id, submissionFileName, uploadSaveDrive);
    setSelectedAssignmentForUpload(null);
    setSubmissionFileName('');
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover shadow-md shadow-[#2454A6]/20 border-2 border-white shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#2454A6] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#2454A6]/20 shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">{user.name}</h1>
                <span className="bg-[#35B8A6]/15 text-[#218174] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#35B8A6]/30">
                  Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">
                ID: {user.studentId || 'RAGH-2026-081'} • {user.grade || 'Grade 8'} • {user.email}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Assistant Quick Tool */}
            <button
              onClick={() => onOpenAIAssistant()}
              className="flex items-center space-x-1.5 bg-[#FFF9EE] hover:bg-[#ffefd2] border border-[#F7C948] text-[#172B4D] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Brain className="w-4 h-4 text-[#2454A6]" />
              <span>AI Study Assistant</span>
            </button>

            {/* Google Drive Status Pill */}
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-colors ${
                driveStatus.isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Drive: {driveStatus.isConnected ? 'Connected' : 'Not Connected'}</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Academic Overview
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'assignments' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'notes' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Notes & Notebook ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'certificates' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Certificates ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'feedback' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Teacher Feedback
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'drive' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Google Drive Portfolio
          </button>
        </div>

        {/* TAB 1: ACADEMIC OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Enrolled Courses</span>
                <p className="text-2xl font-black text-[#2454A6] mt-1">{enrolledCourses.length}</p>
                <span className="text-[11px] text-[#35B8A6] font-semibold mt-1 block">Active Sessions</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Overall Attendance</span>
                <p className="text-2xl font-black text-[#35B8A6] mt-1">96%</p>
                <span className="text-[11px] text-gray-500 mt-1 block">Consistent record</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Avg Test Score</span>
                <p className="text-2xl font-black text-[#F28C72] mt-1">91.2%</p>
                <span className="text-[11px] text-gray-500 mt-1 block">Concept evaluations</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Certificates</span>
                <p className="text-2xl font-black text-[#F7C948] mt-1">{certificates.length}</p>
                <span className="text-[11px] text-gray-500 mt-1 block">Verified credentials</span>
              </div>
            </div>

            {/* Enrolled Courses & Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Enrolled Courses & Progress Bars */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-[#2454A6]" />
                      <span>Enrolled Courses & Conceptual Progress</span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {progress.map((item, idx) => {
                      const percentage = Math.round((item.completedLessons / item.totalLessons) * 100);
                      return (
                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#172B4D]">
                            <span>{item.subject}</span>
                            <span className="text-[#2454A6]">{percentage}% Complete</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#2454A6] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                            <span>{item.completedLessons} of {item.totalLessons} Lessons Finished</span>
                            <span>Avg Score: <strong className="text-[#35B8A6]">{item.scoreAvg}%</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Teacher Feedback Preview */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-[#35B8A6]" />
                      <span>Latest Teacher Observation</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className="text-xs font-bold text-[#2454A6] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {feedback.length > 0 && (
                    <div className="bg-[#FFF9EE] p-5 rounded-2xl border border-[#2454A6]/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2454A6]">{feedback[0].courseName}</span>
                        <span className="text-[11px] text-gray-500">{feedback[0].date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#172B4D]/85 leading-relaxed italic">
                        "{feedback[0].comment}"
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {feedback[0].strengths.map((str, i) => (
                          <span key={i} className="text-[10px] font-bold bg-white text-[#2454A6] px-2.5 py-0.5 rounded-full border border-[#2454A6]/20">
                            ✓ {str}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Upcoming Tasks & Direct Google Drive Quick Card */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Upcoming Tasks Checklist */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
                  <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#F28C72]" />
                    <span>Upcoming Tasks & Deadlines</span>
                  </h3>

                  <div className="space-y-3">
                    {localTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          task.completed
                            ? 'bg-gray-50/70 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200 hover:border-[#2454A6]/40 shadow-2xs'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors ${
                          task.completed ? 'bg-[#35B8A6] text-white' : 'border-2 border-gray-300'
                        }`}>
                          {task.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs sm:text-sm font-semibold text-[#172B4D] ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-1">
                            <span>{task.courseName}</span>
                            <span>•</span>
                            <span className="text-[#F28C72] font-medium">{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Drive Status Card */}
                <div className="bg-gradient-to-br from-[#2454A6] to-[#1d4487] text-white p-6 rounded-3xl shadow-md space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-[#F7C948]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold">Google Drive Portfolio</h4>
                      <p className="text-xs text-white/70">
                        {driveStatus.isConnected ? 'App Folder Synced' : 'Ready for Student Connection'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    Save homework, notes, and study guides directly to your personal Google Drive with strict isolation using the <code>drive.file</code> scope.
                  </p>

                  <button
                    onClick={() => setActiveTab('drive')}
                    className="w-full bg-[#F7C948] hover:bg-[#eab308] text-[#172B4D] font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    {driveStatus.isConnected ? 'Manage Drive Integration' : 'Connect Google Drive'}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Assignments & Homework Submissions</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Submit problem solutions and view feedback from your lead instructor.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="bg-[#FFF9EE]/30 p-5 sm:p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#2454A6]">{asg.courseName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        asg.status === 'graded'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : asg.status === 'submitted'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {asg.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#172B4D]">{asg.title}</h4>
                    <p className="text-xs text-[#172B4D]/75">{asg.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
                      <span>Due: <strong className="text-gray-700">{asg.dueDate}</strong></span>
                      {asg.score !== undefined && (
                        <span>Score: <strong className="text-[#35B8A6]">{asg.score} / {asg.maxScore}</strong></span>
                      )}
                      {asg.fileName && (
                        <span className="text-[#2454A6] font-medium flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{asg.fileName}</span>
                        </span>
                      )}
                    </div>

                    {asg.teacherFeedback && (
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-[#172B4D]/85 mt-2">
                        <span className="font-bold text-[#2454A6]">Teacher Feedback: </span>
                        {asg.teacherFeedback}
                      </div>
                    )}
                  </div>

                  {/* Submission Action */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    {asg.status === 'pending' ? (
                      <button
                        onClick={() => setSelectedAssignmentForUpload(asg)}
                        className="bg-[#2454A6] hover:bg-[#1d4487] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Solution</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submitted {asg.submittedAt}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onOpenAIAssistant(`Help me understand concept questions for ${asg.title}`)}
                      className="text-xs font-bold text-[#2454A6] hover:underline flex items-center space-x-1 justify-center py-1"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Ask AI Study Hint</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NOTES */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D]">Student Study Notes & Knowledge Notebook</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Create concept summaries, formula reference cards, and save them to Google Drive.
                </p>
              </div>

              <button
                onClick={() => setShowNoteModal(true)}
                className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Study Note</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#FFF9EE]/50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold bg-white text-[#2454A6] px-2.5 py-0.5 rounded-md border border-[#2454A6]/20">
                        {note.subject}
                      </span>
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
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved to Drive</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Local Notebook</span>
                    )}

                    <button
                      onClick={() => onOpenAIAssistant(`Can you explain or give practice questions based on: ${note.title}?`)}
                      className="text-[#2454A6] font-bold text-[11px] hover:underline"
                    >
                      Explain in AI Tutor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Academic Certificates of Completion</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Official certificates verified by RAGHVYON ACADEMY mentors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-[#FFF9EE] to-white p-6 sm:p-8 rounded-3xl border-2 border-[#2454A6]/20 shadow-sm relative overflow-hidden space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#2454A6] text-[#F7C948] flex items-center justify-center shadow-md">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-600">
                      {cert.verificationCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-[#35B8A6] uppercase tracking-wider block">
                      Certificate of Achievement
                    </span>
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
          </div>
        )}

        {/* TAB 5: TEACHER FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Detailed Teacher Feedback & Progress Notes</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Formative insights directly from live diagnostic teaching sessions.
              </p>
            </div>

            <div className="space-y-4">
              {feedback.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-[#FFF9EE]/40 p-6 rounded-2xl border border-gray-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-[#2454A6]">{fb.courseName}</h4>
                      <p className="text-xs text-gray-500">Instructor: {fb.teacherName} • Date: {fb.date}</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-[#172B4D]">
                      <span>Rating:</span>
                      <span className="text-amber-500">★</span>
                      <span>{fb.rating} / 5</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#172B4D]/85 leading-relaxed">
                    "{fb.comment}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                        Demonstrated Strengths
                      </span>
                      <ul className="text-xs text-[#172B4D]/80 space-y-1">
                        {fb.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <span className="text-emerald-500">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                        Recommended Focus Areas
                      </span>
                      <ul className="text-xs text-[#172B4D]/80 space-y-1">
                        {fb.focusAreas.map((foc, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <span className="text-amber-500">→</span>
                            <span>{foc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GOOGLE DRIVE INTEGRATION & SCOPE INFORMATION */}
        {activeTab === 'drive' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Google Drive Learning Portfolio</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Securely store assignments, class notes, and certificates into your personal Google Drive.
              </p>
            </div>

            {/* Security & Scope Disclosure Box */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm text-blue-950">
              <div className="flex items-center space-x-2 font-bold text-blue-900">
                <HardDrive className="w-5 h-5 text-[#2454A6]" />
                <span>Strict Scope Isolation Guarantee (drive.file)</span>
              </div>
              <p className="leading-relaxed">
                RAGHVYON ACADEMY requests strictly <strong>https://www.googleapis.com/auth/drive.file</strong> access.
                We do NOT request full Google Drive access, Gmail access, or Google Contacts access.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-900/80">
                <li>Files created by this application are saved to an isolated folder: <code>RAGHVYON Academy Learning Portfolio</code></li>
                <li>The academy backend cannot read or modify your private personal documents</li>
                <li>You can disconnect or revoke access at any time</li>
              </ul>
            </div>

            {/* Connection Status Box */}
            <div className="bg-[#FFF9EE] rounded-2xl p-6 border border-[#2454A6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${driveStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  <h4 className="text-base font-bold text-[#172B4D]">
                    {driveStatus.isConnected ? 'Google Drive Connected' : 'Google Drive Disconnected'}
                  </h4>
                </div>
                <p className="text-xs text-gray-600">
                  {driveStatus.isConnected
                    ? `Linked Account: ${driveStatus.connectedEmail || user.email}`
                    : 'Click below to authorize and link your educational drive folder.'}
                </p>
              </div>

              <div>
                {driveStatus.isConnected ? (
                  <button
                    onClick={onDisconnectDrive}
                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Disconnect Google Drive
                  </button>
                ) : (
                  <button
                    onClick={onConnectDrive}
                    className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-2"
                  >
                    <HardDrive className="w-4 h-4 text-[#F7C948]" />
                    <span>Connect Google Drive</span>
                  </button>
                )}
              </div>
            </div>

            {/* Saved Files in Drive Portfolio */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-[#172B4D]">Application Files in Drive</h4>
              <div className="space-y-2">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-[#2454A6]" />
                    <span className="font-semibold">Math_Assignment_Quadratic_Models.pdf</span>
                  </div>
                  <span className="text-emerald-700 font-bold">Synced</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-[#35B8A6]" />
                    <span className="font-semibold">Linear_Inequalities_Reference_Sheet.pdf</span>
                  </div>
                  <span className="text-emerald-700 font-bold">Synced</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Privacy & GDPR Deletion Section */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            <span>Minor Data Protection: Only minimal necessary academic records are preserved.</span>
          </div>
          <button
            onClick={onDeleteAccount}
            className="text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Request Student Account & Data Erasure</span>
          </button>
        </div>

      </div>

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#2454A6]">Create Study Note</h3>
            <form onSubmit={handleCreateNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pythagoras Theorem Visual Proof"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject</label>
                <select
                  value={newNoteSubject}
                  onChange={(e) => setNewNoteSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Computer & Skills">Computer & Skills</option>
                  <option value="Spoken English">Spoken English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Note Content & Formulas</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Key concepts, step explanations, formula derivations..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveDriveCheck"
                  checked={newNoteSaveDrive}
                  onChange={(e) => setNewNoteSaveDrive(e.target.checked)}
                  className="rounded border-gray-300 text-[#2454A6] focus:ring-[#2454A6]"
                />
                <label htmlFor="saveDriveCheck" className="text-xs text-[#172B4D] cursor-pointer">
                  Save copy to Google Drive Portfolio
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Upload Modal */}
      {selectedAssignmentForUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#2454A6]">Upload Assignment Solution</h3>
            <p className="text-xs text-gray-600">
              Submitting for: <strong>{selectedAssignmentForUpload.title}</strong>
            </p>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">File Name / Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science_Lab_Investigation_Aarav.pdf"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2 bg-[#FFF9EE]/20">
                <Upload className="w-8 h-8 text-[#2454A6] mx-auto" />
                <p className="text-xs font-semibold text-[#172B4D]">Drag and drop your solution document, or click to attach</p>
                <span className="text-[10px] text-gray-500">Supports PDF, DOCX, JPG, PNG (Max 10MB)</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uploadDriveCheck"
                  checked={uploadSaveDrive}
                  onChange={(e) => setUploadSaveDrive(e.target.checked)}
                  className="rounded border-gray-300 text-[#2454A6] focus:ring-[#2454A6]"
                />
                <label htmlFor="uploadDriveCheck" className="text-xs text-[#172B4D] cursor-pointer">
                  Also archive file to Google Drive Portfolio
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForUpload(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#2454A6] text-white rounded-xl shadow-xs"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
