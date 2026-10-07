import React from 'react';
import { ArrowUpRight, BookOpen, MessageCircle, Target } from 'lucide-react';
import { TeacherProfile } from '../types';
interface Props { teacherProfile: TeacherProfile; onOpenEnquiry: () => void; onOpenDemoBooking: () => void; }
export const TrustTeacherSection: React.FC<Props> = ({ onOpenEnquiry, onOpenDemoBooking }) => <section id="teacher" className="cosmos-mentorship">
  <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="cosmos-section-heading"><p>MORE THAN A CLASS</p><h2>A place to ask.<br /><span>A space to grow.</span></h2><p>Learning starts with a question. We make room for yours.</p></div>
    <div className="cosmos-mentor-cards">{[
      [MessageCircle, 'Every question matters', 'Bring the doubts you held back in class. Work through them one clear step at a time.'],
      [BookOpen, 'Make understanding stick', 'Connect ideas to examples, then practise applying them rather than memorising the answer.'],
      [Target, 'Find your next step', 'Talk through your goals in a demo session and explore a course that fits your learning needs.'],
    ].map(([Icon, title, description], i) => { const Symbol = Icon as typeof Target; return <article key={String(title)}><span className="cosmos-card-index">0{i+1}</span><Symbol size={36} /><h3>{String(title)}</h3><p>{String(description)}</p></article>; })}</div>
    <div className="cosmos-mentor-footer"><p>Meet your mentor in a real demo session.</p><div><button onClick={onOpenDemoBooking}>Book a free demo <ArrowUpRight size={18} /></button><button onClick={onOpenEnquiry}>Ask about the Academy</button></div></div>
  </div>
</section>;
