import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Globe2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'student' | 'parent' | 'admin' | 'docs', sectionId?: string) => void;
  onOpenDemoBooking: () => void;
  onOpenEnquiry: () => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenDemoBooking,
  onOpenEnquiry,
  onOpenLogin
}) => {
  return (
    <footer className="bg-[#172B4D] text-white pt-16 pb-12 border-t border-[#2454A6]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2454A6] flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-7 h-7 text-[#F7C948]" />
              </div>
              <div>
                <span className="block text-xl font-black text-white tracking-tight">
                  RAGHVYON <span className="text-[#35B8A6]">ACADEMY</span>
                </span>
                <span className="block text-xs font-semibold text-white/70 tracking-wider uppercase">
                  Learn Today. Lead Tomorrow.
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              At RAGHVYON ACADEMY, we help students build strong concepts, confidence and the skills needed for a brighter future. Mentoring students across India and American curricula.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://wa.me/12133960065"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat: +1 (213) 396-0065</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#F7C948] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'courses')} className="hover:text-white transition-colors">
                  Subjects & Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'approach')} className="hover:text-white transition-colors">
                  Teaching Approach
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'teacher')} className="hover:text-white transition-colors">
                  Faculty Credentials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="text-[#35B8A6] hover:underline font-bold">
                  System Specs & Docs
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Access Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#F7C948] uppercase tracking-wider">
              Academic Portals
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">
                  Student Learning Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('parent')} className="hover:text-white transition-colors">
                  Parent Progress Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white transition-colors">
                  Faculty Administration
                </button>
              </li>
              <li>
                <button onClick={onOpenDemoBooking} className="text-[#F7C948] hover:underline font-bold">
                  Book 1-on-1 Free Demo Class
                </button>
              </li>
              <li>
                <button onClick={onOpenEnquiry} className="hover:text-white transition-colors">
                  Submit Academic Enquiry
                </button>
              </li>
            </ul>
          </div>

          {/* Official Location & Contact Column */}
          <div className="lg:col-span-3 space-y-3 text-xs text-white/80">
            <h4 className="text-xs font-bold text-[#F7C948] uppercase tracking-wider">
              Verified Campus Location
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#F28C72] shrink-0 mt-0.5" />
                <span>
                  House no: J-393, Dakshinpuri,<br />
                  New Delhi-110062, India
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#35B8A6] shrink-0" />
                <span>+1 (213) 396-0065 (WhatsApp)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#2454A6] shrink-0" />
                <span>contact@raghvyonacademy.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-[#F7C948] shrink-0" />
                <span>Global Online Batches (India & USA)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Ethical Standards & Minor Privacy Notice */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 text-[11px] text-white/70 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-[#35B8A6]" />
              <span>Ethical Disclosure & Minor Safety Commitment</span>
            </div>
            <p className="leading-relaxed">
              RAGHVYON ACADEMY operates with verified business and faculty information. We never publish unverified degrees, fabricated student ratings, or simulated pass rates. For students under 18 years of age, access is supervised by parents and verified through strict role-based data isolation. Google Drive integrations use strictly isolated <code>drive.file</code> permissions, never exposing personal Google cloud data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© {new Date().getFullYear()} RAGHVYON ACADEMY. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Parental Safeguards</span>
              <span>•</span>
              <span>Terms of Enrollment</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
