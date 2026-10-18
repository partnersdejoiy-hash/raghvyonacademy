/** The academy mark: a square split into a², ab, ab, b². */
export const Mark = ({ size = 18 }: { size?: number }) => (
  <span className="mark" aria-hidden="true" style={{ width: size, height: size }}>
    <i />
    <i />
    <i />
    <i />
  </span>
);

export const Wordmark = ({ href = '/' }: { href?: string }) => (
  <a className="wordmark" href={href} aria-label="Raghvyon Academy home">
    <Mark size={22} /> <span>Raghvyon</span>
  </a>
);
