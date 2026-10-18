import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../ui/theme.css';
import './site.css';
import { CONTACT, FALLBACK_COURSES, FAQ, METHOD, PICTURES, pictureUrl, type Course } from './content';
import { TERM_COLOURS } from '../ui/cube';
import { CubeFallback, useCube, type CubeHandle } from '../ui/Cube';
import { Mark, Wordmark } from '../ui/Mark';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Shot = ({ k, w, eager = false }: { k: string; w: number; eager?: boolean }) => (
  <img src={pictureUrl(k, w)} alt={PICTURES[k].alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
);

/* ---------- loader ---------- */
function Loader({ done }: { done: boolean }) {
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (reduceMotion()) return setGone(true);
    const n = { v: 0 };
    const tl = gsap.to(n, { v: 100, duration: 1.1, ease: 'power2.out', onUpdate: () => { if (pct.current) pct.current.textContent = `${Math.round(n.v)}%`; if (bar.current) bar.current.style.width = `${n.v}%`; } });
    return () => { tl.kill(); };
  }, []);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 1150);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <div className={`loader ${gone ? 'is-done' : ''}`} aria-hidden={gone}>
      <div className="loader__in">
        <Mark size={44} />
        <div className="loader__name">Raghvyon</div>
        <div className="loader__bar"><i ref={bar} /></div>
        <span className="loader__pct" ref={pct}>0%</span>
      </div>
    </div>
  );
}

