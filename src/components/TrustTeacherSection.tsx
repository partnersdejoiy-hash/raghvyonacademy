import React from 'react';
import { 
  Award, 
  CheckCircle, 
  Globe, 
  HeartHandshake, 
  Lightbulb, 
  Mail, 
  MapPin, 
  Phone, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface TrustTeacherSectionProps {
  teacherProfile: TeacherProfile;
  onOpenEnquiry: () => void;
  onOpenDemoBooking: () => void;
}

export const TrustTeacherSection: React.FC<TrustTeacherSectionProps> = ({
  teacherProfile,
  onOpenEnquiry,
  onOpenDemoBooking
}) => {
  return (
    <section id="teacher" className="py-16 sm:py-20 bg-white border-y border-[#2454A6]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-[#FFF9EE] border border-[#2454A6]/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2454A6] mb-3">
            <Award className="w-3.5 h-3.5 text-[#F7C948]" />
            <span>VERIFIED ACADEMIC FACULTY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2454A6] tracking-tight">
            Meet Your Mentor & Educator
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#172B4D]/75">
            Transparent, verified teaching credentials backed by a concept-first philosophy and a student-friendly environment.
          </p>
        </div>

        {/* Teacher Profile Card */}
        <div className="bg-[#FFF9EE] rounded-3xl border border-[#2454A6]/15 shadow-sm p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Teacher Portrait & Direct Contact Card */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-6">
              
              {/* Photo Frame */}
              <div className="relative group">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-[#2454A6] to-[#172B4D] p-1.5 shadow-md shadow-[#2454A6]/20">
                  <div className="w-full h-full rounded-[22px] overflow-hidden relative border border-white bg-slate-100">
                    <img
                      src={teacherProfile.photoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=80"}
                      alt={teacherProfile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/35 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute -bottom-3 bg-[#F7C948] text-[#172B4D] font-extrabold text-xs px-4 py-1.5 rounded-full shadow-md border border-white flex items-center space-x-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-[#172B4D]" />
                  <span>7+ Years Teaching Experience</span>
                </div>
              </div>

              {/* Title & Reach */}
              <div className="space-y-1.5 pt-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#2454A6]">
                  {teacherProfile.name}
                </h3>
                <p className="text-sm font-semibold text-[#35B8A6]">
                  {teacherProfile.title}
                </p>
                <div className="inline-flex items-center space-x-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#172B4D]/80">
                  <Globe className="w-3.5 h-3.5 text-[#2454A6]" />
                  <span>India & US Students</span>
                </div>
              </div>

              {/* Direct Verified Contact Details */}
              <div className="w-full bg-white rounded-2xl p-4 border border-gray-200/80 text-left space-y-2.5 text-xs text-[#172B4D]/80">
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-[#35B8A6] shrink-0" />
                  <span className="font-semibold">{teacherProfile.phone}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-[#2454A6] shrink-0" />
                  <span className="font-medium truncate">{teacherProfile.contactEmail}</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-[#F28C72] shrink-0 mt-0.5" />
                  <span>{teacherProfile.address}</span>
                </div>
              </div>

              {/* Quick Action */}
              <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-2">
                <button
                  onClick={onOpenDemoBooking}
                  className="w-full bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Book Free Demo with Teacher</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F7C948]" />
                </button>
                <button
                  onClick={onOpenEnquiry}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-[#172B4D] font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  Send Direct Enquiry
                </button>
              </div>

            </div>

            {/* Right: Verified Bio, Methodology, and Subjects */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Professional Biography */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-[#2454A6] flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-[#F7C948]" />
                  <span>Professional Biography & Teaching Mission</span>
                </h4>
                <p className="text-[#172B4D]/85 leading-relaxed text-sm sm:text-base">
                  {teacherProfile.bio}
                </p>
                
                {/* Note regarding placeholder data integrity */}
                <div className="bg-white/80 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-900 flex items-start space-x-2">
                  <span className="font-bold shrink-0">Ethical Data Standard:</span>
                  <span>
                    RAGHVYON ACADEMY adheres to verified disclosure. We do not invent unverified degrees, pass percentages, or fabricated awards. Academic details reflect genuine classroom mentoring experience.
                  </span>
                </div>
              </div>

              {/* Teaching Methodology Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-[#2454A6] flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-[#35B8A6]" />
                  <span>Core Teaching Methodology</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teacherProfile.methodology.map((method, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-start space-x-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#35B8A6]/15 flex items-center justify-center text-[#35B8A6] font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#172B4D]">
                        {method}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects Taught */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#2454A6]">
                  Disciplines & Subjects Mentored
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacherProfile.subjectsTaught.map((subject, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-[#172B4D] border border-[#2454A6]/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Verified Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-black text-[#2454A6]">7+</div>
                  <div className="text-xs font-semibold text-[#172B4D]/75">Years Teaching Experience</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-black text-[#35B8A6]">Dual Focus</div>
                  <div className="text-xs font-semibold text-[#172B4D]/75">India & US Standard Curricula</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-black text-[#F28C72]">100%</div>
                  <div className="text-xs font-semibold text-[#172B4D]/75">Concept-First Pedagogy</div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Interactive Classroom Atmosphere & Mentorship in Action Gallery */}
        <div className="mt-12 sm:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-[#35B8A6] uppercase tracking-wider block">
                AUTHENTIC LEARNING ATMOSPHERE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2454A6]">
                Mentorship in Action
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#172B4D]/70 max-w-md">
              Focused, positive, and patient teaching environments designed to foster genuine intellectual curiosity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Moment 1 */}
            <div className="group bg-[#FFF9EE] rounded-2xl overflow-hidden border border-[#2454A6]/10 shadow-2xs hover:shadow-md transition-all">
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&h=400&q=80"
                  alt="1-on-1 Interactive Doubt Resolution"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-[#172B4D]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  1-on-1 Mentorship
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-[#172B4D] mb-1">
                  Individual Diagnostic Attention
                </h4>
                <p className="text-xs text-[#172B4D]/70 leading-relaxed">
                  Every concept is explored patiently until the student smiles with genuine clarity.
                </p>
              </div>
            </div>

            {/* Moment 2 */}
            <div className="group bg-[#FFF9EE] rounded-2xl overflow-hidden border border-[#2454A6]/10 shadow-2xs hover:shadow-md transition-all">
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Visual Concept Models & STEM"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-[#2454A6]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  Visual STEM Pedagogy
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-[#172B4D] mb-1">
                  Mathematical & Scientific Intuition
                </h4>
                <p className="text-xs text-[#172B4D]/70 leading-relaxed">
                  Replacing rote formulas with concrete geometric models and real-world mechanisms.
                </p>
              </div>
            </div>

            {/* Moment 3 */}
            <div className="group bg-[#FFF9EE] rounded-2xl overflow-hidden border border-[#2454A6]/10 shadow-2xs hover:shadow-md transition-all">
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Engaged and Confident Learners"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-[#35B8A6]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  Active Confidence
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-[#172B4D] mb-1">
                  Confidence That Crosses Borders
                </h4>
                <p className="text-xs text-[#172B4D]/70 leading-relaxed">
                  Dual-curriculum preparation empowering students in India and North America equally.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
