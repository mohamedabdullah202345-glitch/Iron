import React, { useState } from 'react';
import { IronState } from '../types';
import { MISSION_LIBRARY, TRANSLATIONS } from '../constants/content';
import { getEffectiveToday } from '../services/dateUtils';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingWizardProps {
  initialState: IronState;
  onComplete: (updated: IronState) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialState,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<'en' | 'ar'>(initialState.lang || 'en');
  const [name, setName] = useState<string>(initialState.name || '');
  const [goal, setGoal] = useState<string>(initialState.goal || '');
  const [dayEnd, setDayEnd] = useState<number>(initialState.dayEnd ?? 0);
  const [pickedMissions, setPickedMissions] = useState<string[]>([
    'Wake up early',
    'Train your body',
    'Learn for 1.5 hours'
  ]);

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[lang === 'ar' ? 1 : 0] : k;
  };

  const handleToggleMission = (text: string) => {
    if (pickedMissions.includes(text)) {
      setPickedMissions(pickedMissions.filter((m) => m !== text));
    } else if (pickedMissions.length < 5) {
      setPickedMissions([...pickedMissions, text]);
    }
  };

  const handleFinish = () => {
    if (pickedMissions.length < 3) return;
    const todayStr = getEffectiveToday(dayEnd);
    const newMissions = pickedMissions.map((title, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      t: title,
      days: [0, 1, 2, 3, 4, 5, 6],
      from: todayStr,
      to: ''
    }));

    const updated: IronState = {
      ...initialState,
      setup: 1,
      name: name.trim(),
      goal: goal.trim(),
      lang,
      dayEnd,
      start: todayStr,
      missions: newMissions
    };

    onComplete(updated);
  };

  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0a0a0a] text-[#f2f2f2] flex flex-col justify-center px-4 py-8 max-w-md mx-auto"
    >
      <div className="w-full bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle crimson glow header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#e11d1d] via-[#ff5c5c] to-[#e11d1d]" />

        {/* Brand */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <div className="font-display font-extrabold text-3xl tracking-widest text-[#e11d1d]">
            IRON
          </div>
          <div className="text-xs font-mono text-neutral-400">
            STEP {step} OF 4
          </div>
        </div>

        {/* Step progress pills */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#e11d1d]' : 'bg-[#262626]'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Language & Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block">
                {t('lang')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all flutter-tap ${
                    lang === 'en'
                      ? 'border-[#e11d1d] bg-[#221010] text-[#ff5c5c]'
                      : 'border-[#262626] bg-[#1a1a1a] text-neutral-300'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all flutter-tap ${
                    lang === 'ar'
                      ? 'border-[#e11d1d] bg-[#221010] text-[#ff5c5c]'
                      : 'border-[#262626] bg-[#1a1a1a] text-neutral-300'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block">
                {t('su1')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('nameph')}
                maxLength={30}
                className="w-full bg-[#1b1b1b] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-lg px-4 py-3 text-base text-white placeholder-neutral-500 outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 bg-[#e11d1d] hover:bg-[#c91818] text-white py-3.5 rounded-lg font-display font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-colors"
            >
              <span>{t('cont')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Main Goal */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-wider">
                {t('su2')}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Your north star. What are you building yourself for?
              </p>
            </div>

            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t('goalph')}
              maxLength={80}
              autoFocus
              className="w-full bg-[#1b1b1b] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-lg px-4 py-3 text-base text-white placeholder-neutral-500 outline-none transition-colors"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#2a2a2a] text-neutral-300 py-3.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1 flutter-tap"
              >
                <ArrowLeft size={16} />
                <span>{t('back')}</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#e11d1d] hover:bg-[#c91818] text-white py-3.5 rounded-lg font-display font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-colors"
              >
                <span>{t('cont')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Day Start Hour */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-wider">
                {t('su4')}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">{t('su4h')}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[0, 5, 6, 8].map((h) => {
                const label =
                  h === 0
                    ? '12:00 AM (Midnight)'
                    : h < 12
                    ? `${h}:00 AM`
                    : `${h - 12}:00 PM`;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDayEnd(h)}
                    className={`py-3 px-3 rounded-lg text-xs font-semibold border text-center transition-all flutter-tap ${
                      dayEnd === h
                        ? 'border-[#e11d1d] bg-[#221010] text-[#ff5c5c]'
                        : 'border-[#262626] bg-[#1a1a1a] text-neutral-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setDayEnd(new Date().getHours())}
              className="w-full py-2.5 bg-[#1f1f1f] border border-[#2e2e2e] rounded-lg text-xs font-semibold text-neutral-300 hover:text-white flutter-tap"
            >
              {t('dnow')} ({new Date().getHours()}:00)
            </button>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#2a2a2a] text-neutral-300 py-3.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1 flutter-tap"
              >
                <ArrowLeft size={16} />
                <span>{t('back')}</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-[#e11d1d] hover:bg-[#c91818] text-white py-3.5 rounded-lg font-display font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-colors"
              >
                <span>{t('cont')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Pick 3 to 5 Missions */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-wider">
                {t('su3')}
              </h2>
              <div className="text-xs font-mono text-[#ff5c5c] mt-1 font-bold">
                {t('picked').replace('{n}', String(pickedMissions.length))}
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {MISSION_LIBRARY.map(([cat, tasks]) => (
                <div key={cat} className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#ff5c5c] px-1 pt-2">
                    {cat}
                  </div>
                  {tasks.map(([title, subtitle]) => {
                    const isSelected = pickedMissions.includes(title);
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => handleToggleMission(title)}
                        className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-colors flutter-tap ${
                          isSelected
                            ? 'bg-[#221010] border-[#e11d1d]'
                            : 'bg-[#181818] border-[#262626] hover:border-[#383838]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#e11d1d] border-[#e11d1d] text-white'
                              : 'border-[#444444]'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white leading-tight">
                            {title}
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                            {subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#2a2a2a] text-neutral-300 py-3.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1 flutter-tap"
              >
                <ArrowLeft size={16} />
                <span>{t('back')}</span>
              </button>
              <button
                disabled={pickedMissions.length < 3}
                onClick={handleFinish}
                className={`flex-1 py-3.5 rounded-lg font-display font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-all ${
                  pickedMissions.length >= 3
                    ? 'bg-[#e11d1d] hover:bg-[#c91818] text-white shadow-lg shadow-[#e11d1d]/30'
                    : 'bg-[#262626] text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>{t('start')}</span>
                <Check size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
