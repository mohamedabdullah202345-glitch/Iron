import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  lang?: 'en' | 'ar';
  variant?: 'header' | 'card' | 'button';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'en',
  variant = 'button'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="bg-[#121914] border border-emerald-600/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'تطبيق IRON مثبت على جهازك ويعمل بكفاءة.'
              : 'IRON is installed as a native PWA on this device.'}
          </span>
        </div>
      );
    }
    return null;
  }

  // Not installable and not iOS (e.g. desktop non-chromium or unknown): hide
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const label = lang === 'ar' ? 'تثبيت التطبيق' : 'Install App';

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-lg text-xs font-bold uppercase tracking-wider flutter-tap transition-all shadow-md shadow-[#e11d1d]/30"
          title={label}
        >
          <Download size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ) : variant === 'card' ? (
        <div className="bg-gradient-to-r from-[#211010] to-[#161616] border border-[#e11d1d]/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e11d1d]/20 text-[#ff5c5c] flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white uppercase tracking-wider">
                {label}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'ar'
                  ? 'ثبّت IRON على شاشتك الرئيسية للعمل دون إنترنت ووصول فوري.'
                  : 'Install IRON on your home screen for instant offline access and native speed.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-4 py-2 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 flutter-tap shrink-0"
          >
            <Download size={14} />
            <span>{label}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="w-full py-3 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-xl font-display font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-all shadow-lg shadow-[#e11d1d]/20"
        >
          <Download size={16} />
          <span>{label}</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={18} className="text-[#ff5c5c]" />
                {lang === 'ar' ? 'التثبيت على iPhone / iPad' : 'Install on iPhone / iPad'}
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-[#222] text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3 bg-[#1c1c1c] rounded-xl border border-[#262626]">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#ff5c5c] shrink-0 mt-0.5">
                  <Share size={15} />
                </div>
                <div>
                  <div className="font-bold text-white mb-0.5">
                    {lang === 'ar' ? '1. اضغط زر المشاركة' : '1. Tap the Share button'}
                  </div>
                  <p className="text-neutral-400">
                    {lang === 'ar'
                      ? 'موجود في أسفل شاشة Safari (أيقونة المربع مع السهم للأعلى).'
                      : 'Located in Safari’s bottom toolbar (square with upward arrow).'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#1c1c1c] rounded-xl border border-[#262626]">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#ff5c5c] shrink-0 mt-0.5">
                  <PlusSquare size={15} />
                </div>
                <div>
                  <div className="font-bold text-white mb-0.5">
                    {lang === 'ar' ? '2. إضافة إلى الصفحة الرئيسية' : '2. Add to Home Screen'}
                  </div>
                  <p className="text-neutral-400">
                    {lang === 'ar'
                      ? 'مرر للأسفل واضغط خيار "إضافة إلى الصفحة الرئيسية" ثم اضغط إضافة.'
                      : 'Scroll down the share sheet and tap "Add to Home Screen", then tap Add.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-[#222222] hover:bg-[#2c2c2c] text-white rounded-lg text-xs font-bold uppercase tracking-wider flutter-tap"
            >
              {lang === 'ar' ? 'فهمت ذلك' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
