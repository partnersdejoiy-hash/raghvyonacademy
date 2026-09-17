import React from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MessageSquare, 
  HeartHandshake, 
  Award,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Course, Assignment, LearningProgress, TeacherFeedback } from '../types';

interface ParentDashboardProps {
  parentUser: UserProfile;
  childProfile: {
    name: string;
    grade: string;
    studentId: string;
    attendanceOverall: string;
    enrolledCourses: Course[];
    assignments: Assignment[];
    progress: LearningProgress[];
    feedback: TeacherFeedback[];
  };
  onOpenConsultationRequest: () => void;
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentUser,
  childProfile,
  onOpenConsultationRequest,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-[#FFF9EE]/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Parent Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {parentUser.avatar ? (
              <img
                src={parentUser.avatar}
                alt={parentUser.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover shadow-md shadow-[#35B8A6]/20 border-2 border-white shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#35B8A6] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#35B8A6]/20 shrink-0">
                <UserCheck className="w-8 h-8" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#172B4D]">{parentUser.name}</h1>
                <span className="bg-[#35B8A6]/15 text-[#218174] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#35B8A6]/30">
                  Verified Parent Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-0.5">
                Linked Student: <strong className="text-[#2454A6]">{childProfile.name}</strong> ({childProfile.grade} • ID: {childProfile.studentId})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenConsultationRequest}
              className="flex items-center space-x-1.5 bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <HeartHandshake className="w-4 h-4 text-[#F7C948]" />
              <span>Request Teacher Consultation</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Security & Minor Consent Safeguard Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Verified Parent-Child Access Isolation</span>
            <p className="text-emerald-800/90 leading-relaxed">
              Parents have authorized access to curriculum completion, attendance, and teacher feedback for <strong>{childProfile.name}</strong>.
              In accordance with minor digital privacy standards, student personal Google Drive cloud tokens remain confidential to the student's individual account.
            </p>
          </div>
        </div>

        {/* Key Child Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Child Attendance</span>
            <p className="text-2xl font-black text-[#35B8A6] mt-1">{childProfile.attendanceOverall}</p>
            <span className="text-[11px] text-gray-500">Regular, on-time presence</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Enrolled Subjects</span>
            <p className="text-2xl font-black text-[#2454A6] mt-1">{childProfile.enrolledCourses.length}</p>
            <span className="text-[11px] text-gray-500">Math, Science, English</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Completed Assignments</span>
            <p className="text-2xl font-black text-[#F28C72] mt-1">
              {childProfile.assignments.filter(a => a.status !== 'pending').length} / {childProfile.assignments.length}
            </p>
            <span className="text-[11px] text-gray-500">Submitted on schedule</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase">Mentor Rating</span>
            <p className="text-2xl font-black text-amber-500 mt-1">4.9 / 5</p>
            <span className="text-[11px] text-gray-500">Based on concept mastery</span>
          </div>
        </div>

        {/* Subject Progress & Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Academic Progress */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#2454A6]" />
              <span>{childProfile.name}'s Subject Mastery Progress</span>
            </h3>

            <div className="space-y-4">
              {childProfile.progress.map((prog, idx) => {
                const pct = Math.round((prog.completedLessons / prog.totalLessons) * 100);
                return (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#172B4D]">
                      <span>{prog.subject}</span>
                      <span className="text-[#35B8A6]">{pct}% Syllabus Covered</span>
                    </div>

                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#35B8A6] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Lessons: {prog.completedLessons}/{prog.totalLessons}</span>
                      <span>Concept Evaluation Avg: <strong>{prog.scoreAvg}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Teacher Observations & Feedback for Parents */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[#35B8A6]" />
              <span>Academic Observations for Parents</span>
            </h3>

            <div className="space-y-4">
              {childProfile.feedback.map((fb) => (
                <div key={fb.id} className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#2454A6]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2454A6]">{fb.courseName}</span>
                    <span className="text-gray-400">{fb.date}</span>
                  </div>
                  <p className="text-xs text-[#172B4D]/85 leading-relaxed italic">
                    "{fb.comment}"
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-800 font-semibold">
                    Strengths: {fb.strengths.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenConsultationRequest}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-[#172B4D] font-bold text-xs py-3 rounded-xl transition-colors text-center"
            >
              Schedule Monthly Parent-Teacher Check-in
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
