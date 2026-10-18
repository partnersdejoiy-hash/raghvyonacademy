import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import '../ui/theme.css';
import './portal.css';
import { FALLBACK_COURSES, CONTACT, type Course } from '../site/content';
import { Mark, Wordmark } from '../ui/Mark';

/* ---------- types & api ---------- */
type Role = 'student' | 'parent' | 'teacher' | 'admin';
type User = { id: number; email: string; name: string; role: Role; avatar_url: string | null };
type Child = { id: number; name: string; email: string; avatar_url: string | null; connected: boolean };
type Perm = 'classroom.view' | 'classroom.manage' | 'calendar.view' | 'calendar.manage' | 'academy.enroll' | 'tools.gmail' | 'attendance.view' | 'attendance.mark' | 'leave.apply' | 'leave.approve' | 'leave.view' | 'desk.demos' | 'desk.people';
type AttStatus = 'present' | 'absent' | 'late' | 'leave';
type Leave = { id: number; student_user_id: number; student_name: string; student_email: string; start_date: string; end_date: string; reason: string; course_name: string | null; status: 'pending' | 'approved' | 'rejected' | 'cancelled'; parent_note: string | null; decided_by_name: string | null; decided_at: string | null; created_at: string };
type Me = { user: User; parents: { id: number; name: string; email: string }[]; perms: Perm[]; superAdmin: boolean; courseIds: number[]; classroom: { connected: boolean; as: 'student' | 'teacher' }; children: Child[] };
type CalEvent = { id: string; title: string; description: string; start: string; end: string; allDay: boolean; meet: string | null; link: string; organizer: string; attendees: number };
type GCourse = { id: string; name: string; section?: string; descriptionHeading?: string; alternateLink: string };
type Work = { id: string; title: string; description: string; due: string | null; maxPoints: number | null; link: string; type: string; submission?: { state: string; late: boolean; grade: number | null; link: string } | null; counts?: { total: number; turnedIn: number; graded: number } };
type Detail = { work: Work[]; announcements: { id: string; text: string; at: string; link: string }[]; students: { id: string; name: string; email: string; photo: string | null }[] };
type Demo = { id: number; parent_name: string; student_name: string; student_grade: string | null; subject: string | null; phone: string; email: string | null; preferred_time_slot: string | null; message: string | null; status: string; created_at: string };
type Person = { id: number; name: string; email: string; role: Role; avatar_url: string | null; created_at: string; connected: number; courses: string | null };
type Link = { parent_user_id: number; student_user_id: number };

class ApiError extends Error { status = 0; }
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new ApiError(body.error || 'Request failed'); e.status = res.status; throw e; }
  return body as T;
}
const post = <T,>(path: string, body: unknown, method = 'POST') => api<T>(path, { method, body: JSON.stringify(body) });

const ROLE_LABEL: Record<Role, string> = { student: 'Student', parent: 'Parent', teacher: 'Teacher', admin: 'Admin' };
const fmtDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => (iso ? new Date(iso).toLocaleDateString('en-IN', opts) : '');
const connectUrl = (as: 'student' | 'teacher') => `/api/auth/google/start?connect=${as}&next=${encodeURIComponent('/portal')}`;
/** Opens Gmail's compose window in the user's own account; nothing is sent from our server. */
const gmail = (to: string | string[], subject = '', body = '') =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent([to].flat().join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const can = (me: Me, p: Perm) => me.perms.includes(p);

const Ava = ({ src, name, size = 40 }: { src: string | null; name: string; size?: number }) =>
  src ? <img src={src} alt="" width={size} height={size} referrerPolicy="no-referrer" /> : <span className="ava">{name.slice(0, 1).toUpperCase()}</span>;

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const I = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
  ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3',
  cal: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  check: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  leave: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l2 2 4-4',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm2 0V7a5 5 0 0 1 10 0v4',
};

/* ---------- sign in ---------- */
function SignIn({ onDone }: { onDone: () => void }) {
  const error = new URLSearchParams(location.search).get('error');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true); setErr('');
    try { await post(mode === 'in' ? '/api/auth/login' : '/api/auth/register', data); history.replaceState(null, '', '/portal'); onDone(); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Could not sign in'); }
    setBusy(false);
  }
  return (
    <div className="signin">
      <div className="signin__copy">
        <Wordmark />
        <h1 className="display">Your classroom, in one place.</h1>
        <p className="lead">Classes, assignments, due dates and announcements from Google Classroom, with the academy's own courses alongside. One Google sign-in for students, parents and teachers.</p>
        {error && <p className="msg msg--err" role="alert">{error}</p>}
        <a className="gbtn" href="/api/auth/google/start?next=%2Fportal">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.9l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </a>
        <div className="or"><span>or use email and password</span></div>
        <form className="pwform" onSubmit={submit}>
          <div className="tabs glass" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'in'} onClick={() => setMode('in')}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'up'} onClick={() => setMode('up')}>Create account</button>
          </div>
          {mode === 'up' && <label className="field"><span>Your name</span><input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Aarav Sharma" /></label>}
          <label className="field"><span>Email</span><input name="email" type="email" required maxLength={120} autoComplete="email" placeholder="you@example.com" /></label>
          <label className="field"><span>Password</span><input name="password" type="password" required minLength={mode === 'up' ? 8 : 1} maxLength={200} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} placeholder={mode === 'up' ? 'At least 8 characters' : 'Your password'} /></label>
          {err && <p className="msg msg--err" role="alert">{err}</p>}
          <button className="btn btn--glass" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="signin__legal">Only your name, email and photo are read at Google sign-in. Classroom and Calendar access are asked for separately, when you connect them. See the <a href="/privacy">privacy policy</a> and <a href="/terms">terms</a>.</p>
      </div>
      <aside className="signin__side">
        <h2>Who sees what</h2>
        {[
          ['Students', 'Your Classroom courses, upcoming work and grades, plus your academy courses.'],
          ['Parents', "Your child's classes and due dates, read-only, once the academy links you."],
          ['Teachers', 'Create classes, post assignments and announcements, invite students. Everything syncs to Google Classroom.'],
          ['Admin', 'Demo requests, people and roles, parent–student links.'],
        ].map(([t, d]) => <div key={t} className="role glass"><Mark /><div><strong>{t}</strong><span>{d}</span></div></div>)}
      </aside>
    </div>
  );
}

/* ---------- shell ---------- */
type NavItem = { id: string; label: string; icon: string };
function Shell({ me, items, view, setView, onSignOut, children }: { me: Me; items: NavItem[]; view: string; setView: (v: string) => void; onSignOut: () => void; children: ReactNode }) {
  const nav = items.map((it) => (
    <button key={it.id} aria-current={view === it.id ? 'true' : undefined} onClick={() => setView(it.id)}><Icon d={it.icon} />{it.label}</button>
  ));
  return (
    <div className="shell">
      <aside className="side">
        <Wordmark />
        <div className="who glass"><Ava src={me.user.avatar_url} name={me.user.name} /><div><strong>{me.user.name}</strong><span className="chip">{ROLE_LABEL[me.user.role]}</span></div></div>
        <nav aria-label="Portal">{nav}</nav>
        <div className="side__bottom"><nav aria-label="More"><a href="/"><Icon d={I.home} />Academy site</a><button onClick={onSignOut}><Icon d={I.out} />Sign out</button></nav></div>
      </aside>
      <div>
        <header className="topbar"><Wordmark /><div className="topbar__me"><Ava src={me.user.avatar_url} name={me.user.name} size={32} /><button className="btn btn--ghost btn--sm" onClick={onSignOut}>Sign out</button></div></header>
        <main className="main">{children}</main>
        {items.length > 1 && <nav className="tabbar" aria-label="Portal sections">{nav}</nav>}
      </div>
    </div>
  );
}

