import React from 'react';
import { 
  Target, 
  Smile, 
  Compass, 
  Layers, 
  BrainCircuit, 
  Check, 
  Globe2, 
  ArrowRight 
} from 'lucide-react';

interface TeachingApproachSectionProps {
  onOpenDemoBooking: () => void;
}

export const TeachingApproachSection: React.FC<TeachingApproachSectionProps> = ({
  onOpenDemoBooking
}) => {
  const pillars = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-[#2454A6]" />,
      title: 'Concept-First, Formula-Second',
      description: 'We avoid mechanical cramming. By visualizing mathematical principles and scientific mechanisms first, formulas become natural intuitive conclusions.'
    },
    {
      icon: <Target className="w-6 h-6 text-[#35B8A6]" />,
      title: 'Personalized Diagnostic Pace',
      description: 'Every student thinks differently. We diagnose conceptual sticking points through gentle diagnostic questions and adapt pacing to student comfort.'
    },
    {
      icon: <Smile className="w-6 h-6 text-[#F28C72]" />,
      title: 'Encouraging & Student-Friendly',
      description: 'Mistakes are celebrated as discovery milestones. We maintain an affirming atmosphere where students never hesitate to ask "why" multiple times.'
    },
    {
      icon: <Globe2 className="w-6 h-6 text-[#F7C948]" />,
      title: 'Cross-Curriculum Global Fluency',
      description: 'Over 7 years of teaching experience with both students in India (CBSE/ICSE) and American students (Common Core, Pre-Algebra, AP Prep) ensures global standards.'
    }
  ];

  return (
    <section id="approach" className="py-16 sm:py-24 bg-white border-b border-[#2454A6]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 bg-[#FFF9EE] border border-[#2454A6]/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2454A6] mb-3">
            <Compass className="w-3.5 h-3.5 text-[#35B8A6]" />
            <span>PEDAGOGY THAT EMPOWERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2454A6] tracking-tight">
            How We Build Lasting Confidence
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#172B4D]/75">
            Real academic success happens when anxiety is replaced with genuine curiosity and clarity.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-14">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-[#FFF9EE]/50 rounded-3xl p-6 sm:p-7 border border-[#2454A6]/10 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-gray-100">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-[#172B4D]">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#172B4D]/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#2454A6]/10 flex items-center space-x-1 text-xs font-bold text-[#2454A6]">
                <Check className="w-3.5 h-3.5 text-[#35B8A6]" />
                <span>Verified Classroom Practice</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Pedagogy Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          
          {/* Card 1: Traditional Rote */}
          <div className="bg-red-50/40 rounded-3xl p-6 sm:p-8 border border-red-200/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden relative shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&h=260&q=80"
                  alt="Traditional Rote Memorization"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-80"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  Conventional Method
                </span>
              </div>
              <h3 className="text-lg font-bold text-red-900">
                Formula Memorization Without Visual Intuition
              </h3>
              <ul className="space-y-2 text-xs text-red-950/75">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Students memorize formulas blindly without knowing why they work.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Unfamiliar exam question structures cause instant confusion and anxiety.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Students feel hesitant to ask foundational questions repeatedly.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Raghvyon Concept First */}
          <div className="bg-[#FFF9EE] rounded-3xl p-6 sm:p-8 border-2 border-[#35B8A6]/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden relative shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=260&q=80"
                  alt="The Raghvyon Conceptual Breakthrough"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-[#35B8A6] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                  The Raghvyon Way
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2454A6]">
                Conceptual Clarity & Self-Directed Problem Solving
              </h3>
              <ul className="space-y-2 text-xs text-[#172B4D]/80">
                <li className="flex items-start space-x-2">
                  <span className="text-[#35B8A6] font-bold shrink-0">✓</span>
                  <span>Visual derivations & interactive models transform formulas into common sense.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#35B8A6] font-bold shrink-0">✓</span>
                  <span>Students independently deconstruct complex word problems with structured logic.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#35B8A6] font-bold shrink-0">✓</span>
                  <span>Warm, patient atmosphere where every question is celebrated as a step forward.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Comparison Banner: Traditional Rote vs Raghvyon Concept Model */}
        <div className="bg-[#2454A6] text-white rounded-3xl p-8 sm:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold tracking-widest uppercase text-[#F7C948]">
                THE RAGHVYON ADVANTAGE
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Experience the Difference in a Single Demo Session
              </h3>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Watch your child transition from memorizing steps without understanding to explaining the mathematical and scientific reasoning with self-assurance.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={onOpenDemoBooking}
                className="w-full sm:w-auto bg-[#F7C948] hover:bg-[#eab308] text-[#172B4D] font-extrabold text-sm px-7 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Book 1-on-1 Free Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
