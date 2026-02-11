
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgColors = {
      success: 'bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900', // High contrast
      error: 'bg-red-900/95 text-white',
      info: 'bg-indigo-900/95 text-white'
  }

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-up w-max max-w-[90vw]">
      <div className={`${bgColors[type]} px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-white/10`}>
        {icons[type]}
        <span className="text-sm font-bold">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
