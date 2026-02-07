import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800'
  }[type];

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg border ${bgColor} shadow-lg max-w-sm z-50`}>
      {message}
    </div>
  );
};

export default Toast;
