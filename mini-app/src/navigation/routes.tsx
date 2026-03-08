import type { ComponentType } from 'react';

import { MissesScreen } from '@/screens/MissesScreen';
import { VotingScreen } from '@/screens/VotingScreen';
import { MissProfileScreen } from '@/screens/MissProfileScreen';

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: '/', Component: MissesScreen },
  { path: '/voting', Component: VotingScreen },
  { path: '/miss/:id', Component: MissProfileScreen },
];
