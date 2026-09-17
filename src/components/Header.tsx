import React, { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  LogIn,
  UserCheck,
  ShieldCheck,
  FileText,
  BookOpen,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { ApiUser } from '../lib/api';

interface HeaderProps {
  currentView: 'home' | 'student' | 'parent' | 'admin' | 'docs';
  onNavigate: (view: 'home' | 'student' | 'parent' | 'admin' | 'docs', sectionId?: string) => void;
  currentUser: ApiUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDemoBooking: () => void;
  onOpenEnquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenDemoBooking,
  onOpenEnquiry,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId?: string) => {
    onNavigate('home', sectionId);
    setMobileMenuOpen(false);
  };

  const isAuthed = !!currentUser && currentUser.role !== 'guest';

  return (
    <header className="sticky top-0 z-50 bg-[#FFF9EE]/90 backdrop-blur-md border-b border-[#2454A6]/10">
      {/* Top bar */}
      <div className="bg-[#2454A6] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="bg-[#35B8A6] text-white px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide">
              ADMISSIONS OPEN
            </span>
            <span>Free Diagnostic Assessment & Concept Demo Session for Grades 2–10</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/12133960065"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-[#F7C948] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#35B8A6]" />
              <span className="font-medium">+1 (213) 396-0065 (WhatsApp)</span>
            </a>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/80">New Delhi-110062 & Global Online</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => handleNavClick()}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2454A6] flex items-center justify-center text-white shadow-md shadow-[#2454A6]/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-7 h-7 text-[#F7C948]" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#2454A6] tracking-tight">
                RAGHVYON <span className="text-[#35B8A6]">ACADEMY</span>
              </span>
              <span className="block text-xs font-semibold text-[#172B4D]/75 tracking-wider uppercase">
                Learn Today. Lead Tomorrow.
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center space-x-7" aria-label="Main navigation">
            {[
              ['', 'Home'],
              ['about', 'About'],
              ['courses', 'Courses'],
              ['subjects', 'Subjects'],
              ['approach', 'Teaching Approach'],
              ['teacher', 'Faculty'],
              ['contact', 'Contact'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => handleNavClick(id || undefined)}
                className={`text-sm font-semibold transition-colors ${
                  currentView === 'home' ? 'text-[#2454A6]' : 'text-[#172B4D]/80 hover:text-[#2454A6]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center space-x-3">
            {isAuthed && (
              <div className="flex items-center bg-white/80 border border-gray-200 rounded-full p-1 shadow-xs text-xs font-semibold">
                {currentUser!.role === 'student' && (
                  <button
                    onClick={() => onNavigate('student')}
                    className={`px-3 py-1.5 rounded-full flex items-center space-x-1 transition-colors ${
                      currentView === 'student' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Student Portal</span>
                  </button>
                )}
                {currentUser!.role === 'parent' && (
                  <button
                    onClick={() => onNavigate('parent')}
                    className={`px-3 py-1.5 rounded-full flex items-center space-x-1 transition-colors ${
                      currentView === 'parent' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Parent Portal</span>
                  </button>
                )}
                {currentUser!.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`px-3 py-1.5 rounded-full flex items-center space-x-1 transition-colors ${
                      currentView === 'admin' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Portal</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onOpenDemoBooking}
              className="bg-[#F7C948] hover:bg-[#eab308] text-[#172B4D] font-bold text-xs px-4 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              Book Free Demo
            </button>

            {isAuthed ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#172B4D] max-w-[110px] truncate">
                  {currentUser!.name}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 font-semibold text-xs px-3 py-2 rounded-full transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 border border-[#2454A6] text-[#2454A6] hover:bg-[#2454A6] hover:text-white font-semibold text-xs px-3.5 py-2 rounded-full transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
            )}
          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenDemoBooking}
              className="bg-[#F7C948] text-[#172B4D] font-bold text-xs px-3 py-1.5 rounded-full sm:hidden"
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#172B4D] hover:bg-black/5"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF9EE] border-b border-[#2454A6]/15 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {isAuthed && (
            <div className="grid grid-cols-1 gap-2 pb-3 border-b border-gray-200">
              {currentUser!.role === 'student' && (
                <button
                  onClick={() => { onNavigate('student'); setMobileMenuOpen(false); }}
                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center space-x-2 ${
                    currentView === 'student' ? 'bg-[#2454A6] text-white border-[#2454A6]' : 'bg-white text-[#172B4D]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Student Learning Portal</span>
                </button>
              )}
              {currentUser!.role === 'parent' && (
                <button
                  onClick={() => { onNavigate('parent'); setMobileMenuOpen(false); }}
                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center space-x-2 ${
                    currentView === 'parent' ? 'bg-[#2454A6] text-white border-[#2454A6]' : 'bg-white text-[#172B4D]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Parent Progress Portal</span>
                </button>
              )}
              {currentUser!.role === 'admin' && (
                <button
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center space-x-2 ${
                    currentView === 'admin' ? 'bg-[#2454A6] text-white border-[#2454A6]' : 'bg-white text-[#172B4D]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Faculty Administration</span>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-3 font-semibold text-sm text-[#172B4D]">
            <button onClick={() => handleNavClick()} className="text-left py-1 hover:text-[#2454A6]">Home</button>
            <button onClick={() => handleNavClick('about')} className="text-left py-1 hover:text-[#2454A6]">About RAGHVYON</button>
            <button onClick={() => handleNavClick('courses')} className="text-left py-1 hover:text-[#2454A6]">Courses & Batches</button>
            <button onClick={() => handleNavClick('subjects')} className="text-left py-1 hover:text-[#2454A6]">Subjects & Curriculum</button>
            <button onClick={() => handleNavClick('approach')} className="text-left py-1 hover:text-[#2454A6]">Concept-Focused Approach</button>
            <button onClick={() => handleNavClick('teacher')} className="text-left py-1 hover:text-[#2454A6]">Faculty Profile</button>
            <button onClick={() => handleNavClick('contact')} className="text-left py-1 hover:text-[#2454A6]">Contact & Location</button>
            <button onClick={() => { onNavigate('docs'); setMobileMenuOpen(false); }} className="text-left py-1 text-[#35B8A6]">
              Architecture & Documentation
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
            <button
              onClick={() => { onOpenDemoBooking(); setMobileMenuOpen(false); }}
              className="w-full bg-[#F7C948] text-[#172B4D] font-bold py-2.5 rounded-xl shadow-xs text-sm text-center"
            >
              Book a Free Demo Class
            </button>
            <button
              onClick={() => { onOpenEnquiry(); setMobileMenuOpen(false); }}
              className="w-full border border-gray-200 bg-white text-[#172B4D] font-bold py-2 rounded-xl text-sm text-center"
            >
              Submit Enquiry
            </button>
            {isAuthed ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full border border-red-200 text-red-600 font-bold py-2 rounded-xl text-sm text-center flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser!.name})</span>
              </button>
            ) : (
              <button
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="w-full border border-[#2454A6] text-[#2454A6] font-bold py-2 rounded-xl text-sm text-center flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Student / Parent Login</span>
              </button>
            )}
            <a
              href="https://wa.me/12133960065"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white font-bold py-2 rounded-xl text-sm text-center flex items-center justify-center space-x-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
