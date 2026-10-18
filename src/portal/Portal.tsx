import { useCallback, useEffect, useRef, useState } from 'react';
import '../site/site.css';
import './portal.css';
import { FALLBACK_COURSES, type Course } from '../site/content';

type User = { id: number; email: string; name: string; role: 'student' | 'parent' | 'admin'; avatar_url: string | null };
type Demo = { id: number; parent_name: string; student_name: string; student_grade: string | null; subject: string | null; phone: string; email: string | null; preferred_time_slot: string | null; message: string | null; status: string; created_at: string };
type Person = { id: number; name: string; email: string; role: string; created_at: string; courses: string | null };

declare global {
  interface Window {
    google?: { accounts: { id: { initialize(o: object): void; renderButton(el: HTMLElement, o: object): void } } };
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status });
  return body as T;
}

function SignIn({ onUser }: { onUser: (u: User) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    api<{ googleClientId: string | null }>('/api/config').then((c) => setClientId(c.googleClientId)).catch(() => setClientId(null));
  }, []);
  useEffect(() => {
    if (!clientId) return;
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }: { credential: string }) => {
          try {
            setError('');
            const { user } = await api<{ user: User }>('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });
            onUser(user);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Sign-in failed');
          }
        },
      });
      if (box.current) window.google?.accounts.id.renderButton(box.current, { theme: 'filled_black', size: 'large', shape: 'rectangular', text: 'signin_with' });
    };
    s.onerror = () => setError('Google sign-in could not load. Check your connection and refresh.');
    document.head.appendChild(s);
    return () => s.remove();
  }, [onUser, clientId]);
  return (
    <section className="pt-signin">
      <h1 className="rv-h">Student and admin login</h1>
      <p>Sign in with the Google account you used for the academy. New students get a dashboard right away. By signing in you agree to our <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.</p>
      {clientId ? <div ref={box} className="pt-gbtn" /> : clientId === null && <p className="pt-err">Google sign-in is not configured yet (GOOGLE_CLIENT_ID is missing).</p>}
      {error && <p className="pt-err" role="alert">{error}</p>}
    </section>
  );
}

function Student({ user, courseIds, courses, reload }: { user: User; courseIds: number[]; courses: Course[]; reload: () => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const toggle = async (c: Course) => {
    setBusy(c.id);
    await api('/api/enroll', { method: courseIds.includes(c.id) ? 'DELETE' : 'POST', body: JSON.stringify({ course_id: c.id }) }).catch(() => {});
    setBusy(null);
    reload();
  };
  const mine = courses.filter((c) => courseIds.includes(c.id));
  return (
    <section>
      <h1 className="rv-h">Hello, {user.name.split(' ')[0]}</h1>
      <p className="pt-sub">
        {mine.length ? `You are in ${mine.length} course${mine.length > 1 ? 's' : ''}. Your mentor will share class times on WhatsApp.` : 'Add the courses you are joining. Your mentor sees this list.'}
      </p>
      <table className="pt-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Grades</th>
            <th>Length</th>
            <th aria-label="Action" />
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const joined = courseIds.includes(c.id);
            return (
              <tr key={c.id} className={joined ? 'is-on' : ''}>
                <td><strong>{c.title}</strong></td>
                <td>{c.grade_level}</td>
                <td>{c.duration}</td>
                <td>
                  <button className={`btn ${joined ? 'btn--ghost' : ''}`} onClick={() => toggle(c)} disabled={busy === c.id}>
                    {busy === c.id ? 'Saving…' : joined ? 'Remove' : 'Add course'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="pt-sub">Haven’t had a demo yet? <a href="/#demo">Book a free demo class</a>.</p>
    </section>
  );
}

function Admin() {
  const [tab, setTab] = useState<'demos' | 'people'>('demos');
  const [data, setData] = useState<{ demos: Demo[]; students: Person[] } | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => api<{ demos: Demo[]; students: Person[] }>('/api/admin').then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => void load(), [load]);
  const patch = (kind: string, id: number, value: string) => api('/api/admin', { method: 'PATCH', body: JSON.stringify({ kind, id, value }) }).then(load).catch((e) => setError(e.message));

  if (error) return <p className="pt-err" role="alert">{error}</p>;
  if (!data) return <p className="pt-sub">Loading…</p>;
  const pending = data.demos.filter((d) => d.status === 'pending').length;
  return (
    <section>
      <h1 className="rv-h">Academy desk</h1>
      <p className="pt-sub">{pending ? `${pending} demo request${pending > 1 ? 's' : ''} waiting for a call.` : 'No demo requests waiting.'}</p>
      <div className="pt-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'demos'} onClick={() => setTab('demos')}>Demo requests ({data.demos.length})</button>
        <button role="tab" aria-selected={tab === 'people'} onClick={() => setTab('people')}>People ({data.students.length})</button>
      </div>
      {tab === 'demos' ? (
        data.demos.length ? (
          <div className="pt-scroll">
            <table className="pt-table">
              <thead>
                <tr><th>Received</th><th>Parent</th><th>Student</th><th>Subject</th><th>Contact</th><th>When</th><th>Note</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.demos.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{new Date(d.created_at + 'Z').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td>{d.parent_name}</td>
                    <td>{d.student_name}{d.student_grade && <span className="pt-dim"> · {d.student_grade}</span>}</td>
                    <td>{d.subject || '—'}</td>
                    <td><a href={`tel:${d.phone}`}>{d.phone}</a>{d.email && <><br /><a href={`mailto:${d.email}`}>{d.email}</a></>}</td>
                    <td>{d.preferred_time_slot || '—'}</td>
                    <td className="pt-note">{d.message || '—'}</td>
                    <td>
                      <select value={d.status} onChange={(e) => patch('demo', d.id, e.target.value)} aria-label={`Status for ${d.student_name}`}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pt-sub">No demo requests yet. They appear here as soon as a parent sends the form on the home page.</p>
        )
      ) : (
        <div className="pt-scroll">
          <table className="pt-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Courses</th><th>Joined</th><th>Role</th></tr>
            </thead>
            <tbody>
              {data.students.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.courses || '—'}</td>
                  <td className="num">{new Date(p.created_at + 'Z').toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td>
                    <select value={p.role} onChange={(e) => patch('role', p.id, e.target.value)} aria-label={`Role for ${p.name}`}>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Portal() {
  const [me, setMe] = useState<{ user: User; courseIds: number[] } | null | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const load = useCallback(() => api<{ user: User; courseIds: number[] }>('/api/me').then(setMe).catch(() => setMe(null)), []);
  useEffect(() => {
    void load();
    api<Course[]>('/api/courses').then((c) => c.length && setCourses(c)).catch(() => {});
  }, [load]);
  const onUser = useCallback(() => void load(), [load]);
  const signOut = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
  };

  return (
    <div className="rv pt">
      <header className="pt-bar">
        <a href="/" className="bar__mark" style={{ gridColumn: 'auto' }}>
          <span className="bullet" aria-hidden="true"><i /><i /><i /><i /></span> Raghvyon Academy
        </a>
        {me && (
          <div className="pt-who">
            <span>{me.user.email}</span>
            <button className="btn btn--ghost" onClick={signOut}>Sign out</button>
          </div>
        )}
      </header>
      <main className="pt-main">
        {me === undefined ? <p className="pt-sub">Loading…</p> : me === null ? <SignIn onUser={onUser} /> : me.user.role === 'admin' ? <Admin /> : <Student user={me.user} courseIds={me.courseIds} courses={courses} reload={load} />}
      </main>
    </div>
  );
}
