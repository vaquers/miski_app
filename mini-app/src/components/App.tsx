import { useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  HashRouter,
  useNavigate,
} from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { TabBar } from '@/components/TabBar';
import { routes } from '@/navigation/routes';

function AppContent() {
  const lp = useLaunchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startParam = lp.startParam;
    if (!startParam) return;

    navigate(`/miss/${startParam}`, { replace: true });
  }, [lp.startParam, navigate]);

  return (
    <>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.Component />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
