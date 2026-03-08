// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const renderApp = () => {
  root.render(
    <StrictMode>
      <Root/>
    </StrictMode>,
  );
};

const renderFallback = () => {
  root.render(<EnvUnsupported/>);
};

root.render(
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#08080F',
    color: 'rgba(255, 255, 255, 0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  }}>
    Loading…
  </div>,
);

(async () => {
  try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
      || import.meta.env.DEV;

    const initPromise = init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });

    const timeoutMs = 8000;
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Init timeout')), timeoutMs);
    });

    await Promise.race([initPromise, timeoutPromise]);
    renderApp();
  } catch (e) {
    try {
      renderApp();
    } catch {
      renderFallback();
    }
  }
})();
