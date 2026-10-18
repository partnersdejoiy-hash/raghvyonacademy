import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import Site from './site/Site';

// The portal (login, student and admin pages) loads only when someone opens /portal.
const Portal = lazy(() => import('./portal/Portal'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {location.pathname.startsWith('/portal') ? (
      <Suspense fallback={null}>
        <Portal />
      </Suspense>
    ) : (
      <Site />
    )}
  </StrictMode>,
);