/* ---------- nav ---------- */
const LINKS = [
  ['#courses', 'Courses'],
  ['#method', 'Method'],
  ['#mentor', 'Mentor'],
  ['#faq', 'FAQ'],
];
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 24);
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  return (
    <>
      <nav className={`nav ${scrolled || open ? 'is-scrolled' : ''}`} aria-label="Main">
        <div className="nav__pill glass">
          <Wordmark />
          <div className="nav__links">
            {LINKS.map(([h, l]) => <a key={h} href={h}>{l}</a>)}
          </div>
          <div className="nav__cta">
            <a className="btn btn--ghost" href="/portal">Sign in</a>
            <a className="btn btn--sm" href="#demo">Book a free demo</a>
            <button className="nav__burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <i style={open ? { transform: 'translateY(4.5px) rotate(45deg)' } : undefined} />
              <i style={open ? { transform: 'translateY(-4.5px) rotate(-45deg)' } : undefined} />
            </button>
          </div>
        </div>
      </nav>
      <div className={`sheet ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
        {LINKS.map(([h, l]) => <a key={h} href={h}>{l}</a>)}
        <a href="/portal">Sign in</a>
        <a className="btn" href="#demo">Book a free demo</a>
      </div>
    </>
  );
}

/* ---------- hero ---------- */
function Hero({ onCubeReady }: { onCubeReady: () => void }) {
  const cube = useRef<CubeHandle | undefined>(undefined);
  const { ref, failed, state } = useCube({ a: 3, b: 2, explode: 2.4, particles: true }, (c) => {
    cube.current = c;
    c.setExplode(0.16);
    onCubeReady();
  });
  useEffect(() => { if (failed) onCubeReady(); }, [failed, onCubeReady]);
  useEffect(() => {
    const onScroll = () => cube.current?.setExplode(0.16 + Math.min(scrollY / innerHeight, 1.2) * 1.1);
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <div className="wrap hero__in">
        <div>
          <h1 className="display hero__title" data-hero>
            Learn the <span className="accent">why</span> before the formula.
          </h1>
          <p className="lead hero__lead" data-hero>
            Online classes in maths, science and English for Grades 2 to 12, with one mentor who knows your child. Students in India and the US.
          </p>
          <div className="hero__actions" data-hero>
            <a className="btn" href="#demo">Book a free demo <Arrow /></a>
            <a className="btn btn--glass" href="#why">See how we teach</a>
          </div>
          <p className="hero__trust" data-hero>
            <span>First class free</span><span>No card needed</span><span>Grades 2–12</span><span>India &amp; US time zones</span>
          </p>
        </div>
        <div className="stage" data-hero aria-hidden="true">
          <div className="stage__halo" />
          <div className="stage__ring" />
          <div className="stage__ring stage__ring--2" />
          {failed ? <CubeFallback /> : <canvas ref={ref} style={{ opacity: state === 'ready' ? 1 : 0, transition: 'opacity 800ms' }} />}
          {['a³', '3a²b', '3ab²', 'b³'].map((t, i) => (
            <span key={t} className="stage__tag glass"><b style={{ background: TERM_COLOURS[i] }} />{t}</span>
          ))}
        </div>
      </div>
      <div className="hero__scroll" aria-hidden="true"><i />SCROLL</div>
    </header>
  );
}

/* ---------- marquee + stats ---------- */
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Spoken English', 'Social Studies', 'Computer Skills', 'Exam Prep'];
function Marquee() {
  const row = SUBJECTS.map((s) => <span key={s} className="marquee__item"><Mark />{s}</span>);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">{row}{row}</div>
    </div>
  );
}

const STATS = [
  { n: 7, label: 'subjects, one method' },
  { text: '2–12', label: 'grades, CBSE, ICSE and US standards' },
  { n: 7, suffix: '+', label: 'years of teaching' },
  { n: 2, label: 'countries: India and the US' },
];
function Stats() {
  return (
    <div className="wrap stats">
      {STATS.map((s, i) => (
        <div key={i} className="stat glass" data-reveal>
          <strong>{s.text ?? <><span data-count={s.n}>0</span>{s.suffix}</>}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- live cube ---------- */
function LiveCube() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const cube = useRef<CubeHandle | undefined>(undefined);
  const { ref, failed } = useCube({ a: 3, b: 2, explode: 0.55, drag: true }, (c) => (cube.current = c));
  useEffect(() => cube.current?.setSizes(a, b), [a, b]);
  const terms = [a ** 3, 3 * a * a * b, 3 * a * b * b, b ** 3];
  return (
    <section className="section" id="why" aria-labelledby="why-title">
      <div className="wrap live glass" data-reveal>
        <div className="live__text">
          <h2 className="display h2" id="why-title">Why (a+b)³ has eight blocks</h2>
          <p>Students meet this formula as a line to memorise. Here it is a cube you can take apart. Change a and b, turn the cube, count the blocks of each colour.</p>
          <div className="sliders">
            <label>a<input type="range" min={1} max={9} value={a} onChange={(e) => setA(+e.target.value)} aria-label="Length a" /><output>{a}</output></label>
            <label>b<input className="b" type="range" min={1} max={9} value={b} onChange={(e) => setB(+e.target.value)} aria-label="Length b" /><output>{b}</output></label>
          </div>
          <p className="equation" aria-live="polite">
            <span>({a}+{b})³ =</span>
            {terms.map((t, i) => <span key={i} style={{ display: 'contents' }}>{i > 0 && <span>+</span>}<span className="term" style={{ background: TERM_COLOURS[i] }}>{t}</span></span>)}
            <span>=</span><span className="total">{(a + b) ** 3}</span>
          </p>
        </div>
        <div className="live__stage">
          {failed ? <CubeFallback /> : <canvas ref={ref} role="img" aria-label={`A cube of side ${a} plus ${b}, split into eight coloured blocks`} />}
          <p className="live__hint">Drag to turn</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- courses ---------- */
function Courses({ courses }: { courses: Course[] }) {
  return (
    <section className="section wrap" id="courses" aria-labelledby="courses-title">
      <div className="head" data-reveal>
        <h2 className="display h2" id="courses-title">Seven subjects, one way of teaching</h2>
        <p>Every course starts with a diagnostic lesson and runs at your child's pace. Fees are shared after the free demo.</p>
      </div>
      <div className="courses__grid">
        {courses.map((c) => (
          <article key={c.slug} className="course glass glass--hover" data-reveal>
            <div className="course__img">
              {PICTURES[c.slug] && <Shot k={c.slug} w={720} />}
              <span className="chip">{c.subject}</span>
            </div>
            <div className="course__body">
              <h3 className="h3">{c.title}</h3>
              <div className="course__meta"><span>{c.grade_level}</span><span>{c.duration}</span></div>
              <p>{c.description}</p>
              <ul>{c.highlights.slice(0, 3).map((h) => <li key={h}>{h}</li>)}</ul>
              <a className="course__link" href={`#demo`} data-subject={c.subject}>Book a demo for this <Arrow /></a>
            </div>
          </article>
        ))}
        <div className="course course--cta glass" data-reveal>
          <div>
            <h3 className="display">Not sure where to start?</h3>
            <p>Book one free class. The mentor will tell you honestly what your child needs.</p>
            <a className="btn" href="#demo">Book a free demo <Arrow /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- method ---------- */
