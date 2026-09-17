import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Header
} from './components/Header';
import {
  Hero
} from './components/Hero';
import {
  TrustTeacherSection
} from './components/TrustTeacherSection';
import {
  SubjectsCoursesSection
} from './components/SubjectsCoursesSection';
import {
  TeachingApproachSection
} from './components/TeachingApproachSection';
import {
  TestimonialsSection
} from './components/TestimonialsSection';
import {
  Footer
} from './components/Footer';
import {
  PortalLoadingFallback
} from './components/PortalLoadingFallback';
import { api, ApiUser, ApiCourse } from './lib/api';
import { TeacherProfile } from './types';
import { INITIAL_TEACHER_PROFILE } from './data/initialData';

// Code Splitting: Lazy-loaded Dashboards and Portals
const StudentDashboard = lazy(() =>
  import('./components/StudentDashboard').then(m => ({ default: m.StudentDashboard }))
);
const ParentDashboard = lazy(() =>
  import('./components/ParentDashboard').then(m => ({ default: m.ParentDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const DocumentationView = lazy(() =>
  import('./components/DocumentationView').then(m => ({ default: m.DocumentationView }))
);

// Code Splitting: Lazy-loaded Modals
const LoginModal = lazy(() =>
  import('./components/LoginModal').then(m => ({ default: m.LoginModal }))
);
const DemoBookingModal = lazy(() =>
  import('./components/DemoBookingModal').then(m => ({ default: m.DemoBookingModal }))
);
const EnquiryModal = lazy(() =>
  import('./components/EnquiryModal').then(m => ({ default: m.EnquiryModal }))
);
const CourseDetailModal = lazy(() =>
  import('./components/CourseDetailModal').then(m => ({ default: m.CourseDetailModal }))
);
const AIStudyAssistantModal = lazy(() =>
  import('./components/AIStudyAssistantModal').then(m => ({ default: m.AIStudyAssistantModal }))
);
import {
  CheckCircle2,
  X,
  MessageSquare,
  ArrowRight,
  Globe2
} from 'lucide-react';

type View = 'home' | 'student' | 'parent' | 'admin' | 'docs';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [serverConfig, setServerConfig] = useState({ googleSignIn: false, driveOAuth: false, gemini: false, demoMode: true });

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(INITIAL_TEACHER_PROFILE);

  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false);
  const [aiAssistantInitialTopic, setAiAssistantInitialTopic] = useState<string | undefined>(undefined);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<ApiCourse | null>(null);
  const [modalPreselectedCourse, setModalPreselectedCourse] = useState<ApiCourse | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  /* --- Boot: server config + public courses + session --------------- */
  useEffect(() => {
    api.config().then(setServerConfig).catch(() => {});
    api.courses().then(d => setCourses(d.courses)).catch(() => {});
    api.teacherProfile().then(d => { if (d.teacherProfile) setTeacherProfile(d.teacherProfile); }).catch(() => {});
    api.session()
      .then(({ user }) => {
        setCurrentUser(user);
        if (user) {
          const intended = sessionStorage.getItem('raghvyon.intendedView') as View | null;
          const roleView = user.role as View;
          if (intended && intended === roleView) setCurrentView(intended);
          else setCurrentView(roleView);
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  /* --- OAuth return handling (/dashboard?drive=connected|failed) ----- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const drive = params.get('drive');
    if (drive) {
      if (drive === 'connected') showToast('Google Drive connected! Your learning folder is ready in your own Drive.');
      else if (drive === 'cancelled') showToast('Google Drive connection was cancelled. Your Academy account is still active.');
      else if (drive === 'failed') showToast('Google Drive couldn\'t be connected. Your Academy account is still active. Please try again.');
      else if (drive === 'state_error') showToast('Google Drive connection could not be verified. Please try again.');
      window.history.replaceState({}, '', '/dashboard');
    }
    const authError = params.get('error');
    if (authError) {
      const messages: Record<string, string> = {
        google_cancelled: 'Google sign-in was cancelled. Please try again.',
        oauth_state: 'Sign-in could not be verified (invalid state). Please try again.',
        google_failed: 'Google sign-in failed. Your Academy account is unaffected — please try again.',
        google_email_unverified: 'Your Google email is not verified. Please use a verified Google account.',
        session_expired: 'Your session expired. Please sign in again.',
      };
      showToast(messages[authError] || 'Sign-in issue. Please try again.');
      window.history.replaceState({}, '', '/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (view: View, sectionId?: string) => {
    if ((view === 'student' || view === 'parent' || view === 'admin') && (!currentUser || currentUser.role !== view)) {
      // Not authorized for that portal → ask to sign in.
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
    if (view === 'home' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = (user: ApiUser) => {
    setCurrentUser(user);
    setCurrentView(user.role as View);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    setCurrentUser(null);
    setCurrentView('home');
    showToast('Successfully signed out.');
  };

  /* --- Public form submissions -------------------------------------- */
  const handleDemoBookingSubmit = async (bookingData: any) => {
    try {
      await api.bookDemo(bookingData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      throw err;
    }
    showToast('Free Demo Class Request Received! Our faculty will confirm via WhatsApp.');
  };

  const handleEnquirySubmit = async (enquiryData: any) => {
    try {
      await api.submitEnquiry(enquiryData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Enquiry failed. Please try again.');
      throw err;
    }
    showToast('Enquiry Submitted! We will respond within 4 hours.');
  };

  const handleOpenDemoWithCourse = (course?: ApiCourse) => {
    setModalPreselectedCourse(course || null);
    setIsDemoModalOpen(true);
  };
  const handleOpenEnquiryWithCourse = (course?: ApiCourse) => {
    setModalPreselectedCourse(course || null);
    setIsEnquiryModalOpen(true);
  };
  const handleOpenAIAssistant = (topic?: string) => {
    setAiAssistantInitialTopic(topic);
    setIsAIAssistantModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EE] text-[#172B4D] selection:bg-[#35B8A6] selection:text-white font-sans antialiased">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B4D] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-[#35B8A6]/40 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm" role="status">
          <CheckCircle2 className="w-5 h-5 text-[#35B8A6] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 text-gray-400 hover:text-white rounded-md" aria-label="Dismiss notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenDemoBooking={() => handleOpenDemoWithCourse()}
        onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <div className="space-y-0">
            <Hero
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onExploreCourses={() => handleNavigate('home', 'courses')}
            />
            <TrustTeacherSection
              teacherProfile={teacherProfile}
              onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
              onOpenDemoBooking={() => handleOpenDemoWithCourse()}
            />
            <SubjectsCoursesSection
              courses={courses}
              onOpenDemoBooking={(c) => handleOpenDemoWithCourse(c)}
              onOpenEnquiry={(c) => handleOpenEnquiryWithCourse(c)}
              onSelectCourse={(c) => setSelectedCourseForDetail(c)}
            />
            <TeachingApproachSection onOpenDemoBooking={() => handleOpenDemoWithCourse()} />
            <TestimonialsSection onOpenDemoBooking={() => handleOpenDemoWithCourse()} />
            <section id="contact" className="py-16 sm:py-20 bg-white border-t border-[#2454A6]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-[#FFF9EE] to-white rounded-3xl p-8 sm:p-12 border-2 border-[#2454A6]/15 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center space-x-1.5 bg-white border border-[#2454A6]/15 px-3 py-1 rounded-full text-xs font-bold text-[#2454A6]">
                        <Globe2 className="w-3.5 h-3.5 text-[#35B8A6]" />
                        <span>DELHI ACADEMY & GLOBAL ONLINE CLASSROOMS</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2454A6] tracking-tight">
                        Have Questions Regarding Curriculum or Batches?
                      </h2>
                      <p className="text-sm sm:text-base text-[#172B4D]/75 max-w-xl">
                        Connect directly with our lead academic mentor on WhatsApp or book a free 45-minute concept diagnostic assessment.
                      </p>
                      <div className="pt-2 text-xs font-semibold text-gray-500">
                        Official Premises: House no: J-393, Dakshinpuri, New Delhi-110062
                      </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                      <a
                        href="https://wa.me/12133960065"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 text-center"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Chat on WhatsApp (+1 213 396-0065)</span>
                      </a>
                      <button
                        onClick={() => handleOpenDemoWithCourse()}
                        className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Schedule Free Demo Session</span>
                        <ArrowRight className="w-4 h-4 text-[#F7C948]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'student' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Student Learning Portal..." />}>
            <StudentDashboard
              user={currentUser}
              onOpenAIAssistant={handleOpenAIAssistant}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          </Suspense>
        )}

        {currentView === 'parent' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Parent Oversight Portal..." />}>
            <ParentDashboard
              user={currentUser}
              onOpenConsultationRequest={() => handleOpenEnquiryWithCourse()}
              onLogout={handleLogout}
              showToast={showToast}
            />
          </Suspense>
        )}

        {currentView === 'admin' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Faculty Administration Portal..." />}>
            <AdminDashboard
              user={currentUser}
              onLogout={handleLogout}
              showToast={showToast}
              onNavigate={handleNavigate}
            />
          </Suspense>
        )}

        {currentView === 'docs' && (
          <Suspense fallback={<PortalLoadingFallback message="Loading Academy Architectural Documentation..." />}>
            <DocumentationView />
          </Suspense>
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenDemoBooking={() => handleOpenDemoWithCourse()}
        onOpenEnquiry={() => handleOpenEnquiryWithCourse()}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <Suspense fallback={<PortalLoadingFallback isModal />}>
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            googleSignInEnabled={serverConfig.googleSignIn}
            demoMode={serverConfig.demoMode}
          />
        )}
        {isDemoModalOpen && (
          <DemoBookingModal
            isOpen={isDemoModalOpen}
            onClose={() => { setIsDemoModalOpen(false); setModalPreselectedCourse(null); }}
            preselectedCourse={modalPreselectedCourse}
            onBookingSubmitted={handleDemoBookingSubmit}
          />
        )}
        {isEnquiryModalOpen && (
          <EnquiryModal
            isOpen={isEnquiryModalOpen}
            onClose={() => { setIsEnquiryModalOpen(false); setModalPreselectedCourse(null); }}
            preselectedCourse={modalPreselectedCourse}
            onEnquirySubmitted={handleEnquirySubmit}
          />
        )}
        {selectedCourseForDetail && (
          <CourseDetailModal
            course={selectedCourseForDetail}
            onClose={() => setSelectedCourseForDetail(null)}
            onBookDemo={(c) => { setSelectedCourseForDetail(null); handleOpenDemoWithCourse(c); }}
            onEnquire={(c) => { setSelectedCourseForDetail(null); handleOpenEnquiryWithCourse(c); }}
          />
        )}
        {isAIAssistantModalOpen && (
          <AIStudyAssistantModal
            isOpen={isAIAssistantModalOpen}
            onClose={() => setIsAIAssistantModalOpen(false)}
            initialTopic={aiAssistantInitialTopic}
          />
        )}
      </Suspense>
    </div>
  );
}
