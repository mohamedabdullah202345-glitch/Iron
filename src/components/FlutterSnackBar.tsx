import React from 'react';

interface FlutterSnackBarProps {
  message: string;
  onUndo?: () => void;
  undoLabel?: string;
}

export const FlutterSnackBar: React.FC<FlutterSnackBarProps> = ({
  message,
  onUndo,
  undoLabel = 'UNDO'
}) => {
  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 pointer-events-auto">
      <div className="bg-[#1f1f1f] text-white border border-[#e11d1d]/60 rounded-lg px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <span className="text-sm font-medium leading-tight">{message}</span>
        {onUndo && (
          <button
            onClick={onUndo}
            className="text-[#ff5c5c] hover:text-[#ff8080] font-bold text-xs uppercase tracking-wider px-2 py-1 rounded transition-colors flutter-tap shrink-0"
          >
            {undoLabel}
          </button>
        )}
      </div>
    </div>
  );
};
