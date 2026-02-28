import React from 'react';
import Header from './Header';
import { useTheme, THEMES } from '../contexts/ThemeContext';

const AppLayout = ({ children }) => {
  const { theme } = useTheme();
  const cfg = THEMES[theme] || THEMES.dark;
  return (
    <div
      className="h-[100svh] w-full overflow-hidden flex flex-col"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <Header />

      {/* Scrollable content area - takes only needed height */}
      <main className="overflow-y-auto overscroll-none">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
