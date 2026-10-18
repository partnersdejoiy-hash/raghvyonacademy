import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import '../ui/theme.css';
import './portal.css';
import { FALLBACK_COURSES, CONTACT, type Course } from '../site/content';
import { Mark, Wordmark } from '../ui/Mark';

/* ---------- types & api ---------- */
type Role = 'student' | 'parent' | 'teacher' | 'admin';
type User = { id: number; email: string; name: string; role: Role; avatar_url: string | null };
type Child = { id: number; name: string; email: string; avatar_url: string | null; connected: boolean };
type Me = { user: User; courseIds: number[]; classroom: { connected: boolean; as: 'student' | 'teacher' }; children: Child[] };
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
};

/* ---------- sign in ---------- */
function SignIn() {
  const error = new URLSearchParams(location.search).get('error');
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
        <p className="signin__legal">Only your name, email and photo are read at sign-in. Classroom access is asked for separately, when you connect it. See the <a href="/privacy">privacy policy</a> and <a href="/terms">terms</a>.</p>
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
        <header className="topbar"><Wordmark /><nav aria-label="Portal">{nav}</nav><button className="btn btn--ghost btn--sm" onClick={onSignOut}>Sign out</button></header>
        <main className="main">{children}</main>
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
        <a className="btn btn--glass btn--sm" href={course.alternateLink} target="_blank" rel="noreferrer">Open in Classroom <Icon d={I.ext} /></a>
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
  if (cr.err) return <p className="msg msg--err">{cr.err.message}</p>;
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
      <AcademyCourses me={me} reload={reloadMe} courses={courses} />
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
function AdminDesk() {
  const [tab, setTab] = useState<'demos' | 'people' | 'links'>('demos');
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
          <button role="tab" aria-selected={tab === 'demos'} onClick={() => setTab('demos')}>Demos ({data.demos.length})</button>
          <button role="tab" aria-selected={tab === 'people'} onClick={() => setTab('people')}>People ({data.people.length})</button>
          <button role="tab" aria-selected={tab === 'links'} onClick={() => setTab('links')}>Parent links ({data.links.length})</button>
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
              <td><select value={d.status} onChange={(e) => patch('demo', d.id, e.target.value)} aria-label={`Status for ${d.student_name}`}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option></select></td>
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

/* ---------- root ---------- */
const NAV: Record<Role, NavItem[]> = {
  student: [{ id: 'home', label: 'My classes', icon: I.book }],
  parent: [{ id: 'home', label: "My child's classes", icon: I.book }],
  teacher: [{ id: 'teach', label: 'Teaching', icon: I.book }],
  admin: [{ id: 'desk', label: 'Academy desk', icon: I.inbox }, { id: 'teach', label: 'Teaching', icon: I.book }],
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
  useEffect(() => { if (me && !view) setView(NAV[me.user.role][0].id); }, [me, view]);
  const signOut = async () => { await post('/api/auth/logout', {}).catch(() => {}); setMe(null); history.replaceState(null, '', '/portal'); };

  if (me === undefined) return <div className="main"><p className="muted">Loading…</p></div>;
  if (me === null) return <SignIn />;
  const role = me.user.role;
  return (
    <Shell me={me} items={NAV[role]} view={view} setView={setView} onSignOut={signOut}>
      {role === 'student' && <StudentHome me={me} reloadMe={load} courses={courses} />}
      {role === 'parent' && <ParentHome me={me} />}
      {role === 'teacher' && <TeacherHome me={me} />}
      {role === 'admin' && (view === 'teach' ? <TeacherHome me={me} /> : <AdminDesk />)}
    </Shell>
  );
}
