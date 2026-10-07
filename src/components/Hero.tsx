import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
const Scene = lazy(() => import('./Hero3DScene').then(m => ({ default: m.Hero3DScene })));
interface HeroProps { onOpenDemoBooking: () => void; onOpenLogin: () => void; onExploreCourses: () => void; }
export const Hero: React.FC<HeroProps> = ({ onOpenDemoBooking, onOpenLogin, onExploreCourses }) => {
 const stage = useRef<HTMLElement>(null);
 const [chapter,setChapter] = useState(0);
 useEffect(() => {
   let frame=0;
   const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const el=stage.current;if(!el)return;const progress=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/(el.offsetHeight-innerHeight)));el.style.setProperty('--journey-progress',String(progress));setChapter(Math.min(2,Math.floor(progress*3)));});};
   addEventListener('scroll',update,{passive:true});update();return()=>{removeEventListener('scroll',update);cancelAnimationFrame(frame);};
 },[]);
 const chapters=[['Small steps.','Infinite','possibilities.','Turn questions into clarity. Build your confidence in Maths, Science and English—with guidance that makes the concept click.'],['Understand.','Practise.','Make it yours.','Clear explanations, guided practice and room to ask questions. A learning journey built around the student.'],['Stay connected.','Grow','together.','Students keep learning. Parents follow attendance, request leave and manage fees. Teachers guide the next step.']];
 const copy=chapters[chapter];
 return <section ref={stage} className="cosmos-hero cinematic-journey"><div className="journey-sticky">
  <div className="cosmos-grid" aria-hidden="true" />
  <div className="cosmos-hero-inner">
    <div className="cosmos-copy">
      <div className="cosmos-eyebrow"><span /> DELHI CLASSROOMS · ONLINE LEARNING</div>
      <h1 key={chapter}>{copy[0]}<br /><span>{copy[1]}</span><br />{copy[2]}</h1>
      <p>{copy[3]}</p>
      <div className="cosmos-actions"><button onClick={onOpenDemoBooking}>Start with a free demo <ArrowUpRight size={21} /></button><button onClick={onExploreCourses}>Explore courses <ArrowRight size={18} /></button></div>
      <button className="cosmos-login" onClick={onOpenLogin}>Already part of the Academy? Open your portal ↗</button>
    </div>
    <Suspense fallback={<div className="cosmos-scene cosmos-fallback">Preparing your learning universe…</div>}><Scene /></Suspense>
  </div>
  <div className="cosmos-strip">{['ASK WITHOUT HESITATION', 'UNDERSTAND THE WHY', 'PRACTISE WITH PURPOSE', 'GROW AT YOUR PACE'].map((label, i) => <div key={label}><span>0{i + 1}</span>{label}<span className="cosmos-star">✦</span></div>)}</div>
<div className="journey-progress"><span>SCROLL TO EXPLORE</span><div><i /></div><span>0{chapter+1} / 03</span></div></div></section>;
};
