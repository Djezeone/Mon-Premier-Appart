import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GamificationModalProps {
  type: 'levelup' | 'badge';
  title: string;
  message: string;
  emoji: string;
  onClose: () => void;
}

const GamificationModal: React.FC<GamificationModalProps> = ({
  type,
  title,
  message,
  emoji,
  onClose,
}) => {
  useEffect(() => {
    // Auto close after 4 seconds
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform transition-all animate-pop max-w-sm w-full text-center border-4 border-indigo-100 overflow-hidden">
        {/* Simple CSS Confetti */}
        {type === 'levelup' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-float opacity-70"
              style={{ animationDuration: '2s' }}
            ></div>
            <div
              className="absolute top-10 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-70"
              style={{ animationDuration: '3s', animationDelay: '0.5s' }}
            ></div>
            <div
              className="absolute bottom-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-float opacity-70"
              style={{ animationDuration: '2.5s', animationDelay: '1s' }}
            ></div>
            <div
              className="absolute top-1/2 right-10 w-3 h-3 bg-green-400 rounded-full animate-float opacity-70"
              style={{ animationDuration: '2.2s' }}
            ></div>
            <div
              className="absolute top-5 left-5 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-70"
              style={{ animationDuration: '4s' }}
            ></div>
          </div>
        )}

        {/* Decorative Background Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-30 blur-2xl"></div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          <div
            className={`text-6xl mb-4 ${type === 'levelup' ? 'animate-bounce' : 'animate-float'}`}
          >
            {emoji}
          </div>

          <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-500 mb-1">
            {type === 'levelup' ? 'Niveau Supérieur !' : 'Nouveau Badge !'}
          </h2>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>

          <p className="text-gray-600 leading-relaxed">{message}</p>

          <button
            onClick={onClose}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-full w-full transition-colors shadow-lg shadow-indigo-200"
          >
            Super !
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamificationModal;
