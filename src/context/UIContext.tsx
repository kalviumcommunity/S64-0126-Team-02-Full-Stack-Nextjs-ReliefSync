'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface UIContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log(`[UIContext] Theme toggled to: ${newTheme}`);
  };

  const value: UIContextType = {
    theme,
    toggleTheme,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}