const GLOWS = ['rgba(216,255,62,.18)', 'rgba(143,211,255,.18)', 'rgba(255,179,199,.18)', 'rgba(255,195,154,.18)', 'rgba(216,255,62,.14)'];
function Method() {
  return (
    <section className="section method" id="method" aria-labelledby="method-title">
      <div className="wrap head" data-reveal>
        <h2 className="display h2" id="method-title">How a class runs</h2>
        <p>Five habits shape every lesson, from Grade 2 fractions to Grade 12 mock papers.</p>
      </div>
      <div className="wrap method__pin">
        <div className="method__track">
          {METHOD.map((m, i) => (
            <article key={m.name} className="step glass" style={{ ['--step-glow' as string]: GLOWS[i] }}>
              <div className="step__n">{i + 1}</div>
              <div>
                <h3 className="display">{m.name}</h3>
                <p>{m.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="method__progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

/* ---------- mentor ---------- */
function Mentor() {
  return (
    <section className="section wrap mentor" id="mentor" aria-labelledby="mentor-title">
      <div className="mentor__frame glass" data-reveal>
        <Shot k="delhi" w={1100} />
        <span className="chip chip--lime mentor__badge"><span className="dot" /> Taking new students</span>
        <p className="mentor__cap">{PICTURES.delhi.credit}: an observatory a short ride from Dakshinpuri, where the academy began.</p>
      </div>
      <div data-reveal>
        <h2 className="display h2" id="mentor-title">Seven years. Two curricula. One mentor.</h2>
        <p className="lead" style={{ marginTop: 20 }}>Our lead mentor has taught Indian board students and American students since 2019, so the same idea is explained the way CBSE, ICSE or a US classroom expects it.</p>
        <ul className="mentor__points">
          {[
            ['Concept first', 'The reason before the rule. Formulas arrive once the idea is clear.'],
            ['Small groups or one-to-one', 'Paced by a first diagnostic lesson, never by the slowest or fastest student.'],
            ['Feedback after every class', 'A short note on what went right and one thing to fix, instead of red ink.'],
          ].map(([t, d]) => (
            <li key={t} className="glass"><Mark /><div><strong>{t}</strong><span>{d}</span></div></li>
          ))}
        </ul>
        <a className="btn" href="#demo">Meet the mentor in a free class <Arrow /></a>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */
function Faq() {
  return (
    <section className="section wrap faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__sticky" data-reveal>
        <h2 className="display h2" id="faq-title">Questions parents ask</h2>
        <p>Anything else? Message us on WhatsApp and a human replies, usually within the hour.</p>
        <a className="btn btn--glass" href={CONTACT.whatsapp}>WhatsApp us <Arrow /></a>
      </div>
      <div className="faq__list" data-reveal>
        {FAQ.map((f, i) => (
          <details key={f.q} className="glass" name="faq" open={i === 0}>
            <summary>{f.q}<span className="plus" aria-hidden="true" /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------- cta + form ---------- */
function Cta() {
  return (
    <section className="cta">
      <div className="cta__orb" aria-hidden="true" />
      <h2 className="display" data-reveal>Book the free demo.</h2>
      <p data-reveal>One real class with the mentor. If it is not right for your child, you owe us nothing and we will say so.</p>
      <div className="cta__actions" data-reveal>
        <a className="btn" href="#demo">Pick a slot <Arrow /></a>
        <a className="btn btn--glass" href={CONTACT.phoneHref}>Call {CONTACT.phone}</a>
      </div>
    </section>
  );
}

const SLOTS = ['Weekday evening, India time', 'Weekend morning, India time', 'Weekday, US time', 'Weekend, US time'];
function Demo({ courses }: { courses: Course[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const subjectRef = useRef<HTMLSelectElement>(null);
  // "Book a demo for this" links preselect the subject.
  useEffect(() => {
    const f = (e: Event) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('[data-subject]');
      if (a && subjectRef.current) subjectRef.current.value = a.dataset.subject || '';
    };
    document.addEventListener('click', f);
    return () => document.removeEventListener('click', f);
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState('sending');
    setMsg('');
    try {
      const res = await fetch('/api/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not send. Please call us instead.');
      setState('sent');
      setMsg(`Thank you. We will call ${data.phone} to confirm the demo.`);
      form.reset();
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Could not send. Please call us instead.');
    }
  }
  return (
    <section className="wrap" id="demo" aria-labelledby="demo-title">
      <div className="demo glass" data-reveal>
        <div className="demo__side">
          <div>
            <h2 className="display h2" id="demo-title">Your free demo class</h2>
            <p>Tell us who is learning and when suits you. We call within a day to fix the slot.</p>
          </div>
          <ul>
            <li><Mark />A full lesson, not a sales call</li>
            <li><Mark />Honest advice on what your child needs</li>
            <li><Mark />Prefer to talk? <a href={CONTACT.whatsapp}>WhatsApp</a> or <a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
          </ul>
        </div>
        <form onSubmit={submit}>
          <label className="field"><span>Your name</span><input name="parent_name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Priya Sharma" /></label>
          <label className="field"><span>Student's name</span><input name="student_name" required maxLength={80} placeholder="Aarav" /></label>
          <label className="field"><span>Grade</span><input name="student_grade" maxLength={40} placeholder="Grade 7" /></label>
          <label className="field"><span>Subject</span>
            <select name="subject" defaultValue="" ref={subjectRef}>
              <option value="">Not sure yet</option>
              {courses.map((c) => <option key={c.slug} value={c.subject}>{c.subject}</option>)}
            </select>
          </label>
          <label className="field"><span>Phone or WhatsApp</span><input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98xxx xxxxx" /></label>
          <label className="field"><span>Email (optional)</span><input name="email" type="email" maxLength={120} autoComplete="email" placeholder="you@example.com" /></label>
          <label className="field full"><span>When suits you</span>
            <select name="preferred_time_slot" defaultValue="">
              <option value="">Any time works</option>
              {SLOTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field full"><span>Anything we should know</span><textarea name="message" maxLength={600} placeholder="Your city, the board, what feels hard right now…" /></label>
          <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="btn full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Book the free demo'} <Arrow /></button>
          <p className={`msg full ${state === 'error' ? 'msg--err' : state === 'sent' ? 'msg--ok' : ''}`} role="status">{msg}</p>
        </form>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */
export function Footer({ children }: { children?: ReactNode }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div className="foot__brand">
            <Wordmark />
            <p>Concept-first classes for Grades 2 to 12, taught from New Delhi to students in India and the US.</p>
          </div>
          <div className="foot__col"><h4>Academy</h4><a href="/#courses">Courses</a><a href="/#method">Method</a><a href="/#mentor">Mentor</a><a href="/#faq">FAQ</a></div>
          <div className="foot__col"><h4>Students</h4><a href="/portal">Sign in</a><a href="/#demo">Book a demo</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of service</a></div>
          <div className="foot__col"><h4>Contact</h4><a href={CONTACT.phoneHref}>{CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><span>{CONTACT.address}</span></div>
        </div>
        {children}
        <div className="foot__bottom"><span>© {new Date().getFullYear()} Raghvyon Academy, New Delhi</span><a href="#top">Back to top ↑</a></div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */
export default function Site() {
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [cubeReady, setCubeReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Never hold the page behind the loader for more than a moment, even on a slow connection.
  useEffect(() => {
    const t = setTimeout(() => setCubeReady(true), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch('/api/courses').then((r) => (r.ok ? r.json() : Promise.reject())).then((rows: Course[]) => rows.length && setCourses(rows)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('js');
    if (reduceMotion()) {
      document.querySelectorAll<HTMLElement>('[data-reveal],[data-hero]').forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-hero]', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, delay: 0.9 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
        once: true,
      });
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const n = { v: 0 };
        gsap.to(n, { v: Number(el.dataset.count), duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true }, onUpdate: () => (el.textContent = String(Math.round(n.v))) });
      });
      // The method steps slide horizontally while the section stays pinned (desktop only).
      ScrollTrigger.matchMedia({
        '(min-width: 961px)': () => {
          const track = document.querySelector<HTMLElement>('.method__track');
          const pin = document.querySelector<HTMLElement>('.method__pin');
          const bar = document.querySelector<HTMLElement>('.method__progress i');
          if (!track || !pin) return;
          const dist = () => track.scrollWidth - pin.clientWidth;
          gsap.to(track, {
            x: () => -dist(),
            ease: 'none',
            scrollTrigger: { trigger: pin, start: 'top 12%', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (st) => { if (bar) bar.style.width = `${st.progress * 100}%`; } },
          });
        },
      });
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 1500);
    return () => { clearTimeout(t); ctx.revert(); };
  }, [courses]);

  return (
    <div ref={root} id="top">
      <Loader done={cubeReady} />
      <Nav />
      <Hero onCubeReady={() => setCubeReady(true)} />
      <main>
        <Marquee />
        <Stats />
        <LiveCube />
        <Courses courses={courses} />
        <Method />
        <Mentor />
        <Faq />
        <Cta />
        <Demo courses={courses} />
      </main>
      <Footer>
        <p className="foot__credits">
          Pictures, all public domain via Wikimedia Commons: {Object.values(PICTURES).map((p) => p.credit).join('; ')}. They show the world of each subject, not the academy.
        </p>
      </Footer>
    </div>
  );
}
