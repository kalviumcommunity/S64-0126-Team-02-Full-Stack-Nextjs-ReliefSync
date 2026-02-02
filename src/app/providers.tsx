'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}
