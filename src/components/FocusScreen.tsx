import React, { useState, useEffect } from 'react';
import { IronState } from '../types';
import { getEffectiveToday, getWeekStart, addDays, padZero } from '../services/dateUtils';
import { audioService } from '../services/audio';
import { TRANSLATIONS } from '../constants/content';
import { Play, Square, Timer as TimerIcon, Zap } from 'lucide-react';

interface FocusScreenProps {
  state: IronState;
  onUpdateState: (newState: IronState, message?: string) => void;
  onOpenConfirm: (msg: string, onConfirm: () => void) => void;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({
  state,
  onUpdateState,
  onOpenConfirm
}) => {
  const [nowTime, setNowTime] = useState<number>(Date.now());

  const td = getEffectiveToday(state.dayEnd);
  const isRunning = !!(state.frun && state.frun.end > nowTime);
  const selectedMinutes = state.fmin || 25;

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[state.lang === 'ar' ? 1 : 0] : k;
  };

  // Heartbeat for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Completion check
  useEffect(() => {
    if (state.frun && nowTime >= state.frun.end) {
      const minutesCompleted = state.frun.min;
      audioService.playTimerChime();

      const nextTodayMinutes = (state.focus[td] || 0) + minutesCompleted;
      const nextTodaySessions = (state.fses[td] || 0) + 1;

      onUpdateState(
        {
          ...state,
          frun: null,
          focus: {
            ...state.focus,
            [td]: nextTodayMinutes
          },
          fses: {
            ...state.fses,
            [td]: nextTodaySessions
          }
        },
        t('fdone')
      );
    }
  }, [nowTime, state, td]);

  const handleStartFocus = () => {
    const end = Date.now() + selectedMinutes * 60 * 1000;
    onUpdateState({
      ...state,
      frun: {
        end,
        min: selectedMinutes
      }
    });
  };

  const handleStopFocus = () => {
    onOpenConfirm(t('fstopq'), () => {
      onUpdateState({
        ...state,
        frun: null
      });
    });
  };

  const handleSelectMinutes = (m: number) => {
    onUpdateState({
      ...state,
      fmin: m
    });
  };

  // Calculate remaining seconds
  const totalSeconds = isRunning
    ? Math.max(0, Math.ceil((state.frun!.end - nowTime) / 1000))
    : selectedMinutes * 60;

  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;
  const progressPct = isRunning
    ? Math.min(100, Math.max(0, 100 - (totalSeconds / (state.frun!.min * 60)) * 100))
    : 0;

  // Week focus minutes sum
  const weekStart = getWeekStart(td);
  let weekMinutesTotal = 0;
  let d = weekStart;
  while (d <= td) {
    weekMinutesTotal += state.focus[d] || 0;
    d = addDays(d, 1);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl tracking-wider text-white uppercase">
          {t('focus')}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">{t('fsub')}</p>
      </div>

      {/* Main Focus Clock Box */}
      <div className="bg-gradient-to-b from-[#181818] to-[#101010] border border-[#2a2a2a] rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 flex items-center justify-center gap-2">
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-[#e11d1d] animate-ping" />
          )}
          <span>{isRunning ? t('frun') : t('fidle')}</span>
        </div>

        {/* Digital display */}
        <div className="flex items-center justify-center gap-3 font-mono my-2">
          <div className="min-w-[90px]">
            <span className="font-display font-black text-7xl md:text-8xl text-white block leading-none">
              {padZero(displayMinutes)}
            </span>
            <span className="text-[10px] uppercase text-neutral-400 font-sans tracking-widest mt-1 block">
              {t('min')}
            </span>
          </div>

          <span className="text-4xl text-[#e11d1d] font-bold pb-4">:</span>

          <div className="min-w-[90px]">
            <span className="font-display font-black text-7xl md:text-8xl text-white block leading-none">
              {padZero(displaySeconds)}
            </span>
            <span className="text-[10px] uppercase text-neutral-400 font-sans tracking-widest mt-1 block">
              {t('sec')}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-[#e11d1d] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Action Controls */}
      {isRunning ? (
        <button
          onClick={handleStopFocus}
          className="w-full py-3.5 bg-transparent border border-rose-800/60 hover:bg-rose-950/20 text-rose-400 rounded-xl font-display font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 flutter-tap transition-colors"
        >
          <Square size={16} />
          <span>{t('fstop')}</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Duration segments */}
          <div className="grid grid-cols-4 gap-2">
            {[15, 25, 45, 60].map((mins) => {
              const isSelected = selectedMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectMinutes(mins)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all flutter-tap ${
                    isSelected
                      ? 'bg-[#221010] border-[#e11d1d] text-[#ff5c5c]'
                      : 'bg-[#151515] border-[#262626] text-neutral-300 hover:text-white'
                  }`}
                >
                  {mins} {t('min2')}
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <button
            onClick={handleStartFocus}
            className="w-full py-4 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-xl font-display font-black text-xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#e11d1d]/30 flutter-tap transition-all"
          >
            <Play size={20} className="fill-white" />
            <span>{t('fstart')}</span>
          </button>
        </div>
      )}

      {/* Focus Stats Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-[#ff5c5c] block leading-tight">
            {state.focus[td] || 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('fmtoday')}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-white block leading-tight">
            {state.fses[td] || 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('fsess')}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-[#ff5c5c] block leading-tight">
            {weekMinutesTotal}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('fweek')}
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-400 text-center italic">
        {t('ftip')}
      </p>
    </div>
  );
};
