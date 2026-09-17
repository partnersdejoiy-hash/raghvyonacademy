import React, { useState, useEffect } from 'react';
import {
  UserCheck, ShieldCheck, BookOpen, CheckCircle2, Calendar, MessageSquare,
  HeartHandshake, Award, AlertCircle, LogOut, RefreshCw, Cloud, CloudOff,
} from 'lucide-react';
import { api, ApiUser, ParentChildData } from '../lib/api';

interface ParentDashboardProps {
  user: ApiUser | null;
  onOpenConsultationRequest: () => void;
  onLogout: () => void;
  showToast: (m: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  onOpenConsultationRequest,
  onLogout,
  showToast,
}) => {
  const [children, setChildren] = useState<Array<{ id: number; profile: ApiUser; driveConnected: boolean }> | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childData, setChildData] = useState<ParentChildData['child'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.parentChildren()
      .then(({ children }) => {
        setChildren(children);
        if (children.length > 0) setSelectedChildId(children[0].id);
        else setError('No verified students are linked to your parent account yet. Please contact the Academy office to complete verification.');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load your children.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setChildData(null);
    api.parentChildData(selectedChildId)
      .then((d) => setChildData(d.child))
      .catch((err) => showToast(err instanceof Error ? err.message : 'Failed to load student data.'));
  }, [selectedChildId, showToast]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white border border-[#2454A6]/20 flex items-center justify-center shadow-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-[#2454A6]" />
          </div>
          <p className="text-sm font-bold text-[#172B4D]">Loading Parent Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !children) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-[#F28C72] mx-auto" />
          <h3 className="text-lg font-bold text-[#172B4D]">Parent Portal</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const selectedChildMeta = children.find(c => c.id === selectedChildId);
  const child = childData;

  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover shadow-md shadow-[#35B8A6]/20 border-2 border-white shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#35B8A6] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#35B8A6]/20 shrink-0">
                <UserCheck className="w-8 h-8" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">{user?.name ?? 'Parent'}</h1>
                <span className="bg-[#35B8A6]/15 text-[#218174] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#35B8A6]/30">Verified Parent Account</span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {children.length > 1 && (
              <select
                value={selectedChildId ?? ''}
                onChange={(e) => setSelectedChildId(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#172B4D] bg-white"
                aria-label="Select child"
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.profile.name} ({c.profile.grade ?? ''})</option>
                ))}
              </select>
            )}
            <button onClick={onOpenConsultationRequest} className="flex items-center space-x-1.5 bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors">
              <HeartHandshake className="w-4 h-4 text-[#F7C948]" />
              <span>Request Teacher Consultation</span>
            </button>
            <button onClick={onLogout} className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl">Sign Out</button>
          </div>
        </div>

        {/* Privacy banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Verified Parent-Child Access Isolation</span>
            <p className="text-emerald-800/90 leading-relaxed">
              Your child's academic information is shared with you through their verified Academy account. Private Google Drive credentials and OAuth tokens remain confidential to the student's own account — parents never receive access, and the Academy never stores them in your session.
            </p>
          </div>
        </div>

        {!child ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-[#2454A6]" />
          </div>
        ) : (
          <>
            {/* Child metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Student</span>
                <p className="text-lg font-black text-[#2454A6] mt-1">{child.profile.name}</p>
                <span className="text-[11px] text-gray-500">{child.profile.grade ?? ''} • {child.profile.studentId ?? ''}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Enrolled Subjects</span>
                <p className="text-2xl font-black text-[#2454A6] mt-1">{child.enrolledCourses.length}</p>
                <span className="text-[11px] text-gray-500">Active courses</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Assignments Done</span>
                <p className="text-2xl font-black text-[#F28C72] mt-1">
                  {child.assignments.filter(a => a.status !== 'pending').length} / {child.assignments.length}
                </p>
                <span className="text-[11px] text-gray-500">Submitted on schedule</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Certificates</span>
                <p className="text-2xl font-black text-[#F7C948] mt-1">{child.certificates.length}</p>
                <span className="text-[11px] text-gray-500">Verified credentials</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Progress */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
                <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#2454A6]" />
                  <span>{child.profile.name}'s Subject Mastery Progress</span>
                </h3>
                {child.progress.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No course progress yet.</p>
                ) : (
                  <div className="space-y-4">
                    {child.progress.map((prog, idx) => {
                      const pct = Math.round((prog.completedLessons / prog.totalLessons) * 100);
                      return (
                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#172B4D]">
                            <span>{prog.subject}</span>
                            <span className="text-[#35B8A6]">{pct}% Covered</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#35B8A6] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Tasks: {prog.completedLessons}/{prog.totalLessons}</span>
                            <span>Avg: <strong>{prog.scoreAvg > 0 ? `${prog.scoreAvg}%` : '—'}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feedback + tasks */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                  <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-[#35B8A6]" />
                    <span>Academic Observations</span>
                  </h3>
                  {child.assignments.filter(a => a.teacherFeedback).length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No teacher feedback yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {child.assignments.filter(a => a.teacherFeedback).slice(0, 4).map((fb) => (
                        <div key={fb.id} className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#2454A6]/10 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#2454A6]">{fb.courseName}</span>
                            <span className="text-gray-400">{fb.submittedAt}</span>
                          </div>
                          <p className="text-xs text-[#172B4D]/85 leading-relaxed italic">"{fb.teacherFeedback}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={onOpenConsultationRequest} className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-[#172B4D] font-bold text-xs py-3 rounded-xl transition-colors text-center">
                    Schedule Monthly Parent-Teacher Check-in
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                  <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#F28C72]" />
                    <span>Upcoming Tasks</span>
                  </h3>
                  {child.upcomingTasks.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#35B8A6]" /> All caught up!
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {child.upcomingTasks.map(t => (
                        <div key={t.id} className="p-3 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#172B4D]">{t.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{t.courseName}</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#F28C72] whitespace-nowrap">{t.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drive privacy note */}
                <div className="bg-[#FFF9EE] rounded-2xl p-5 border border-[#2454A6]/15 flex items-start space-x-3 text-xs text-[#172B4D]/85">
                  {selectedChildMeta?.driveConnected
                    ? <Cloud className="w-5 h-5 text-[#35B8A6] shrink-0 mt-0.5" />
                    : <CloudOff className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />}
                  <p className="leading-relaxed">
                    {selectedChildMeta?.driveConnected
                      ? <>Your child has connected their <strong>own Google Drive</strong> for learning files. That Drive authorization, its tokens and folder contents stay private to their account — parents never receive access.</>
                      : <>Your child hasn't connected Google Drive yet. When they do, files will be stored in <strong>their own Drive</strong> — never a shared Academy Drive — and tokens remain confidential.</>}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
