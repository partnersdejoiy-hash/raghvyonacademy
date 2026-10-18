import { useEffect, useRef, useState } from 'react';
import '../ui/theme.css';
import './legal.css';
import { CubeFallback, useCube, type CubeHandle } from '../ui/Cube';
import { Mark, Wordmark } from '../ui/Mark';
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
      setActive((atEnd ? els.at(-1) : passed.at(-1) ?? els[0])!.id);
      cube.current?.setExplode(1.8 * (1 - count / els.length));
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [doc]);

  return (
    <div className="lg" id="top">
      <header className="lg-bar wrap">
        <Wordmark />
        <nav aria-label="Legal pages">
          <a href={other.href}>{other.label}</a>
          <a className="btn btn--sm" href="/#demo">Book a free demo</a>
        </nav>
      </header>

      <section className="wrap lg-hero">
        <div>
          <h1 className="display lg-title">{doc.title}</h1>
          <p className="lead">{doc.lead}</p>
          <p className="tiny" style={{ marginTop: 16 }}>Last updated {doc.updated}</p>
        </div>
        <div className="lg-stage">
          <div className="lg-halo" aria-hidden="true" />
          {failed ? <CubeFallback /> : <canvas ref={ref} role="img" aria-label="A cube of eight blocks that comes together as you read" />}
          <p className="lg-progress glass" aria-live="polite">
            {read === doc.sections.length ? 'All read. Every block in place.' : `${read} of ${doc.sections.length} read · drag to turn`}
          </p>
        </div>
      </section>

      <div className="wrap lg-body">
        <nav className="lg-toc glass" aria-label="On this page">
          <ul>
            {doc.sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}><Mark size={10} /> {s.title}</a></li>
            ))}
          </ul>
        </nav>
        <article className="lg-text">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="lg-section glass">
              <h2 className="h3">{s.title}</h2>
              {s.body}
            </section>
          ))}
          <p className="lg-note">Questions about this page? Write to us any time. We read every message.</p>
        </article>
      </div>

      <footer className="wrap lg-foot">
        <span>© {new Date().getFullYear()} Raghvyon Academy, New Delhi</span>
        <nav aria-label="Footer"><a href="/">Home</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/portal">Sign in</a></nav>
      </footer>
    </div>
  );
}
