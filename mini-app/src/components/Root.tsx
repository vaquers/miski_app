import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl.ts';

function ErrorFallback({ error }: { error: unknown }) {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui', color: '#1c1c1e' }}>
      <p>Ошибка загрузки:</p>
      <pre style={{ fontSize: 12, overflow: 'auto' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <ErrorBoundary fallback={<App />}>
        <TonConnectUIProvider
          manifestUrl={publicUrl('tonconnect-manifest.json')}
        >
          <App />
        </TonConnectUIProvider>
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