const Banner = ({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) => (
  <div className="banner glass"><Mark /><div><strong>{title}</strong><span>{text}</span></div><a className="btn btn--sm" href={href}>{cta}</a></div>
);

const Empty = ({ children }: { children: ReactNode }) => <div className="empty glass"><Mark />{children}</div>;

/* ---------- Classroom views (student / parent / teacher) ---------- */
function useClassroom(studentId?: number) {
  const [courses, setCourses] = useState<GCourse[] | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);
  const qs = studentId ? `?student=${studentId}` : '';
  const load = useCallback(() => {
    setCourses(null); setErr(null);
    api<GCourse[]>(`/api/classroom/courses${qs}`).then(setCourses).catch((e: ApiError) => setErr(e));
  }, [qs]);
  useEffect(load, [load]);
  return { courses, err, reload: load, qs };
}

const WorkStatus = ({ w }: { w: Work }) => {
  const s = w.submission;
  const overdue = w.due && new Date(w.due) < new Date();
  if (!s) return <span className="chip">{w.due ? `Due ${fmtDate(w.due)}` : 'No due date'}</span>;
  if (s.state === 'RETURNED') return <span className="chip chip--ok">{s.grade != null ? `${s.grade}${w.maxPoints ? ` / ${w.maxPoints}` : ''}` : 'Returned'}</span>;
  if (s.state === 'TURNED_IN') return <span className="chip chip--ok">Turned in{s.late ? ' late' : ''}</span>;
  if (overdue) return <span className="chip chip--danger">Missing · was due {fmtDate(w.due)}</span>;
  return <span className="chip chip--warn">{w.due ? `Due ${fmtDate(w.due, { weekday: 'short', day: 'numeric', month: 'short' })}` : 'Assigned'}</span>;
};

