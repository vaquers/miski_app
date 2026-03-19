import { useEffect, useRef, lazy, Suspense } from 'react';
import {
  Navigate,
  Route,
  Routes,
  HashRouter,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { TabBar } from '@/components/TabBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MissesScreen = lazy(() =>
  import('@/screens/MissesScreen').then((m) => ({ default: m.MissesScreen })),
);
const MissProfileScreen = lazy(() =>
  import('@/screens/MissProfileScreen').then((m) => ({ default: m.MissProfileScreen })),
);
// const VotingScreen = lazy(() =>
//   import('@/screens/VotingScreen').then((m) => ({ default: m.VotingScreen })),
// );

function ScreenFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: 'transparent',
      color: 'rgba(255, 255, 255, 0.3)',
      fontFamily: 'inherit',
    }}>
      Загрузка…
    </div>
  );
}

function RouteErrorFallback({ error, reset }: { error: unknown; reset: () => void }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: 24,
      textAlign: 'center',
      gap: 16,
      color: 'rgba(255, 255, 255, 0.85)',
    }}>
      <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Ошибка на экране</p>
      <pre style={{
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.35)',
        maxWidth: '80vw',
        overflow: 'auto',
        margin: 0,
      }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { reset(); navigate('/'); }}
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          На главную
        </button>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Повторить
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const lp = useLaunchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const didApplyStartParam = useRef(false);

  useEffect(() => {
    const startParam = lp.tgWebAppStartParam;
    if (!startParam || didApplyStartParam.current) return;
    if (location.pathname !== '/') return;

    didApplyStartParam.current = true;

    if (startParam === 'voting') {
      navigate('/voting', { replace: true });
      return;
    }

    navigate(`/?miss=${encodeURIComponent(startParam)}`, { replace: true });
  }, [lp.tgWebAppStartParam, navigate, location.pathname, location.search]);

  return (
    <>
      <div className="app-global-bg" aria-hidden />
      <ErrorBoundary fallback={RouteErrorFallback}>
        <Suspense fallback={<ScreenFallback />}>
          <Routes>
            <Route path="/" element={<MissesScreen />} />
            <Route path="/voting" element={<Navigate to="/" />} />
            <Route path="/miss/:id" element={<MissProfileScreen />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <TabBar />
    </>
  );
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppRoot>
  );
}
