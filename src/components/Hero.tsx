import React from 'react';
import { ArrowRight, BookOpen, Check, GraduationCap, LogIn, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenDemoBooking: () => void;
  onOpenLogin: () => void;
  onExploreCourses: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemoBooking, onOpenLogin, onExploreCourses }) => (
  <section className="academy-hero relative overflow-hidden py-16 sm:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-[#2454A6]/15 bg-white px-4 py-2 text-xs font-bold tracking-widest text-[#2454A6]"><Sparkles size={15} /> BIG DREAMS. STRONG FOUNDATIONS.</p>
        <h1 className="mt-7 text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-[#172B4D]">Understand deeply.<br /><span className="text-[#2454A6]">Grow confidently.</span></h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#172B4D]/75">A little guidance can change everything. Build stronger concepts in Maths, Science and English with a mentor who helps you find your own way forward.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onOpenDemoBooking} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#2454A6] px-6 py-4 font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-[#172B4D] transition-colors">Book a free demo <ArrowRight size={19} /></button>
          <button onClick={onExploreCourses} className="rounded-2xl border border-[#172B4D]/20 bg-white px-6 py-4 font-bold hover:border-[#2454A6]">Explore courses</button>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#172B4D]/75">{['Concept-first teaching', 'Delhi & online classes', 'Parent progress updates'].map(text => <span key={text} className="inline-flex items-center gap-2"><Check size={15} className="text-[#218174]" />{text}</span>)}</div>
        <button onClick={onOpenLogin} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#2454A6] hover:underline"><LogIn size={16} /> Already learning with us? Open your portal</button>
      </div>
      <div className="relative">
        <div className="rounded-[32px] bg-[#172B4D] p-6 sm:p-9 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-3"><span className="text-xs tracking-[.2em] font-semibold text-white/60">THE RAGHVYON WAY</span><GraduationCap className="text-[#F7C948]" size={30} /></div>
          <h2 className="mt-8 text-3xl sm:text-4xl font-bold leading-tight">From “I don’t get it”<br />to “I’ve got this.”</h2>
          <div className="mt-8 space-y-3">{[
            ['01', 'Discover your starting point', 'A demo session to understand your goals and learning needs.'],
            ['02', 'Make the concept click', 'Clear explanations, real examples and guided practice.'],
            ['03', 'Turn practice into progress', 'Assignments, feedback and a dedicated learning portal.'],
          ].map(([number, title, detail]) => <div key={number} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="pt-1 text-sm font-bold text-[#F7C948]">{number}</span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-white/65">{detail}</p></div></div>)}</div>
          <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-5"><BookOpen className="text-[#35B8A6]" /><p className="text-sm text-white/75">Space to ask questions. Support to keep growing.</p></div>
        </div>
      </div>
    </div>
  </section>
);
