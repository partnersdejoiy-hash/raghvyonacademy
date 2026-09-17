import React from 'react';
import { 
  ArrowRight, 
  LogIn, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  BookOpen, 
  Globe2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Hero3DScene } from './Hero3DScene';

interface HeroProps {
  onOpenDemoBooking: () => void;
  onOpenLogin: () => void;
  onExploreCourses: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenDemoBooking,
  onOpenLogin,
  onExploreCourses
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#F7C948]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-[#35B8A6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Messaging & CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-[#2454A6]/15 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35B8A6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35B8A6]"></span>
              </span>
              <span className="text-xs font-bold text-[#2454A6] tracking-wide uppercase">
                Verified Faculty • 7+ Years Experience
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2454A6] tracking-tight leading-[1.12]">
                Learning Today for a{' '}
                <span className="text-[#35B8A6] relative inline-block">
                  Brighter
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-[#F7C948]"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 15 Q 50 0 100 15"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                Tomorrow
              </h1>
              <p className="text-lg sm:text-xl text-[#172B4D]/80 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                At <span className="font-bold text-[#172B4D]">RAGHVYON ACADEMY</span>, we help students build strong concepts, confidence and the skills needed for a brighter future.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              {/* Primary CTA */}
              <button
                onClick={onOpenDemoBooking}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-base px-7 py-4 rounded-2xl shadow-md shadow-[#2454A6]/25 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <span>Book a Free Demo Class</span>
                <ArrowRight className="w-5 h-5 text-[#F7C948]" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-[#172B4D] border-2 border-gray-200 font-bold text-base px-6 py-4 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-[#2454A6]" />
                <span>Student Login</span>
              </button>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/12133960065"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-base px-6 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Student & Parent Social Proof Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Student Aarav"
                  referrerPolicy="no-referrer"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Student Priya"
                  referrerPolicy="no-referrer"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Parent David"
                  referrerPolicy="no-referrer"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Parent Sunita"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center space-x-1 text-[#F7C948]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-[#172B4D] ml-1">4.9/5</span>
                </div>
                <span className="text-[#172B4D]/75 font-medium">
                  Trusted by 500+ students & families across India & USA
                </span>
              </div>
            </div>

            {/* Verified Highlights Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#2454A6]/10 text-left">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B8A6] mt-0.5 shrink-0" />
                <span className="text-xs font-semibold text-[#172B4D]/80">Concept-Focused Learning</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B8A6] mt-0.5 shrink-0" />
                <span className="text-xs font-semibold text-[#172B4D]/80">India & US Student Reach</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#35B8A6] mt-0.5 shrink-0" />
                <span className="text-xs font-semibold text-[#172B4D]/80">Personalized Diagnostic Pace</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Educational Mascot & Canvas */}
          <div className="lg:col-span-6 relative">
            <Hero3DScene />
            
            {/* Floating Live Session Educational Card */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-200/90 shadow-lg items-center space-x-3 max-w-xs z-20 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-2xs relative">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Live 1-on-1 Mentoring"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#2454A6]/10 mix-blend-multiply" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172B4D]">Live 1-on-1 Sessions</p>
                <p className="text-[11px] text-[#172B4D]/75 font-medium">Dual curriculum ready: India & US</p>
              </div>
            </div>

            {/* Top-Right Floating Educational Excellence Badge */}
            <div className="hidden sm:flex absolute -top-5 -right-3 bg-white/95 backdrop-blur-md p-2.5 pr-4 rounded-2xl border border-gray-200/90 shadow-lg items-center space-x-3 z-20 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#35B8A6]/40 shadow-2xs relative">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Concept Mastery"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#35B8A6]/10 mix-blend-multiply" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172B4D] flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#35B8A6]" />
                  <span>Concept Mastery</span>
                </p>
                <p className="text-[11px] text-[#172B4D]/75 font-medium">Zero Rote Memorization</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
