import { useEffect, useRef, useState } from 'react';
import { hasWebGL, type CubeHandle, type CubeOptions } from './cube';

export type { CubeHandle };

/** Mount the 3D cube lazily so three.js never blocks the first paint. */
export function useCube(opts: CubeOptions, onReady?: (c: CubeHandle) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasWebGL()) return setState('failed');
    let cube: CubeHandle | undefined;
    let cancelled = false;
    import('./cube')
      .then(({ mountCube }) => {
        if (cancelled) return;
        cube = mountCube(canvas, opts);
        setState('ready');
        onReady?.(cube);
      })
      .catch(() => setState('failed'));
    return () => {
      cancelled = true;
      cube?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, state, failed: state === 'failed' };
}

/** Flat 2-D version of the motif for browsers without WebGL. */
export const CubeFallback = ({ className = '' }: { className?: string }) => (
  <div className={`cube-fallback ${className}`} aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </div>
);
