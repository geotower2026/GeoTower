import React from 'react';
import Header from './Header';

const AppLayout = ({ children }) => {
  return (
    <div className="app-shell h-[100svh] w-full overflow-hidden flex flex-col transition-colors duration-300">
      <Header />

      {/* Scrollable content area - takes only needed height */}
      <main className="app-main overflow-y-auto overscroll-none">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
