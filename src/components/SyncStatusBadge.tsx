import React, { useEffect, useState } from 'react';
import { syncService } from '../services/syncService';
import { SyncStatus } from '../types';
import { Cloud, CloudCheck, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';

interface SyncStatusBadgeProps {
  lang?: 'en' | 'ar';
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ lang = 'en' }) => {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());

  useEffect(() => {
    return syncService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const isRtl = lang === 'ar';

  if (status === 'synced') {
    return (
      <div
        className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-600/30 px-2 py-0.5 rounded"
        title={isRtl ? 'تمت المزامنة السحابية' : 'Synced with Cloud'}
      >
        <CloudCheck size={13} className="text-emerald-400" />
        <span className="hidden sm:inline">{isRtl ? 'متزامن' : 'Synced'}</span>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div
        className="flex items-center gap-1 text-[11px] font-mono text-[#ff5c5c] bg-[#221010] border border-[#e11d1d]/40 px-2 py-0.5 rounded"
        title={isRtl ? 'جارِ المزامنة...' : 'Syncing changes...'}
      >
        <RefreshCw size={13} className="animate-spin text-[#ff5c5c]" />
        <span className="hidden sm:inline">{isRtl ? 'مزامنة...' : 'Syncing'}</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div
        className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-600/30 px-2 py-0.5 rounded"
        title={isRtl ? 'وضع عدم الاتصال' : 'Offline Mode'}
      >
        <CloudOff size={13} className="text-amber-400" />
        <span className="hidden sm:inline">{isRtl ? 'أوفلاين' : 'Offline'}</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-600/30 px-2 py-0.5 rounded"
        title={isRtl ? 'خطأ في المزامنة' : 'Sync Error'}
      >
        <AlertCircle size={13} className="text-rose-400" />
        <span className="hidden sm:inline">{isRtl ? 'خطأ' : 'Error'}</span>
      </div>
    );
  }

  // local_only
  return (
    <div
      className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded"
      title={isRtl ? 'تخزين محلي' : 'Local Storage'}
    >
      <Cloud size={13} className="text-neutral-500" />
      <span className="hidden sm:inline">{isRtl ? 'محلي' : 'Local'}</span>
    </div>
  );
};
