import React, { useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  onBack,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] bg-[#141414] border-t-2 border-[#e11d1d] rounded-t-3xl p-5 pb-8 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle */}
        <div className="w-10 h-1 bg-[#333333] rounded-full mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#141414] py-1 pb-3 mb-2 border-b border-[#262626] z-10 shrink-0">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center text-white/80 hover:text-white flutter-tap"
                aria-label="Back"
              >
                <ChevronLeft size={18} />
              </button>
            ) : null}
            <h3 className="font-display font-extrabold text-xl tracking-wider text-white uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center text-white/70 hover:text-white flutter-tap"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
