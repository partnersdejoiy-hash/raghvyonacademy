import React from 'react';
import { ArrowRight } from 'lucide-react';

const questions = [
  ['How do I choose the right course?', 'Explore our course catalogue for subjects, grade levels and fees. If you are unsure, submit an enquiry so the Academy can help you choose.'],
  ['Can I try a class before enrolling?', 'Yes. Request a free demo, choose your subject and preferred time, and the Academy will contact you to confirm availability.'],
  ['Are classes available online?', 'The Academy offers Delhi and online learning. Ask about the format and timings available for your chosen course when booking your demo.'],
  ['How can parents follow progress?', 'Verified parent accounts can view their linked child’s academic information in the parent portal. Student accounts keep assignments, notes and feedback together.'],
  ['Do I need to connect Google Drive to sign in?', 'No. Academy sign-in and Google Drive connection are separate. Students can choose to connect their own Drive from the learning portal.'],
];
export function AdmissionsSection({ onOpenDemoBooking }: { onOpenDemoBooking: () => void }) {
  return <section className="bg-white py-16 sm:py-24" aria-labelledby="admissions-title">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
      <div><p className="text-xs font-bold tracking-widest text-[#218174]">YOUR NEXT CHAPTER</p><h2 id="admissions-title" className="mt-4 text-4xl font-bold text-[#172B4D]">A clear first step.<br />A brighter way forward.</h2><p className="mt-5 max-w-md text-[#172B4D]/70 leading-relaxed">Choosing a coaching class should feel simple. Meet your mentor, talk about your goals, and experience the teaching before you decide.</p><button onClick={onOpenDemoBooking} className="mt-7 inline-flex items-center gap-3 bg-[#F7C948] px-6 py-4 rounded-2xl font-bold text-[#172B4D] hover:bg-[#edbb31]">Find your starting point <ArrowRight size={18} /></button></div>
      <div className="space-y-3">{questions.map(([q, a]) => <details key={q} className="group rounded-2xl border border-[#172B4D]/10 bg-[#FFF9EE] p-5"><summary className="cursor-pointer font-bold text-[#172B4D]">{q}</summary><p className="pt-4 text-sm leading-relaxed text-[#172B4D]/75">{a}</p></details>)}</div>
    </div>
  </section>;
}
