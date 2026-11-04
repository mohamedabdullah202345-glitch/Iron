import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  lang?: 'en' | 'ar';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'en' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed top-14 left-4 right-4 max-w-md mx-auto z-50 pointer-events-none"
    >
      <div className="bg-[#1f1a10] border border-amber-600/60 text-amber-200 px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <WifiOff size={14} className="text-amber-400" />
          <span>
            {isRtl
              ? 'وضع عدم الاتصال — التطبيق يعمل بالكامل دون إنترنت.'
              : 'Offline Mode — App operates 100% offline from cache.'}
          </span>
        </div>
      </div>
    </div>
  );
};
