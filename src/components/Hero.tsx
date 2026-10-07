import React, { lazy, Suspense } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
const Scene = lazy(() => import('./Hero3DScene').then(m => ({ default: m.Hero3DScene })));
interface HeroProps { onOpenDemoBooking: () => void; onOpenLogin: () => void; onExploreCourses: () => void; }
export const Hero: React.FC<HeroProps> = ({ onOpenDemoBooking, onOpenLogin, onExploreCourses }) => <section className="cosmos-hero">
  <div className="cosmos-grid" aria-hidden="true" />
  <div className="cosmos-hero-inner">
    <div className="cosmos-copy">
      <div className="cosmos-eyebrow"><span /> DELHI CLASSROOMS · ONLINE LEARNING</div>
      <h1>Small steps.<br /><span>Infinite</span><br />possibilities.</h1>
      <p>Turn questions into clarity. Build your confidence in Maths, Science and English—with guidance that makes the concept click.</p>
      <div className="cosmos-actions"><button onClick={onOpenDemoBooking}>Start with a free demo <ArrowUpRight size={21} /></button><button onClick={onExploreCourses}>Explore courses <ArrowRight size={18} /></button></div>
      <button className="cosmos-login" onClick={onOpenLogin}>Already part of the Academy? Open your portal ↗</button>
    </div>
    <Suspense fallback={<div className="cosmos-scene cosmos-fallback">Preparing your learning universe…</div>}><Scene /></Suspense>
  </div>
  <div className="cosmos-strip">{['ASK WITHOUT HESITATION', 'UNDERSTAND THE WHY', 'PRACTISE WITH PURPOSE', 'GROW AT YOUR PACE'].map((label, i) => <div key={label}><span>0{i + 1}</span>{label}<span className="cosmos-star">✦</span></div>)}</div>
</section>;
