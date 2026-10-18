import { useEffect, useRef, useState, type FormEvent } from 'react';
import './site.css';
import { CONTACT, FALLBACK_COURSES, FAQ, METHOD, PICTURES, pictureUrl, type Course } from './content';
import { TERM_COLOURS, hasWebGL } from './cube';

type CubeHandle = { setSizes(a: number, b: number): void; setExplode(v: number): void; dispose(): void };

/** Mount the 3D cube lazily so three.js never blocks the first paint. */
function useCube(opts: { a: number; b: number; explode: number; drag?: boolean }, onReady?: (c: CubeHandle) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasWebGL()) return setFailed(true);
    let cube: CubeHandle | undefined;
    let cancelled = false;
    import('./cube')
      .then(({ mountCube }) => {
        if (cancelled) return;
        cube = mountCube(canvas, opts);
        onReady?.(cube);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cube?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, failed };
}

const Bullet = () => (
  <span className="bullet" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </span>
);

const Shot = ({ k, w, className = '', eager = false }: { k: string; w: number; className?: string; eager?: boolean }) => (
  <span className={`motif ${className}`}>
    <img src={pictureUrl(k, w)} alt={PICTURES[k].alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  </span>
);

function Hero() {
  const cubeRef = useRef<CubeHandle | undefined>(undefined);
  const { ref, failed } = useCube({ a: 3, b: 2, explode: 2.2 }, (c) => {
    cubeRef.current = c;
    c.setExplode(0.14);
  });
  useEffect(() => {
    const onScroll = () => cubeRef.current?.setExplode(0.14 + Math.min(scrollY / innerHeight, 1.2) * 0.9);
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="hero">
      <nav className="bar" aria-label="Main">
        <a className="bar__left" href="#courses">Courses</a>
        <a className="bar__mark" href="/" aria-label="Raghvyon Academy home">
          <Bullet /> Raghvyon Academy
        </a>
        <a className="bar__link" href="/portal">Student login</a>
      </nav>
      <div className="hero__copy">
        <h1 className="hero__title">Raghvyon</h1>
        <p className="hero__sub">Maths, science and English for Grades 2 to 12, taught the why before the formula.</p>
        <div className="hero__actions">
          <a className="btn" href="#demo">
            Book a free demo <Bullet />
          </a>
          <a className="text" href="#why">See how we teach</a>
        </div>
      </div>
      <div className="hero__stage" aria-hidden="true">
        {failed ? (
          <div className="hero__fallback">
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : (
          <canvas ref={ref} />
        )}
      </div>
      <p className="hero__legend" aria-hidden="true">
        {['a³', '3a²b', '3ab²', 'b³'].map((t, i) => (
          <span key={t}>
            <b style={{ background: TERM_COLOURS[i] }} /> {t}
          </span>
        ))}
      </p>
    </header>
  );
}

const FOLDERS = [
  { href: '#courses', name: 'Courses', bg: 'var(--sand)', tab: '6%' },
  { href: '#method', name: 'Method', bg: 'var(--peri)', tab: '27%' },
  { href: '#mentor', name: 'Mentor', bg: 'var(--peach)', tab: '48%' },
  { href: '#questions', name: 'Questions', bg: 'var(--pink)', tab: '69%' },
];

function Folders() {
  return (
    <nav className="folders" aria-label="Sections">
      {FOLDERS.map((f, i) => (
        <a key={f.href} className="folder on-light" href={f.href} style={{ top: 48 + i * 64, background: f.bg, zIndex: i }}>
          <span className="folder__tab" style={{ left: f.tab }}>{f.name}</span>
          <span className="folder__body" />
        </a>
      ))}
      <div className="folder folder--front on-light" style={{ top: 48 + FOLDERS.length * 64, background: 'var(--lime)', zIndex: 9 }}>
        <span className="folder__tab" style={{ left: '84%' }}>Demo</span>
        <div className="folder__body">
          <a className="btn btn--ink" href="#demo">
            Book a free demo <Bullet />
          </a>
          <p>One mentor, seven subjects, students in India and the US. The first class costs nothing.</p>
        </div>
      </div>
    </nav>
  );
}

function Intro() {
  return (
    <section className="intro" aria-label="How every class begins" data-reveal>
      <p>
        Every class opens with a drawing <Shot k="mathematics" w={120} className="thumb" />, an experiment{' '}
        <Shot k="science" w={120} className="thumb" /> or a question about the world <Shot k="delhi" w={120} className="thumb" />. The
        formula comes after the reason.
      </p>
    </section>
  );
}

function LiveCube() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const cube = useRef<CubeHandle | undefined>(undefined);
  const { ref, failed } = useCube({ a: 3, b: 2, explode: 0.5, drag: true }, (c) => (cube.current = c));
  useEffect(() => cube.current?.setSizes(a, b), [a, b]);
  const terms = [a ** 3, 3 * a * a * b, 3 * a * b * b, b ** 3];
  return (
    <section className="live" id="why" aria-labelledby="why-title">
      <div className="live__text" data-reveal>
        <h2 className="rv-h" id="why-title">Why (a+b)³ has eight blocks</h2>
        <p>
          Students meet this formula as a line to memorise. Here it is a cube you can take apart. Change a and b, turn the cube, and count
          the blocks of each colour.
        </p>
        <div className="live__controls">
          <label>
            a
            <input type="range" min={1} max={9} value={a} onChange={(e) => setA(+e.target.value)} aria-label="Length a" />
            <output>{a}</output>
          </label>
          <label>
            b
            <input className="b" type="range" min={1} max={9} value={b} onChange={(e) => setB(+e.target.value)} aria-label="Length b" />
            <output>{b}</output>
          </label>
        </div>
        <p className="equation" aria-live="polite">
          ({a} + {b})³ ={' '}
          {terms.map((t, i) => (
            <span key={i}>
              {i > 0 && '+ '}
              <span className="term" style={{ background: TERM_COLOURS[i] }}>{t}</span>{' '}
            </span>
          ))}
          = <span className="total">{(a + b) ** 3}</span>
        </p>
      </div>
      <div className="live__stage">
        {failed ? (
          <div className="hero__fallback" style={{ position: 'static', translate: 'none', width: '100%' }} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : (
          <canvas ref={ref} aria-label={`A cube of side ${a} plus ${b}, split into eight coloured blocks`} role="img" />
        )}
        <p className="live__hint">Drag to turn</p>
      </div>
    </section>
  );
}

function Courses({ courses }: { courses: Course[] }) {
  const [active, setActive] = useState(courses[0]?.slug);
  const current = courses.find((c) => c.slug === active) ?? courses[0];
  return (
    <section className="courses on-light" id="courses" aria-labelledby="courses-title">
      <div className="courses__head" data-reveal>
        <h2 className="rv-h" id="courses-title">Seven subjects, one method</h2>
        <p>{courses.length} courses</p>
      </div>
      <div className="courses__grid">
        <ul className="courses__list">
          {courses.map((c) => (
            <li key={c.slug} className="course" onMouseEnter={() => setActive(c.slug)} onFocus={() => setActive(c.slug)} tabIndex={0}>
              {PICTURES[c.slug] ? <Shot k={c.slug} w={160} /> : <span className="motif" />}
              <div>
                <div className="course__top">
                  <h3>{c.title}</h3>
                  <span className="course__grade">{c.grade_level}</span>
                </div>
                <p>{c.description}</p>
                <p className="course__note">{c.duration} · {c.fee}</p>
              </div>
            </li>
          ))}
        </ul>
        {current && (
          <figure className="preview" aria-hidden="true">
            <span className="motif">
              {courses.map((c) =>
                PICTURES[c.slug] ? (
                  <img key={c.slug} src={pictureUrl(c.slug, 900)} alt="" loading="lazy" style={{ opacity: c.slug === current.slug ? 1 : 0 }} />
                ) : null,
              )}
            </span>
            <figcaption>
              <h3>{current.subject}</h3>
              <ul>
                {current.syllabus.map((s) => (
                  <li key={s}>
                    <Bullet /> {s}
                  </li>
                ))}
              </ul>
              {PICTURES[current.slug] && <p className="credit">Picture: {PICTURES[current.slug].credit}</p>}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

function Method() {
  const [open, setOpen] = useState(0);
  return (
    <section className="method on-light" id="method" aria-labelledby="method-title">
      <div className="method__intro" data-reveal>
        <h2 className="rv-h" id="method-title">How a class runs</h2>
        <p>Five habits shape every lesson, from Grade 2 fractions to Grade 12 mock papers. Open each one to see what it means for your child.</p>
      </div>
      <div className="stages">
        {METHOD.map((m, i) => (
          <button key={m.name} className="stage" aria-expanded={open === i} onClick={() => setOpen(i)}>
            <span className="stage__name">{m.name}</span>
            <span className="stage__open">
              <strong>{m.name}</strong>
              <span>{m.text}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="mentor" aria-labelledby="mentor-title">
      <div className="about__panel">
        <div className="about__left">
          <h2 className="rv-h" id="mentor-title">Seven years. Two curricula.</h2>
          <Shot k="delhi" w={1200} />
        </div>
        <div className="about__right" data-reveal>
          <div>
            <h3>India and the US</h3>
            <p>
              Our lead mentor has taught Indian board students and American students for over seven years, so the same idea is explained the
              way CBSE, ICSE or US classrooms expect it.
            </p>
          </div>
          <div>
            <h3>One mentor who knows your child</h3>
            <p>
              Classes are one-to-one or in small groups, paced by a first diagnostic lesson, with short feedback after every session instead
              of a pile of corrections.
            </p>
          </div>
          <a className="btn" href="#demo">
            Book a free demo <Bullet />
          </a>
        </div>
        <p className="about__credit">Picture: {PICTURES.delhi.credit}, an observatory a short ride from Dakshinpuri.</p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="faq on-light" id="questions" aria-labelledby="faq-title">
      <h2 className="rv-h" id="faq-title">Questions parents ask</h2>
      <div className="faq__list" data-reveal>
        {FAQ.map((f, i) => (
          <details key={f.q} name="faq" open={i === 0}>
            <summary>
              {f.q} <span className="plus" aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <a className="cta" href="#demo">
      <p className="cta__note">Pick a slot for a free demo class and we will call you to confirm it.</p>
      <svg className="cta__arrow" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 36 36 12M16 12h20v20" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <span className="cta__word" aria-hidden="true">Book</span>
      <span className="visually-hidden">Book a free demo class</span>
    </a>
  );
}

const SLOTS = ['Weekday evening, India time', 'Weekend morning, India time', 'Weekday, US time', 'Weekend, US time'];

function Contact({ courses }: { courses: Course[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
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
    <section className="contact" id="demo" aria-labelledby="demo-title">
      <div className="coupon on-light" data-reveal>
        <div className="coupon__left">
          <h2 id="demo-title">Your free demo class</h2>
          <p>
            Tell us who is learning and when suits you. Prefer to talk? Call <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> or{' '}
            <a href={CONTACT.whatsapp}>message on WhatsApp</a>.
          </p>
        </div>
        <form onSubmit={submit} noValidate={false}>
          <label className="visually-hidden" htmlFor="parent_name">Your name</label>
          <input id="parent_name" name="parent_name" placeholder="Your name" required minLength={2} maxLength={80} autoComplete="name" />
          <label className="visually-hidden" htmlFor="student_name">Student's name</label>
          <input id="student_name" name="student_name" placeholder="Student's name" required maxLength={80} />
          <label className="visually-hidden" htmlFor="student_grade">Grade</label>
          <input id="student_grade" name="student_grade" placeholder="Grade, e.g. Grade 7" maxLength={40} />
          <label className="visually-hidden" htmlFor="subject">Subject</label>
          <select id="subject" name="subject" defaultValue="">
            <option value="" disabled>Subject</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.subject}>{c.subject}</option>
            ))}
          </select>
          <label className="visually-hidden" htmlFor="phone">Phone or WhatsApp</label>
          <input id="phone" name="phone" type="tel" placeholder="Phone or WhatsApp" required maxLength={20} autoComplete="tel" />
          <label className="visually-hidden" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="Email (optional)" maxLength={120} autoComplete="email" />
          <label className="visually-hidden" htmlFor="preferred_time_slot">Preferred time</label>
          <select id="preferred_time_slot" name="preferred_time_slot" defaultValue="" className="full">
            <option value="" disabled>When suits you</option>
            {SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="visually-hidden" htmlFor="message">Anything we should know</label>
          <textarea id="message" name="message" className="full" placeholder="Anything we should know, like your city or what feels hard right now" maxLength={600} />
          <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="btn btn--ink full" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Book the free demo'} <Bullet />
          </button>
          <p className={`form-msg ${state === 'error' ? 'err' : ''}`} role="status">{msg}</p>
        </form>
      </div>
    </section>
  );
}

const MARK_COLOURS = ['var(--lime)', 'var(--peri)', 'var(--pink)', 'var(--sand)', 'var(--peach)', 'var(--lime)', 'var(--peri)', 'var(--pink)'];
const MARK_HEIGHTS = [100, 78, 88, 64, 94, 72, 84, 100];

function Footer() {
  return (
    <footer className="foot">
      <div className="mark" aria-label="Raghvyon">
        {'RAGHVYON'.split('').map((l, i) => (
          <span key={i} aria-hidden="true" style={{ background: MARK_COLOURS[i], height: `${MARK_HEIGHTS[i]}%` }}>
            {l}
          </span>
        ))}
      </div>
      <div className="foot__cols">
        <nav aria-label="Footer">
          <a href="#courses">Courses</a>
          <a href="#method">Method</a>
          <a href="#mentor">Mentor</a>
        </nav>
        <nav aria-label="More">
          <a href="#questions">Questions</a>
          <a href="#demo">Book a demo</a>
          <a href="/portal">Student login</a>
        </nav>
        <div className="foot__contact">
          <span>{CONTACT.address}</span>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
        <p className="foot__credits">
          Pictures, all public domain via Wikimedia Commons: {Object.values(PICTURES).map((p) => p.credit).join('; ')}. They show the world of
          each subject, not the academy.
        </p>
      </div>
      <div className="foot__last">
        <span>© {new Date().getFullYear()} Raghvyon Academy, New Delhi</span>
        <a className="btn" href="#top">Back to top</a>
      </div>
    </footer>
  );
}

export default function Site() {
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  useEffect(() => {
    fetch('/api/courses')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows: Course[]) => rows.length && setCourses(rows))
      .catch(() => {}); // fallback rows already shown
  }, []);

  useEffect(() => {
    // Reveal on scroll position, not IntersectionObserver: background tabs and fast jumps never strand content hidden.
    document.documentElement.classList.add('js');
    const check = () =>
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * 0.88) el.classList.add('in');
      });
    check();
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    return () => {
      removeEventListener('scroll', check);
      removeEventListener('resize', check);
    };
  }, [courses]);

  return (
    <div className="rv" id="top">
      <Hero />
      <main>
        <Folders />
        <Intro />
        <LiveCube />
        <Courses courses={courses} />
        <Method />
        <About />
        <Faq />
        <Cta />
        <Contact courses={courses} />
      </main>
      <Footer />
    </div>
  );
}
