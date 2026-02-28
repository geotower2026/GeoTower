import React, { createContext, useContext, useState, useEffect } from 'react';

// Global theme context used by multiple pages.  The tower UI previously
// persisted its own "torreControleTema" key, but having a central context
// makes it easy to expose selection everywhere (Profile, etc) and keeps the
// value reactive.

// theme definitions shared by multiple screens
export const THEMES = {
  dark: {
    name: '🌙 Escuro',
    bg: '#0f0f1a',
    bgSecondary: '#1a1a2e',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    border: 'border-white/10',
    header: 'bg-[#0f0f1a]/90',
    card: 'bg-white/5',
    cardHover: 'hover:bg-white/10',
  },
  black: {
    name: '⚫ Preto Puro',
    bg: '#000000',
    bgSecondary: '#0a0a0a',
    text: '#ffffff',
    textSecondary: '#d0d0d0',
    border: 'border-white/[0.08]',
    header: 'bg-black/95',
    card: 'bg-white/[0.03]',
    cardHover: 'hover:bg-white/[0.06]',
  },
  light: {
    name: '☀️ Claro',
    bg: '#eef2f6',
    bgSecondary: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#404040',
    border: 'border-gray-300',
    header: 'bg-white/95',
    card: 'bg-white/60',
    cardHover: 'hover:bg-white/70',
  },
  company: {
    name: '🎨 Cores Empresa',
    bg: '#f3e5f5',
    bgSecondary: '#ffffff',
    text: '#1a0033',
    textSecondary: '#4a0080',
    border: 'border-purple-200',
    header: 'bg-gradient-to-r from-purple-700 to-indigo-700',
    card: 'bg-purple-50',
    cardHover: 'hover:bg-purple-100',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // migrate existing key if necessary
  const stored = localStorage.getItem('appTheme');
  const legacy = localStorage.getItem('torreControleTema');
  const initial = stored || legacy || 'dark';
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    // keep backward compatibility for the tower page
    localStorage.setItem('torreControleTema', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
