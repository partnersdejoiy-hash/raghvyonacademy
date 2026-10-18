import { useEffect, useRef, useState } from 'react';
import '../site/site.css';
import './legal.css';
import { Bullet, useCube, type CubeHandle } from '../site/Site';
import { PRIVACY, TERMS } from './content';

/** Privacy and terms pages: the (a+b)³ cube assembles block by block as the reader works through the sections. */
export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const doc = kind === 'privacy' ? PRIVACY : TERMS;
  const other = kind === 'privacy' ? { href: '/terms', label: 'Terms of service' } : { href: '/privacy', label: 'Privacy policy' };
  const [active, setActive] = useState(doc.sections[0].id);
  const [read, setRead] = useState(0);
  const cube = useRef<CubeHandle | undefined>(undefined);
  const { ref, failed } = useCube({ a: 3, b: 2, explode: 1.8, drag: true }, (c) => (cube.current = c));

  useEffect(() => {
    document.title = `${doc.title} — Raghvyon Academy`;
    const onScroll = () => {
      const els = doc.sections.map((s) => document.getElementById(s.id)!);
      const passed = els.filter((el) => el.getBoundingClientRect().top < innerHeight * 0.45);
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      const count = atEnd ? els.length : passed.length;
      setRead(count);
      setActive((passed.at(-1) ?? els[0]).id);
      cube.current?.setExplode(1.8 * (1 - count / els.length));
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [doc]);

  return (
    <div className="rv lg" id="top">
      <header className="lg-bar">
        <a href="/" className="lg-mark">
          <Bullet /> Raghvyon Academy
        </a>
        <nav aria-label="Legal pages">
          <a href={other.href}>{other.label}</a>
          <a className="btn" href="/#demo">Book a free demo</a>
        </nav>
      </header>

      <section className="lg-hero">
        <div className="lg-hero__copy">
          <h1 className="lg-title">{doc.title}</h1>
          <p className="rv-lead">{doc.lead}</p>
          <p className="lg-date">Last updated {doc.updated}</p>
        </div>
        <div className="lg-stage">
          {failed ? (
            <div className="hero__fallback lg-fallback" aria-hidden="true"><i /><i /><i /><i /></div>
          ) : (
            <canvas ref={ref} role="img" aria-label="A cube of eight blocks that comes together as you read" />
          )}
          <p className="lg-progress" aria-live="polite">
            {read === doc.sections.length ? 'All read. Every block in place.' : `${read} of ${doc.sections.length} read · drag to turn`}
          </p>
        </div>
      </section>

      <div className="lg-body">
        <nav className="lg-toc" aria-label="On this page">
          <ul>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
                  <Bullet /> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="lg-text">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="lg-section">
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
          <p className="lg-note">
            Questions about this page? Write to us any time. We read every message.
          </p>
        </article>
      </div>

      <footer className="lg-foot">
        <span>© {new Date().getFullYear()} Raghvyon Academy, New Delhi</span>
        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/portal">Student login</a>
        </nav>
      </footer>
    </div>
  );
}
