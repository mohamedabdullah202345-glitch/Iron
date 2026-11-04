import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Code2, Wifi, Battery, User } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { SyncStatusBadge } from './SyncStatusBadge';

interface FlutterDeviceFrameProps {
  children: React.ReactNode;
  showCodeViewer: boolean;
  onToggleCodeViewer: () => void;
  lang: 'en' | 'ar';
  currentUser?: any;
  onOpenAuthModal?: () => void;
}

export const FlutterDeviceFrame: React.FC<FlutterDeviceFrameProps> = ({
  children,
  showCodeViewer,
  onToggleCodeViewer,
  lang,
  currentUser,
  onOpenAuthModal
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'expanded'>('mobile');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    };
    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const now = new Date();
  const timeString = `${now.getHours() % 12 || 12}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  // If already installed as PWA or running standalone, render native edge-to-edge
  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f2f2f2] flex flex-col items-center">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col px-4 pt-3 pb-safe">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-[#f2f2f2] flex flex-col items-center">
      {/* Top Floating App Bar */}
      <header className="w-full bg-[#0c0c0c]/90 backdrop-blur-md border-b border-[#1f1f1f] sticky top-0 z-40 px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d1d] shadow-sm shadow-[#e11d1d]" />
            <h1 className="font-display font-black text-xl tracking-wider text-white uppercase">
              IRON
            </h1>
          </div>
          <span className="text-[11px] bg-[#1a1a1a] text-neutral-400 border border-[#2a2a2a] px-2 py-0.5 rounded font-mono hidden sm:inline-block">
            PWA
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sync status indicator */}
          <SyncStatusBadge lang={lang} />

          {/* User Account / Sign In button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors flutter-tap ${
                currentUser
                  ? 'bg-[#18201a] border-emerald-600/30 text-emerald-300'
                  : 'bg-[#1a1414] border-[#e11d1d]/30 text-neutral-300 hover:text-white'
              }`}
              title={
                currentUser
                  ? currentUser.email || 'Cloud Account'
                  : lang === 'ar'
                  ? 'تسجيل الدخول للمزامنة'
                  : 'Sign in to sync'
              }
            >
              <User size={14} className={currentUser ? 'text-emerald-400' : 'text-[#ff5c5c]'} />
              <span className="hidden md:inline max-w-[100px] truncate">
                {currentUser
                  ? (currentUser.email ? currentUser.email.split('@')[0] : 'User')
                  : lang === 'ar'
                  ? 'دخول'
                  : 'Sign In'}
              </span>
            </button>
          )}

          {/* In-app PWA install trigger */}
          <PWAInstallButton lang={lang} variant="header" />

          {/* Mobile frame vs Full-width switch */}
          <div className="hidden sm:flex items-center bg-[#171717] p-1 rounded-lg border border-[#262626]">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-[#291111] text-[#ff5c5c] border border-[#e11d1d]/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile Device Chassis"
            >
              <Smartphone size={15} />
              <span className="hidden md:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode('expanded')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'expanded'
                  ? 'bg-[#291111] text-[#ff5c5c] border border-[#e11d1d]/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Expanded Responsive View"
            >
              <Monitor size={15} />
              <span className="hidden md:inline">Expanded</span>
            </button>
          </div>

          {/* Toggle Flutter Code Inspector */}
          <button
            onClick={onToggleCodeViewer}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all flutter-tap ${
              showCodeViewer
                ? 'bg-[#e11d1d] border-[#e11d1d] text-white shadow-md shadow-[#e11d1d]/30'
                : 'bg-[#181818] border-[#292929] text-neutral-300 hover:text-white'
            }`}
          >
            <Code2 size={15} />
            <span className="hidden md:inline">Flutter Code</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-x-hidden">
        {deviceMode === 'mobile' ? (
          /* Phone Frame Chassis (on small viewports, auto-expands cleanly) */
          <div className="w-full max-w-[430px] bg-[#0a0a0a] rounded-[36px] sm:rounded-[48px] border-4 sm:border-[10px] border-[#1c1c1c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col my-auto relative min-h-[760px]">
            {/* Status Bar */}
            <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-medium text-neutral-300 z-30 select-none bg-transparent">
              <span className="font-semibold text-xs tracking-tight">
                {timeString}
              </span>

              {/* Dynamic Island Pill */}
              <div className="w-20 sm:w-24 h-4 bg-black rounded-full mx-auto" />

              <div className="flex items-center gap-1.5 text-neutral-400">
                <Wifi size={13} />
                <Battery size={15} />
              </div>
            </div>

            {/* Viewport Screen Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 relative">
              {children}
            </div>

            {/* Bottom Home Indicator */}
            <div className="h-5 flex items-center justify-center bg-transparent shrink-0 pointer-events-none">
              <div className="w-32 h-1 bg-neutral-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Responsive Canvas */
          <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#222222] rounded-2xl p-4 sm:p-8 shadow-2xl min-h-[800px]">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
