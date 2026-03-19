import type { ComponentType } from 'react';
import React from 'react';

import { MissesScreen } from '@/screens/MissesScreen';
import { VotingScreen } from '@/screens/VotingScreen';
import { MissProfileScreen } from '@/screens/MissProfileScreen';

interface Route {
  path: string;
  Component: ComponentType;
}

const VotingDisabled: React.FC = () => (
  <div
    style={{
      padding: 24,
      color: 'rgba(255, 255, 255, 0.92)',
      textAlign: 'center',
      fontSize: 18,
    }}
  >
    Голосование временно недоступно. Скоро обновим.
  </div>
);

export const routes: Route[] = [
  { path: '/', Component: MissesScreen },
  { path: '/voting', Component: import.meta.env.PROD ? VotingDisabled : VotingScreen },
  { path: '/miss/:id', Component: MissProfileScreen },
];