function CourseDetail({ course, qs, as, children }: { course: GCourse; qs: string; as: 'student' | 'teacher'; children?: (d: Detail, reload: () => void) => ReactNode }) {
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => { setD(null); api<Detail>(`/api/classroom/courses/${course.id}/work${qs}`).then(setD).catch((e) => setErr(e.message)); }, [course.id, qs]);
  useEffect(load, [load]);
  if (err) return <p className="msg msg--err">{err}</p>;
  if (!d) return <p className="muted">Loading {course.name}…</p>;
  const isDone = (w: Work) => !!w.submission && (w.submission.state === 'TURNED_IN' || w.submission.state === 'RETURNED');
  const upcoming = d.work.filter((w) => !isDone(w));
  const done = d.work.filter(isDone);
  const list = as === 'teacher' ? d.work : upcoming;
  return (
    <div className="panel glass">
      <div className="panel__head">
        <div><h2>{course.name}</h2>{course.section && <p className="tiny">{course.section}</p>}</div>
        <div className="actions">
          {as === 'teacher' && d.students.some((s) => s.email) && <a className="btn btn--ghost btn--sm" href={gmail(d.students.map((s) => s.email).filter(Boolean), course.name)} target="_blank" rel="noreferrer">Email class</a>}
          <a className="btn btn--glass btn--sm" href={course.alternateLink} target="_blank" rel="noreferrer">Open in Classroom <Icon d={I.ext} /></a>
        </div>
      </div>
      {children?.(d, load)}
      <div className="split">
        <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <h3 className="tiny" style={{ marginBottom: 8 }}>{as === 'teacher' ? `Assignments (${d.work.length})` : `To do (${upcoming.length})`}</h3>
            {list.length === 0 ? <p className="muted">Nothing here yet.</p> : (
              <ul className="work">
                {list.map((w) => (
                  <li key={w.id}>
                    <div><strong><a href={w.link} target="_blank" rel="noreferrer">{w.title}</a></strong><small>{w.due ? `Due ${fmtDate(w.due, { weekday: 'short', day: 'numeric', month: 'short' })}` : 'No due date'}{w.maxPoints ? ` · ${w.maxPoints} points` : ''}</small></div>
                    {as === 'teacher' && w.counts ? <span className={`chip ${w.counts.total && w.counts.turnedIn === w.counts.total ? 'chip--ok' : ''}`}>{w.counts.turnedIn}/{w.counts.total} turned in · {w.counts.graded} graded</span> : <WorkStatus w={w} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {as === 'student' && done.length > 0 && (
            <div>
              <h3 className="tiny" style={{ marginBottom: 8 }}>Done ({done.length})</h3>
              <ul className="work">{done.map((w) => <li key={w.id} className="is-done"><div><strong>{w.title}</strong><small>{w.due ? `Was due ${fmtDate(w.due)}` : ''}</small></div><WorkStatus w={w} /></li>)}</ul>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <h3 className="tiny" style={{ marginBottom: 8 }}>Announcements</h3>
            {d.announcements.length === 0 ? <p className="muted">No announcements yet.</p> : (
              <ul className="ann">{d.announcements.map((a) => <li key={a.id}>{a.text}<time>{fmtDate(a.at, { day: 'numeric', month: 'short', year: 'numeric' })}</time></li>)}</ul>
            )}
          </div>
          {as === 'teacher' && (
            <div>
              <h3 className="tiny" style={{ marginBottom: 8 }}>Students ({d.students.length})</h3>
              {d.students.length === 0 ? <p className="muted">No students yet. Invite one above.</p> : (
                <ul className="roster">{d.students.map((s) => <li key={s.id}><Ava src={s.photo} name={s.name} size={32} /><div>{s.name}<small>{s.email}</small></div></li>)}</ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseList({ cr, selected, onSelect }: { cr: ReturnType<typeof useClassroom>; selected: GCourse | null; onSelect: (c: GCourse) => void }) {
  if (cr.err?.status === 428) return null;
  if (cr.err?.status === 451) return <Empty><p><strong>Classroom is off for this account.</strong><br />{cr.err.message}</p></Empty>;
  if (cr.err) return <Empty><p className="msg msg--err">{cr.err.message}</p></Empty>;
  if (!cr.courses) return <p className="muted">Loading classes…</p>;
  if (cr.courses.length === 0) return <Empty><p>No active Classroom classes yet.</p></Empty>;
  return (
    <div className="grid">
      {cr.courses.map((c) => (
        <button key={c.id} className={`card glass glass--hover ${selected?.id === c.id ? 'card--active' : ''}`} onClick={() => onSelect(c)}>
          <h3>{c.name}</h3>
          {c.section && <p>{c.section}</p>}
          <div className="card__meta"><span>{c.descriptionHeading || 'Google Classroom'}</span><span className="chip">{selected?.id === c.id ? 'Open' : 'View'}</span></div>
        </button>
      ))}
    </div>
  );
}

/* ---------- student ---------- */
function StudentHome({ me, reloadMe, courses }: { me: Me; reloadMe: () => void; courses: Course[] }) {
  const cr = useClassroom();
  const [sel, setSel] = useState<GCourse | null>(null);
  useEffect(() => { if (cr.courses?.length && !sel) setSel(cr.courses[0]); }, [cr.courses, sel]);
  const needsConnect = !me.classroom.connected || cr.err?.status === 428;
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Hello, {me.user.name.split(' ')[0]}</h1><p>{needsConnect ? 'Connect Google Classroom to see your classes here.' : 'Here is what is due and what is new.'}</p></div></div>
      {needsConnect && <Banner title="Connect Google Classroom" text="Read-only: your classes, assignments, grades and announcements." cta="Connect Classroom" href={connectUrl('student')} />}
      {!needsConnect && <CourseList cr={cr} selected={sel} onSelect={setSel} />}
      {!needsConnect && sel && <CourseDetail key={sel.id} course={sel} qs="" as="student" />}
      {can(me, 'academy.enroll') && <AcademyCourses me={me} reload={reloadMe} courses={courses} />}
      {can(me, 'tools.gmail') && <p className="tiny">Need help? <a className="accent" href={gmail(CONTACT.email, 'Question from the student portal')} target="_blank" rel="noreferrer">Email the mentor</a> (opens Gmail).</p>}
    </>
  );
}

function AcademyCourses({ me, reload, courses }: { me: Me; reload: () => void; courses: Course[] }) {
  const [busy, setBusy] = useState<number | null>(null);
  const toggle = async (c: Course) => {
    setBusy(c.id);
    await post('/api/enroll', { course_id: c.id }, me.courseIds.includes(c.id) ? 'DELETE' : 'POST').catch(() => {});
    setBusy(null); reload();
  };
  return (
    <div className="panel glass">
      <div className="panel__head"><div><h2>Your courses at Raghvyon</h2><p className="tiny">Tick the courses you are joining. Your mentor sees this list.</p></div><a className="btn btn--glass btn--sm" href="/#demo">Book a demo</a></div>
      <div className="grid">
        {courses.map((c) => {
          const on = me.courseIds.includes(c.id);
          return (
            <div key={c.id} className={`card glass ${on ? 'card--active' : ''}`}>
              <h3>{c.title}</h3><p>{c.grade_level} · {c.duration}</p>
              <div className="card__meta"><span>{c.subject}</span><button className={`btn btn--sm ${on ? 'btn--glass' : ''}`} disabled={busy === c.id} onClick={() => toggle(c)}>{busy === c.id ? 'Saving…' : on ? 'Remove' : 'Add'}</button></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- parent ---------- */
function ParentHome({ me }: { me: Me }) {
  const [child, setChild] = useState<Child | null>(me.children[0] || null);
  const cr = useClassroom(child?.id);
  const [sel, setSel] = useState<GCourse | null>(null);
  useEffect(() => { setSel(null); }, [child?.id]);
  useEffect(() => { if (cr.courses?.length && !sel) setSel(cr.courses[0]); }, [cr.courses, sel]);
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Hello, {me.user.name.split(' ')[0]}</h1><p>{child ? `${child.name.split(' ')[0]}'s classes, work and announcements.` : 'No student is linked to you yet.'}</p></div></div>
      {me.children.length === 0 && <Empty><p>Ask the academy to link your child to this account. Write to <a href={`mailto:${CONTACT.email}`} className="accent">{CONTACT.email}</a> or WhatsApp {CONTACT.phone}.</p></Empty>}
      {me.children.length > 1 && <div className="chips">{me.children.map((c) => <button key={c.id} className="chip" aria-pressed={child?.id === c.id} onClick={() => setChild(c)}>{c.name}</button>)}</div>}
      {child && !child.connected && <Empty><p><strong>{child.name}</strong> has not connected Google Classroom yet. Ask them to sign in to this portal once and tap "Connect Classroom".</p></Empty>}
      {child && child.connected && <CourseList cr={cr} selected={sel} onSelect={setSel} />}
      {child && child.connected && cr.err?.status === 428 && <Empty><p>{child.name}'s Classroom connection has expired. Ask them to sign in and reconnect.</p></Empty>}
      {child && child.connected && sel && <CourseDetail key={sel.id} course={sel} qs={cr.qs} as="student" />}
    </>
  );
}

/* ---------- teacher ---------- */
function TeacherHome({ me }: { me: Me }) {
  const cr = useClassroom();
  const [sel, setSel] = useState<GCourse | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (cr.courses?.length && !sel) setSel(cr.courses[0]); }, [cr.courses, sel]);
  const needsConnect = !me.classroom.connected || cr.err?.status === 428;

  async function createClass(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const data = Object.fromEntries(new FormData(f));
    setMsg('');
    try { const c = await post<GCourse>('/api/classroom/courses', data); f.reset(); setCreating(false); cr.reload(); setSel(c); setMsg(`Created "${c.name}" in Google Classroom.`); }
    catch (err) { setMsg(err instanceof Error ? err.message : 'Could not create the class'); }
  }

  return (
    <>
      <div className="pagehead">
        <div><h1 className="display">Teaching</h1><p>{needsConnect ? 'Connect Google Classroom to manage your classes from here.' : 'Your classes, synced with Google Classroom.'}</p></div>
        {!needsConnect && <div className="actions"><button className="btn btn--sm" onClick={() => setCreating((v) => !v)}>{creating ? 'Cancel' : 'New class'}</button></div>}
      </div>
      {needsConnect && <Banner title="Connect Google Classroom as a teacher" text="Create classes, post assignments and announcements, invite students." cta="Connect Classroom" href={connectUrl('teacher')} />}
      {msg && <p className={`msg ${/Created|Posted|Invited/.test(msg) ? 'msg--ok' : 'msg--err'}`} role="status">{msg}</p>}
      {creating && (
        <form className="panel glass form" onSubmit={createClass}>
          <h2>New class</h2>
          <div className="row">
            <label className="field"><span>Class name</span><input name="name" required maxLength={120} placeholder="Grade 8 Mathematics, Batch A" /></label>
            <label className="field"><span>Section (optional)</span><input name="section" maxLength={80} placeholder="Mon · Wed · Fri, 5 pm IST" /></label>
          </div>
          <label className="field"><span>Short description (optional)</span><input name="description" maxLength={300} placeholder="Algebra, geometry and word problems for CBSE Grade 8" /></label>
          <button className="btn">Create in Classroom</button>
        </form>
      )}
      {!needsConnect && <CourseList cr={cr} selected={sel} onSelect={setSel} />}
      {!needsConnect && sel && (
        <CourseDetail key={sel.id} course={sel} qs="" as="teacher">
          {(_d, reload) => <TeacherActions course={sel} onDone={(m) => { setMsg(m); reload(); }} />}
        </CourseDetail>
      )}
    </>
  );
}

function TeacherActions({ course, onDone }: { course: GCourse; onDone: (msg: string) => void }) {
  const [tab, setTab] = useState<'assignment' | 'announcement' | 'invite'>('assignment');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function run(e: FormEvent<HTMLFormElement>, path: string, ok: string) {
    e.preventDefault();
    const f = e.currentTarget; const data = Object.fromEntries(new FormData(f));
    setBusy(true); setErr('');
    try { await post(`/api/classroom/courses/${course.id}/${path}`, data); f.reset(); onDone(ok); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong'); }
    setBusy(false);
  }
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="tabs glass" role="tablist">
        <button role="tab" aria-selected={tab === 'assignment'} onClick={() => setTab('assignment')}>New assignment</button>
        <button role="tab" aria-selected={tab === 'announcement'} onClick={() => setTab('announcement')}>Announcement</button>
        <button role="tab" aria-selected={tab === 'invite'} onClick={() => setTab('invite')}>Invite student</button>
      </div>
      {tab === 'assignment' && (
        <form className="form" onSubmit={(e) => run(e, 'work', 'Posted the assignment to Classroom.')}>
          <div className="row">
            <label className="field"><span>Title</span><input name="title" required maxLength={200} placeholder="Chapter 5: linear equations, Q1–Q12" /></label>
            <label className="field"><span>Points (optional)</span><input name="maxPoints" type="number" min={1} max={1000} placeholder="20" /></label>
          </div>
          <label className="field"><span>Instructions (optional)</span><textarea name="description" maxLength={2000} placeholder="Show your working. Upload a photo of your notebook." /></label>
          <div className="row">
            <label className="field"><span>Due date</span><input name="due" type="date" /></label>
            <label className="field"><span>Due time (IST)</span><input name="dueTime" type="time" defaultValue="20:00" /></label>
          </div>
          <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post assignment'}</button>
        </form>
      )}
      {tab === 'announcement' && (
        <form className="form" onSubmit={(e) => run(e, 'announce', 'Posted the announcement.')}>
          <label className="field"><span>Announcement</span><textarea name="text" required maxLength={4000} placeholder="Tomorrow's class moves to 6 pm. Bring your graph notebook." /></label>
          <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post to class'}</button>
        </form>
      )}
      {tab === 'invite' && (
        <form className="form" onSubmit={(e) => run(e, 'invite', 'Invited. The student will see the invite in Classroom and by email.')}>
          <label className="field"><span>Student's Google email</span><div className="inline"><input name="email" type="email" required placeholder="student@gmail.com" /><button className="btn" disabled={busy}>{busy ? 'Inviting…' : 'Invite'}</button></div></label>
        </form>
      )}
      {err && <p className="msg msg--err" role="alert">{err}</p>}
    </div>
  );
}

/* ---------- admin ---------- */
function AdminDesk({ me }: { me: Me }) {
  const [tab, setTab] = useState<'demos' | 'people' | 'links'>(can(me, 'desk.demos') ? 'demos' : 'people');
  const [data, setData] = useState<{ demos: Demo[]; people: Person[]; links: Link[] } | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<{ demos: Demo[]; people: Person[]; links: Link[] }>('/api/admin').then(setData).catch((e) => setErr(e.message)), []);
  useEffect(() => void load(), [load]);
  const patch = (kind: string, id: number, value: string) => post('/api/admin', { kind, id, value }, 'PATCH').then(load).catch((e) => setErr(e.message));
  const [lp, setLp] = useState(''); const [ls, setLs] = useState('');
  const link = (method: 'POST' | 'DELETE', parent_id: number, student_id: number) => post('/api/admin/link', { parent_id, student_id }, method).then(load).catch((e) => setErr(e.message));

  if (err) return <p className="msg msg--err" role="alert">{err}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const pending = data.demos.filter((d) => d.status === 'pending').length;
  const byId = new Map(data.people.map((p) => [p.id, p]));
  const parents = data.people.filter((p) => p.role === 'parent');
  const students = data.people.filter((p) => p.role === 'student');
  return (
    <>
      <div className="pagehead">
        <div><h1 className="display">Academy desk</h1><p>{pending ? `${pending} demo request${pending > 1 ? 's' : ''} waiting for a call.` : 'No demo requests waiting.'}</p></div>
        <div className="tabs glass" role="tablist">
          {can(me, 'desk.demos') && <button role="tab" aria-selected={tab === 'demos'} onClick={() => setTab('demos')}>Demos ({data.demos.length})</button>}
          {can(me, 'desk.people') && <button role="tab" aria-selected={tab === 'people'} onClick={() => setTab('people')}>People ({data.people.length})</button>}
          {can(me, 'desk.people') && <button role="tab" aria-selected={tab === 'links'} onClick={() => setTab('links')}>Parent links ({data.links.length})</button>}
        </div>
      </div>
      {tab === 'demos' && (data.demos.length === 0 ? <Empty><p>No demo requests yet. They appear here the moment a parent sends the form.</p></Empty> : (
        <div className="tablewrap glass"><table className="table">
          <thead><tr><th>Received</th><th>Parent</th><th>Student</th><th>Subject</th><th>Contact</th><th>When</th><th>Note</th><th>Status</th></tr></thead>
          <tbody>{data.demos.map((d) => (
            <tr key={d.id}>
              <td className="num">{new Date(d.created_at + 'Z').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td>{d.parent_name}</td>
              <td>{d.student_name}{d.student_grade && <small className="muted"> · {d.student_grade}</small>}</td>
              <td>{d.subject || '—'}</td>
              <td><a href={`tel:${d.phone}`}>{d.phone}</a>{d.email && <><br /><a href={`mailto:${d.email}`}>{d.email}</a></>}</td>
              <td>{d.preferred_time_slot || '—'}</td>
              <td className="note">{d.message || '—'}</td>
              <td>
                <select value={d.status} onChange={(e) => patch('demo', d.id, e.target.value)} aria-label={`Status for ${d.student_name}`}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option></select>
                {d.email && can(me, 'tools.gmail') && <a className="btn btn--ghost btn--sm" style={{ marginTop: 6 }} href={gmail(d.email, `Your free demo class at Raghvyon Academy`, `Hi ${d.parent_name},\n\nThank you for booking a demo for ${d.student_name}${d.subject ? ` in ${d.subject}` : ''}. `)} target="_blank" rel="noreferrer">Reply in Gmail</a>}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      ))}
      {tab === 'people' && (
        <div className="tablewrap glass"><table className="table">
          <thead><tr><th>Person</th><th>Role</th><th>Classroom</th><th>Academy courses</th><th>Joined</th></tr></thead>
          <tbody>{data.people.map((p) => (
            <tr key={p.id}>
              <td><div className="person"><Ava src={p.avatar_url} name={p.name} size={28} /><div>{p.name}<small>{p.email}</small></div></div></td>
              <td><select value={p.role} onChange={(e) => patch('role', p.id, e.target.value)} aria-label={`Role for ${p.name}`}>{(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></td>
              <td>{p.connected ? <span className="chip chip--ok">Connected</span> : <span className="chip">Not yet</span>}</td>
              <td className="note">{p.courses || '—'}</td>
              <td className="num">{new Date(p.created_at + 'Z').toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {tab === 'links' && (
        <div className="split">
          <div className="panel glass">
            <h2>Linked parents and students</h2>
            {data.links.length === 0 ? <p className="muted">No links yet.</p> : (
              <ul className="work">{data.links.map((l) => (
                <li key={`${l.parent_user_id}-${l.student_user_id}`}>
                  <div><strong>{byId.get(l.parent_user_id)?.name || '?'}</strong><small>parent of {byId.get(l.student_user_id)?.name || '?'}</small></div>
                  <button className="btn btn--danger btn--sm" onClick={() => link('DELETE', l.parent_user_id, l.student_user_id)}>Unlink</button>
                </li>
              ))}</ul>
            )}
          </div>
          <form className="panel glass form" onSubmit={(e) => { e.preventDefault(); if (lp && ls) link('POST', +lp, +ls); }}>
            <h2>Link a parent to a student</h2>
            <p className="tiny">Both must have signed in once. Set their roles under People first.</p>
            <label className="field"><span>Parent</span><select value={lp} onChange={(e) => setLp(e.target.value)} required><option value="">Choose a parent</option>{parents.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.email}</option>)}</select></label>
            <label className="field"><span>Student</span><select value={ls} onChange={(e) => setLs(e.target.value)} required><option value="">Choose a student</option>{students.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.email}</option>)}</select></label>
            <button className="btn" disabled={!lp || !ls}>Link</button>
          </form>
        </div>
      )}
    </>
  );
}

/* ---------- schedule (Calendar + Meet) ---------- */
function Schedule({ me }: { me: Me }) {
  const [child, setChild] = useState<Child | null>(me.children[0] || null);
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);
  const [msg, setMsg] = useState('');
  const qs = me.user.role === 'parent' && child ? `?student=${child.id}` : '';
  const load = useCallback(() => { setEvents(null); setErr(null); api<CalEvent[]>(`/api/calendar/upcoming${qs}`).then(setEvents).catch(setErr); }, [qs]);
  useEffect(load, [load]);
  const needsConnect = !me.classroom.connected || err?.status === 428;
  const byDay = new Map<string, CalEvent[]>();
  for (const e of events || []) { const k = fmtDate(e.start, { weekday: 'long', day: 'numeric', month: 'long' }); byDay.set(k, [...(byDay.get(k) || []), e]); }
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Schedule</h1><p>Classes for the next 14 days, from Google Calendar. Join with one tap when there is a Meet link.</p></div></div>
      {me.user.role === 'parent' && me.children.length === 0 && <Empty><p>No student is linked to you yet.</p></Empty>}
      {me.user.role === 'parent' && me.children.length > 1 && <div className="chips">{me.children.map((c) => <button key={c.id} className="chip" aria-pressed={child?.id === c.id} onClick={() => setChild(c)}>{c.name}</button>)}</div>}
      {me.user.role !== 'parent' && needsConnect && <Banner title="Connect Google" text="Calendar is read with the same connection as Classroom." cta="Connect Google" href={connectUrl(me.classroom.as)} />}
      {me.user.role === 'parent' && child && !child.connected && <Empty><p><strong>{child.name}</strong> has not connected Google yet.</p></Empty>}
      {can(me, 'calendar.manage') && !needsConnect && <ScheduleClass onDone={(m) => { setMsg(m); load(); }} />}
      {msg && <p className="msg msg--ok" role="status">{msg}</p>}
      {err && err.status !== 428 && <p className="msg msg--err">{err.message}</p>}
      {!err && events && events.length === 0 && <Empty><p>Nothing scheduled in the next two weeks.</p></Empty>}
      {events && events.length > 0 && (
        <div className="days">
          {[...byDay.entries()].map(([day, list]) => (
            <section key={day} className="panel glass">
              <h2>{day}</h2>
              <ul className="work">
                {list.map((e) => (
                  <li key={e.id}>
                    <div><strong>{e.title}</strong><small>{fmtTime(e.start)} – {fmtTime(e.end)}{e.organizer ? ` · ${e.organizer}` : ''}{e.attendees ? ` · ${e.attendees} invited` : ''}</small></div>
                    <div className="actions">{e.meet && <a className="btn btn--sm" href={e.meet} target="_blank" rel="noreferrer">Join Meet</a>}<a className="btn btn--ghost btn--sm" href={e.link} target="_blank" rel="noreferrer">Calendar</a></div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function ScheduleClass({ onDone }: { onDone: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<GCourse[]>([]);
  const [emails, setEmails] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (open) api<GCourse[]>('/api/classroom/courses').then(setCourses).catch(() => {}); }, [open]);
  const fillFromCourse = async (id: string) => {
    if (!id) return;
    const d = await api<Detail>(`/api/classroom/courses/${id}/work`).catch(() => null);
    if (d) setEmails(d.students.map((s) => s.email).filter(Boolean).join(', '));
  };
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const data = Object.fromEntries(new FormData(f)) as Record<string, string>;
    setBusy(true); setErr('');
    try {
      const ev = await post<CalEvent>('/api/calendar/class', { ...data, minutes: Number(data.minutes), weekly: data.weekly === 'on', weeks: Number(data.weeks), attendees: emails.split(/[\s,;]+/).filter(Boolean) });
      f.reset(); setEmails(''); setOpen(false);
      onDone(`Scheduled "${ev.title}"${ev.meet ? ' with a Meet link' : ''}. Invites are on their way.`);
    } catch (x) { setErr(x instanceof Error ? x.message : 'Could not schedule'); }
    setBusy(false);
  }
  return (
    <div className="panel glass">
      <div className="panel__head"><div><h2>Schedule a class</h2><p className="tiny">Creates a Google Calendar event with a Meet link and invites everyone by email.</p></div><button className="btn btn--sm" onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : 'New class'}</button></div>
      {open && (
        <form className="form" onSubmit={submit}>
          <div className="row">
            <label className="field"><span>Title</span><input name="title" required maxLength={200} placeholder="Grade 8 Maths · Linear equations" /></label>
            <label className="field"><span>Fill students from a Classroom class</span><select onChange={(e) => fillFromCourse(e.target.value)} defaultValue=""><option value="">Choose a class (optional)</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          </div>
          <div className="row">
            <label className="field"><span>Date</span><input name="date" type="date" required /></label>
            <label className="field"><span>Start time (IST)</span><input name="time" type="time" required defaultValue="17:00" /></label>
          </div>
          <div className="row">
            <label className="field"><span>Length (minutes)</span><input name="minutes" type="number" min={15} max={240} defaultValue={60} /></label>
            <label className="field"><span>Repeat weekly</span><div className="inline" style={{ alignItems: 'center', minHeight: 50 }}><input type="checkbox" name="weekly" style={{ width: 20, height: 20, minHeight: 0 }} /><span className="muted">for</span><input name="weeks" type="number" min={1} max={52} defaultValue={12} style={{ maxWidth: 90 }} /><span className="muted">weeks</span></div></label>
          </div>
          <label className="field"><span>Student and parent emails (comma separated)</span><textarea value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="aarav@gmail.com, priya.parent@gmail.com" /></label>
          <label className="field"><span>Notes (optional)</span><input name="description" maxLength={2000} placeholder="Bring your notebook from last week." /></label>
          {err && <p className="msg msg--err" role="alert">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Scheduling…' : 'Schedule with Meet link'}</button>
        </form>
      )}
    </div>
  );
}

/* ---------- permissions (super admin) ---------- */
type Catalog = { id: Perm; label: string }[];
function Permissions({ me }: { me: Me }) {
  const [data, setData] = useState<{ catalog: Catalog; roles: Record<Role, Perm[]> } | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api<{ catalog: Catalog; roles: Record<Role, Perm[]> }>('/api/admin/permissions').then(setData).catch((e) => setMsg(e.message)), []);
  useEffect(() => void load(), [load]);
  if (!data) return <p className="muted">{msg || 'Loading…'}</p>;
  const roles = Object.keys(ROLE_LABEL) as Role[];
  const toggle = async (role: Role, perm: Perm) => {
    const next = data.roles[role].includes(perm) ? data.roles[role].filter((p) => p !== perm) : [...data.roles[role], perm];
    setData({ ...data, roles: { ...data.roles, [role]: next } });
    try { await post('/api/admin/permissions', { role, perms: next }, 'PUT'); setMsg(`Saved ${ROLE_LABEL[role]} permissions.`); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save'); load(); }
  };
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Permissions</h1><p>{me.superAdmin ? 'What each role can do. Changes apply immediately. The super admin always has everything.' : 'Only the super admin can change these.'}</p></div></div>
      {msg && <p className="msg msg--ok" role="status">{msg}</p>}
      <div className="tablewrap glass"><table className="table perms">
        <thead><tr><th>Permission</th>{roles.map((r) => <th key={r}>{ROLE_LABEL[r]}</th>)}</tr></thead>
        <tbody>{data.catalog.map((p) => (
          <tr key={p.id}><td><strong>{p.label}</strong><small className="muted" style={{ display: 'block' }}>{p.id}</small></td>
            {roles.map((r) => <td key={r}><input type="checkbox" aria-label={`${p.label} for ${ROLE_LABEL[r]}`} checked={data.roles[r].includes(p.id)} disabled={!me.superAdmin} onChange={() => toggle(r, p.id)} /></td>)}
          </tr>
        ))}</tbody>
      </table></div>
    </>
  );
}

/* ---------- attendance ---------- */
const ATT: Record<AttStatus, { label: string; short: string; cls: string }> = {
  present: { label: 'Present', short: 'P', cls: 'att--present' },
  late: { label: 'Late', short: 'L', cls: 'att--late' },
  absent: { label: 'Absent', short: 'A', cls: 'att--absent' },
  leave: { label: 'Leave', short: 'LV', cls: 'att--leave' },
};
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const shiftMonth = (m: string, by: number) => { const [y, mo] = m.split('-').map(Number); const d = new Date(Date.UTC(y, mo - 1 + by, 1)); return d.toISOString().slice(0, 7); };
const fmtRange = (a: string, b: string) => (a === b ? fmtDate(a, { day: 'numeric', month: 'short', year: 'numeric' }) : `${fmtDate(a)} – ${fmtDate(b, { day: 'numeric', month: 'short', year: 'numeric' })}`);

type MyAtt = { student: { id: number; name: string }; month: string; records: { date: string; status: AttStatus; course_name: string }[]; leaves: { id: number; start_date: string; end_date: string; status: string; reason: string }[]; overall: { total: number; present: number; absent: number; late: number; leave: number } };

function AttendanceView({ me }: { me: Me }) {
  const [child, setChild] = useState<Child | null>(me.children[0] || null);
  const [month, setMonth] = useState(todayIST().slice(0, 7));
  const [d, setD] = useState<MyAtt | null>(null);
  const [err, setErr] = useState('');
  const isParent = me.user.role === 'parent';
  useEffect(() => {
    if (isParent && !child) return;
    setD(null); setErr('');
    api<MyAtt>(`/api/attendance/me?month=${month}${isParent ? `&student=${child!.id}` : ''}`).then(setD).catch((e) => setErr(e.message));
  }, [month, child, isParent]);

  const [y, mo] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const daysIn = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const byDay = new Map<string, AttStatus[]>();
  for (const r of d?.records || []) byDay.set(r.date, [...(byDay.get(r.date) || []), r.status]);
  const leaveDay = (iso: string) => d?.leaves.find((l) => l.start_date <= iso && l.end_date >= iso);
  const worst = (list: AttStatus[]): AttStatus => (list.includes('absent') ? 'absent' : list.includes('late') ? 'late' : list.includes('leave') ? 'leave' : 'present');
  const mRec = d?.records || [];
  const mCount = (s: AttStatus) => mRec.filter((r) => r.status === s).length;
  const o = d?.overall;
  const attended = o ? (o.present || 0) + (o.late || 0) : 0;

  return (
    <>
      <div className="pagehead">
        <div><h1 className="display">Attendance</h1><p>{isParent ? (child ? `${child.name.split(' ')[0]}'s attendance across all classes.` : 'No student is linked to you yet.') : 'Your attendance across all classes.'}</p></div>
        <div className="monthnav glass"><button aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>‹</button><span>{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span><button aria-label="Next month" disabled={month >= todayIST().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>›</button></div>
      </div>
      {isParent && me.children.length > 1 && <div className="chips">{me.children.map((c) => <button key={c.id} className="chip" aria-pressed={child?.id === c.id} onClick={() => setChild(c)}>{c.name}</button>)}</div>}
      {isParent && me.children.length === 0 && <Empty><p>Ask the academy to link your child to this account.</p></Empty>}
      {err && <p className="msg msg--err">{err}</p>}
      {d && (
        <>
          <div className="stats4">
            <div className="tile glass"><span>Overall attendance</span><strong className={pct(attended, o?.total || 0) >= 75 || !o?.total ? 'accent' : 'warn'}>{o?.total ? `${pct(attended, o.total)}%` : '—'}</strong><small>{o?.total ? `${attended} of ${o.total} classes` : 'No classes marked yet'}</small></div>
            <div className="tile glass"><span>Present this month</span><strong>{mCount('present')}</strong><small>{mCount('late')} late</small></div>
            <div className="tile glass"><span>Absent this month</span><strong className={mCount('absent') ? 'warn' : ''}>{mCount('absent')}</strong><small>without leave</small></div>
            <div className="tile glass"><span>On leave this month</span><strong>{mCount('leave')}</strong><small>{d.leaves.filter((l) => l.status === 'pending').length} request(s) pending</small></div>
          </div>
          <div className="panel glass">
            <div className="cal">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => <b key={w}>{w}</b>)}
              {Array.from({ length: lead }, (_, i) => <i key={`x${i}`} />)}
              {Array.from({ length: daysIn }, (_, i) => {
                const iso = `${month}-${String(i + 1).padStart(2, '0')}`;
                const list = byDay.get(iso);
                const lv = leaveDay(iso);
                const st = list ? worst(list) : lv?.status === 'approved' ? 'leave' : null;
                const title = list ? d.records.filter((r) => r.date === iso).map((r) => `${r.course_name || 'Class'}: ${ATT[r.status].label}`).join('\n') : lv ? `Leave ${lv.status}: ${lv.reason}` : '';
                return (
                  <span key={iso} className={`day ${st ? ATT[st].cls : ''} ${lv?.status === 'pending' ? 'day--pending' : ''} ${iso === todayIST() ? 'day--today' : ''}`} title={title}>
                    <em>{i + 1}</em>{list && list.length > 1 && <small>{list.length}</small>}
                  </span>
                );
              })}
            </div>
            <div className="legend">{(Object.keys(ATT) as AttStatus[]).map((k) => <span key={k}><i className={ATT[k].cls} />{ATT[k].label}</span>)}<span><i className="day--pending" />Leave pending</span></div>
          </div>
          {mRec.length > 0 && (
            <div className="panel glass">
              <h2>By class this month</h2>
              <ul className="bars">
                {[...new Set(mRec.map((r) => r.course_name || 'Class'))].map((c) => {
                  const rs = mRec.filter((r) => (r.course_name || 'Class') === c);
                  const a = rs.filter((r) => r.status === 'present' || r.status === 'late').length;
                  return <li key={c}><span>{c}</span><div className="bar"><i style={{ width: `${pct(a, rs.length)}%` }} /></div><b>{pct(a, rs.length)}%</b></li>;
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}

type CourseAtt = { date: string; students: { id: string; name: string; email: string; photo: string | null }[]; marks: Record<string, AttStatus>; leaves: Record<string, { status: string; reason: string }> };
type Summary = { from: string; to: string; students: { email: string; name: string; total: number; present: number; absent: number; late: number; leave: number }[]; days: { date: string; present: number; total: number }[] };

function MarkAttendance({ me }: { me: Me }) {
  const cr = useClassroom();
  const [sel, setSel] = useState<GCourse | null>(null);
  const [date, setDate] = useState(todayIST());
  const [d, setD] = useState<CourseAtt | null>(null);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});
  const [sum, setSum] = useState<Summary | null>(null);
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (cr.courses?.length && !sel) setSel(cr.courses[0]); }, [cr.courses, sel]);
  const load = useCallback(() => {
    if (!sel) return;
    setD(null); setMsg('');
    api<CourseAtt>(`/api/attendance/course/${sel.id}?date=${date}`).then((x) => {
      setD(x);
      // Approved leave pre-fills "leave"; everything unmarked starts as present.
      setMarks(Object.fromEntries(x.students.map((s) => [s.email, x.marks[s.email] || (x.leaves[s.email]?.status === 'approved' ? 'leave' : 'present')])));
    }).catch((e) => setMsg(e.message));
    api<Summary>(`/api/attendance/course/${sel.id}/summary`).then(setSum).catch(() => setSum(null));
  }, [sel, date]);
  useEffect(load, [load]);
  const needsConnect = !me.classroom.connected || cr.err?.status === 428;
  async function save() {
    if (!sel || !d) return;
    setBusy(true); setMsg('');
    try {
      const r = await post<{ saved: number }>(`/api/attendance/course/${sel.id}`, { date, course_name: sel.name, marks: d.students.filter((s) => s.email).map((s) => ({ email: s.email, name: s.name, status: marks[s.email] })) }, 'PUT');
      setMsg(`Saved attendance for ${r.saved} students on ${fmtDate(date, { day: 'numeric', month: 'short' })}.`);
      api<Summary>(`/api/attendance/course/${sel.id}/summary`).then(setSum).catch(() => {});
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save'); }
    setBusy(false);
  }
  const count = (s: AttStatus) => Object.values(marks).filter((m) => m === s).length;
  const maxDay = Math.max(1, ...(sum?.days.map((x) => x.total) || [1]));
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Mark attendance</h1><p>Pick a class and a date. Approved leaves are filled in for you.</p></div></div>
      {needsConnect && <Banner title="Connect Google Classroom" text="The class roster comes from Classroom." cta="Connect Classroom" href={connectUrl('teacher')} />}
      {!needsConnect && <CourseList cr={cr} selected={sel} onSelect={setSel} />}
      {sel && !needsConnect && (
        <div className="panel glass">
          <div className="panel__head">
            <div><h2>{sel.name}</h2><p className="tiny">{d ? `${d.students.length} students · ${count('present')} present · ${count('late')} late · ${count('absent')} absent · ${count('leave')} on leave` : 'Loading roster…'}</p></div>
            <div className="actions">
              <input className="input" type="date" value={date} max={todayIST()} onChange={(e) => setDate(e.target.value)} aria-label="Date" style={{ minHeight: 40, width: 'auto' }} />
              <button className="btn btn--ghost btn--sm" onClick={() => d && setMarks(Object.fromEntries(d.students.map((s) => [s.email, d.leaves[s.email]?.status === 'approved' ? 'leave' : 'present'])))}>All present</button>
            </div>
          </div>
          {d && d.students.length === 0 && <p className="muted">No students in this class yet. Invite them from Teaching.</p>}
          {d && d.students.length > 0 && (
            <ul className="roll">
              {d.students.map((s) => (
                <li key={s.id}>
                  <div className="person"><Ava src={s.photo} name={s.name} size={32} /><div>{s.name}<small>{s.email || 'email hidden by Classroom'}{d.leaves[s.email] && <> · <span className={d.leaves[s.email].status === 'approved' ? 'accent' : 'warn'}>leave {d.leaves[s.email].status}</span></>}</small></div></div>
                  <div className="seg" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                    {(Object.keys(ATT) as AttStatus[]).map((k) => <button key={k} role="radio" aria-checked={marks[s.email] === k} className={marks[s.email] === k ? ATT[k].cls : ''} disabled={!s.email} onClick={() => setMarks({ ...marks, [s.email]: k })} title={ATT[k].label}>{ATT[k].short}</button>)}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {msg && <p className={`msg ${msg.startsWith('Saved') ? 'msg--ok' : 'msg--err'}`} role="status">{msg}</p>}
          {d && d.students.length > 0 && <button className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save attendance'}</button>}
        </div>
      )}
      {sel && sum && sum.students.length > 0 && (
        <div className="panel glass">
          <h2>Last 30 days</h2>
          <div className="spark" aria-label="Attendance per class day">
            {sum.days.map((x) => <span key={x.date} title={`${fmtDate(x.date)}: ${x.present}/${x.total}`}><i style={{ height: `${(x.total / maxDay) * 100}%` }}><b style={{ height: `${pct(x.present, x.total)}%` }} /></i></span>)}
          </div>
          <ul className="bars">
            {sum.students.map((st) => { const a = (st.present || 0) + (st.late || 0); const p = pct(a, st.total); return <li key={st.email}><span>{st.name || st.email}</span><div className="bar"><i className={p < 75 ? 'low' : ''} style={{ width: `${p}%` }} /></div><b>{p}%</b></li>; })}
          </ul>
          <p className="tiny">Bars turn amber below 75%.</p>
        </div>
      )}
    </>
  );
}

/* ---------- leaves ---------- */
const LeaveChip = ({ s }: { s: Leave['status'] }) => <span className={`chip ${s === 'approved' ? 'chip--ok' : s === 'rejected' ? 'chip--danger' : s === 'pending' ? 'chip--warn' : ''}`}>{s === 'pending' ? 'Waiting for parent' : s[0].toUpperCase() + s.slice(1)}</span>;

function Leaves({ me }: { me: Me }) {
  const [list, setList] = useState<Leave[] | null>(null);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const load = useCallback(() => api<Leave[]>('/api/leaves').then(setList).catch((e) => setErr(e.message)), []);
  useEffect(() => void load(), [load]);
  const isStudent = can(me, 'leave.apply') && me.user.role === 'student';
  const isParent = me.user.role === 'parent' && can(me, 'leave.approve');
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const decide = async (l: Leave, decision: 'approved' | 'rejected' | 'cancelled') => {
    try { await post(`/api/leaves/${l.id}`, { decision, note: decision === 'rejected' ? note : '' }, 'PATCH'); setMsg(decision === 'cancelled' ? 'Request cancelled.' : `Leave ${decision}.`); setRejecting(null); setNote(''); load(); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not update'); }
  };
  const pending = (list || []).filter((l) => l.status === 'pending');
  const rest = (list || []).filter((l) => l.status !== 'pending');
  return (
    <>
      <div className="pagehead"><div><h1 className="display">Leave</h1><p>{isStudent ? 'Apply for leave. Your parent approves it, then your teachers see it.' : isParent ? 'Approve or reject leave your child has asked for.' : 'Approved and pending leave across all students.'}</p></div></div>
      {msg && <p className="msg msg--ok" role="status">{msg}</p>}
      {err && <p className="msg msg--err">{err}</p>}
      {isStudent && <ApplyLeave me={me} onDone={(m) => { setMsg(m); load(); }} />}
      {!list && !err && <p className="muted">Loading…</p>}
      {list && list.length === 0 && <Empty><p>{isParent ? 'No leave requests from your children yet.' : 'No leave requests yet.'}</p></Empty>}
      {pending.length > 0 && (
        <div className="panel glass">
          <h2>{isParent ? 'Waiting for your decision' : 'Pending'} ({pending.length})</h2>
          <ul className="work">{pending.map((l) => (
            <li key={l.id}>
              <div><strong>{!isStudent && `${l.student_name} · `}{fmtRange(l.start_date, l.end_date)}</strong><small>{l.reason}{l.course_name ? ` · ${l.course_name}` : ' · all classes'}</small></div>
              <div className="actions">
                {isParent && rejecting !== l.id && <><button className="btn btn--sm" onClick={() => decide(l, 'approved')}>Approve</button><button className="btn btn--danger btn--sm" onClick={() => { setRejecting(l.id); setNote(''); }}>Reject</button></>}
                {isParent && rejecting === l.id && <div className="inline"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason (optional)" maxLength={300} style={{ minHeight: 40 }} /><button className="btn btn--danger btn--sm" onClick={() => decide(l, 'rejected')}>Reject</button><button className="btn btn--ghost btn--sm" onClick={() => setRejecting(null)}>Back</button></div>}
                {isStudent && <><LeaveChip s={l.status} /><button className="btn btn--ghost btn--sm" onClick={() => decide(l, 'cancelled')}>Cancel</button></>}
                {!isParent && !isStudent && <LeaveChip s={l.status} />}
              </div>
            </li>
          ))}</ul>
        </div>
      )}
      {rest.length > 0 && (
        <div className="panel glass">
          <h2>{isParent || isStudent ? 'History' : 'Approved'}</h2>
          <ul className="work">{rest.map((l) => (
            <li key={l.id}>
              <div><strong>{!isStudent && `${l.student_name} · `}{fmtRange(l.start_date, l.end_date)}</strong><small>{l.reason}{l.course_name ? ` · ${l.course_name}` : ''}{l.decided_by_name ? ` · ${l.status} by ${l.decided_by_name}` : ''}{l.parent_note ? ` · "${l.parent_note}"` : ''}</small></div>
              <LeaveChip s={l.status} />
            </li>
          ))}</ul>
        </div>
      )}
    </>
  );
}

function ApplyLeave({ me, onDone }: { me: Me; onDone: (m: string) => void }) {
  const [courses, setCourses] = useState<GCourse[]>([]);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  useEffect(() => { if (me.classroom.connected) api<GCourse[]>('/api/classroom/courses').then(setCourses).catch(() => {}); }, [me.classroom.connected]);
  const noParent = me.parents.length === 0;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const data = Object.fromEntries(new FormData(f)) as Record<string, string>;
    const course = courses.find((c) => c.id === data.course_id);
    setBusy(true); setErr('');
    try { await post('/api/leaves', { ...data, course_name: course?.name || '' }); f.reset(); onDone(`Leave requested. ${me.parents.map((p) => p.name.split(' ')[0]).join(' or ')} will approve it.`); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Could not apply'); }
    setBusy(false);
  }
  return (
    <form className="panel glass form" onSubmit={submit}>
      <div className="panel__head"><h2>Apply for leave</h2>{!noParent && can(me, 'tools.gmail') && <a className="btn btn--ghost btn--sm" href={gmail(me.parents.map((p) => p.email), 'Leave request on the Raghvyon portal', 'I have asked for leave on the Raghvyon Academy portal. Please approve it at https://www.raghvyon.co.in/portal')} target="_blank" rel="noreferrer">Tell my parent on Gmail</a>}</div>
      {noParent && <p className="msg msg--err">Your parent is not linked yet, so nobody can approve leave. Ask the academy to link them.</p>}
      <div className="row">
        <label className="field"><span>From</span><input name="start_date" type="date" required defaultValue={todayIST()} /></label>
        <label className="field"><span>To</span><input name="end_date" type="date" required defaultValue={todayIST()} /></label>
      </div>
      <label className="field"><span>Class</span><select name="course_id" defaultValue=""><option value="">All classes</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="field"><span>Reason</span><textarea name="reason" required minLength={3} maxLength={500} placeholder="Family function in Jaipur, back on Monday." /></label>
      {err && <p className="msg msg--err" role="alert">{err}</p>}
      <button className="btn" disabled={busy || noParent}>{busy ? 'Sending…' : 'Send to parent for approval'}</button>
    </form>
  );
}

/* ---------- root ---------- */
const navFor = (me: Me): NavItem[] => {
  const items: NavItem[] = [];
  if (can(me, 'classroom.view') && me.user.role !== 'teacher' && me.user.role !== 'admin') items.push({ id: 'home', label: me.user.role === 'parent' ? "My child's classes" : 'My classes', icon: I.book });
  if (can(me, 'classroom.manage')) items.push({ id: 'teach', label: 'Teaching', icon: I.book });
  if (can(me, 'calendar.view')) items.push({ id: 'schedule', label: 'Schedule', icon: I.cal });
  if (can(me, 'attendance.mark')) items.push({ id: 'mark', label: 'Attendance', icon: I.check });
  else if (can(me, 'attendance.view')) items.push({ id: 'attendance', label: 'Attendance', icon: I.check });
  if (can(me, 'leave.apply') || can(me, 'leave.approve') || can(me, 'leave.view')) items.push({ id: 'leave', label: 'Leave', icon: I.leave });
  if (can(me, 'desk.demos') || can(me, 'desk.people')) items.unshift({ id: 'desk', label: 'Academy desk', icon: I.inbox });
  if (me.user.role === 'admin') items.push({ id: 'perms', label: 'Permissions', icon: I.lock });
  if (items.length === 0) items.push({ id: 'home', label: 'Home', icon: I.home });
  return items;
};

export default function Portal() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [view, setView] = useState('');
  const load = useCallback(() => api<Me>('/api/me').then(setMe).catch(() => setMe(null)), []);
  useEffect(() => {
    document.title = 'Portal — Raghvyon Academy';
    void load();
    api<Course[]>('/api/courses').then((c) => c.length && setCourses(c)).catch(() => {});
  }, [load]);
  const items = me ? navFor(me) : [];
  useEffect(() => { if (me && (!view || !items.some((i) => i.id === view))) setView(items[0]?.id || 'home'); }, [me, view, items]);
  const signOut = async () => { await post('/api/auth/logout', {}).catch(() => {}); setMe(null); history.replaceState(null, '', '/portal'); };

  if (me === undefined) return <div className="main"><p className="muted">Loading…</p></div>;
  if (me === null) return <SignIn onDone={load} />;
  const role = me.user.role;
  return (
    <Shell me={me} items={items} view={view} setView={setView} onSignOut={signOut}>
      {view === 'home' && role === 'parent' && <ParentHome me={me} />}
      {view === 'home' && role !== 'parent' && <StudentHome me={me} reloadMe={load} courses={courses} />}
      {view === 'teach' && <TeacherHome me={me} />}
      {view === 'schedule' && <Schedule me={me} />}
      {view === 'mark' && <MarkAttendance me={me} />}
      {view === 'attendance' && <AttendanceView me={me} />}
      {view === 'leave' && <Leaves me={me} />}
      {view === 'desk' && <AdminDesk me={me} />}
      {view === 'perms' && <Permissions me={me} />}
    </Shell>
  );
}
