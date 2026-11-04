import React, { useState } from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  isSupabaseConfigured
} from '../services/supabase';
import { X, LogIn, UserPlus, AlertCircle, Shield, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ar';
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMsg(
        isRtl
          ? 'يرجى تهيئة متغيرات Supabase في ملف .env (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY).'
          : 'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      } else {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;
        if (data.user) {
          if (data.session) {
            onAuthSuccess(data.user);
            onClose();
          } else {
            setSuccessMsg(
              isRtl
                ? 'تم إنشاء الحساب! تفقد بريدك الإلكتروني لتأكيد التسجيل.'
                : 'Account created! Please check your email to confirm registration.'
            );
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!configured) {
      setErrorMsg(
        isRtl
          ? 'يرجى تهيئة متغيرات Supabase في ملف .env أولاً.'
          : 'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env first.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Crimson Accent Stripe */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#e11d1d] via-[#ff5c5c] to-[#e11d1d]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e11d1d]/20 text-[#ff5c5c] flex items-center justify-center font-display font-black text-sm">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                {mode === 'signin'
                  ? isRtl
                    ? 'تسجيل الدخول'
                    : 'Account Sign In'
                  : isRtl
                  ? 'إنشاء حساب جديد'
                  : 'Create Account'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {isRtl ? 'مزامنة سحابية وحفظ تقدمك' : 'Cloud sync & progress backup'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#222222] hover:bg-[#2c2c2c] text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mode Toggle Switch */}
        <div className="grid grid-cols-2 gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#262626] my-4">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-[#261010] text-[#ff5c5c] border border-[#e11d1d]/40 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn size={13} />
            <span>{isRtl ? 'دخول' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-[#261010] text-[#ff5c5c] border border-[#e11d1d]/40 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus size={13} />
            <span>{isRtl ? 'تسجيل جديد' : 'Sign Up'}</span>
          </button>
        </div>

        {/* Errors & Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <Check size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="warrior@ironapp.com"
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e11d1d] hover:bg-[#c91818] disabled:opacity-50 text-white rounded-xl font-display font-extrabold text-sm uppercase tracking-wider flutter-tap transition-all shadow-lg shadow-[#e11d1d]/30 mt-2"
          >
            {loading
              ? isRtl
                ? 'جارِ التحميل...'
                : 'Processing...'
              : mode === 'signin'
              ? isRtl
                ? 'تسجيل الدخول'
                : 'Sign In'
              : isRtl
              ? 'إنشاء حساب جديد'
              : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-[#222222] w-full" />
          <span className="bg-[#141414] px-2 text-[10px] uppercase font-mono text-neutral-500 absolute">
            {isRtl ? 'أو' : 'OR'}
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-[#1b1b1b] hover:bg-[#252525] border border-[#2c2c2c] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 flutter-tap transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isRtl ? 'المتابعة بواسطة Google' : 'Continue with Google'}</span>
        </button>
      </div>
    </div>
  );
};
