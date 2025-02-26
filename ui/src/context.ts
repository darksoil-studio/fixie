import { createContext } from '@lit/context';
import { FixieStore } from './fixie-store.js';

export const fixieStoreContext = createContext<FixieStore>(
  'fixie/store'
);

