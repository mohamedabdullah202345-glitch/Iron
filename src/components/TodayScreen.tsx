import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { IronState } from '../types';
import {
  getEffectiveToday,
  getTasksForDay,
  getDoneOnDay,
  getDoneCountOnDay,
  getSecondsRemaining,
  isRestUsedThisWeek,
  computeIronStats,
  padZero
} from '../services/dateUtils';
import { getCurrentQuote, drawQuoteIndex, evaluateTodayStatus } from '../services/storage';
import { audioService } from '../services/audio';
import { EXAMPLES_MAP, TRANSLATIONS, RANKS } from '../constants/content';
import {
  Heart,
  RotateCw,
  Plus,
  Check,
  ChevronDown,
  Trash2,
  Moon,
  Shield,
  Download,
  Flame,
  Award
} from 'lucide-react';

interface TodayScreenProps {
  state: IronState;
  onUpdateState: (newState: IronState, message?: string, undoFn?: () => void) => void;
  onOpenAddModal: () => void;
  onExportBackup: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  state,
  onUpdateState,
  onOpenAddModal,
  onExportBackup
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    getSecondsRemaining(state.dayEnd)
  );

  const td = getEffectiveToday(state.dayEnd);
  const tasks = getTasksForDay(state, td);
  const doneIds = getDoneOnDay(state, td);
  const doneCount = getDoneCountOnDay(state, td);
  const isWon = !!state.won[td];
  const isRest = !!state.rest[td];
  const stats = computeIronStats(state);

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[state.lang === 'ar' ? 1 : 0] : k;
  };

  // Timer countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(getSecondsRemaining(state.dayEnd));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.dayEnd]);

  // Current quote
  const { quote, kind, index, key: quoteKey } = getCurrentQuote(state);
  const isFavorite = state.favs.includes(quoteKey);

  const toggleFavorite = () => {
    const nextFavs = isFavorite
      ? state.favs.filter((k) => k !== quoteKey)
      : [...state.favs, quoteKey];
    onUpdateState({ ...state, favs: nextFavs }, isFavorite ? t('unfav') : t('fav'));
  };

  const handleShuffleQuote = () => {
    const nextKind = kind;
    const { index: nextIdx, state: nextState } = drawQuoteIndex(state, nextKind);
    const updated: IronState = {
      ...nextState,
      qday: { d: td, k: nextKind, i: nextIdx }
    };
    onUpdateState(updated);
  };

  const toggleTask = (taskId: string) => {
    const prevState = { ...state };
    const currentDone = [...doneIds];
    const isCurrentlyDone = currentDone.includes(taskId);
    let nextDone: string[];

    if (isCurrentlyDone) {
      nextDone = currentDone.filter((id) => id !== taskId);
    } else {
      nextDone = [...currentDone, taskId];
      audioService.playCheckSound();
    }

    let nextState: IronState = {
      ...state,
      done: {
        ...state.done,
        [td]: nextDone
      }
    };

    const isNowAllDone = tasks.length > 0 && nextDone.length === tasks.length;
    nextState = evaluateTodayStatus(nextState);

    if (!isCurrentlyDone && isNowAllDone) {
      audioService.playWinFanfare();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d1d', '#ff5c5c', '#ffffff', '#22c55e']
      });
    }

    onUpdateState(
      nextState,
      isCurrentlyDone ? t('tun') : t('tdn'),
      () => onUpdateState(prevState)
    );
  };

  const handleDoneNext = () => {
    const nextPending = tasks.find((m) => !doneIds.includes(m.id));
    if (nextPending) {
      toggleTask(nextPending.id);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const prevState = { ...state };
    const updatedMissions = state.missions.map((m) => {
      if (m.id === taskId) {
        return { ...m, to: td };
      }
      return m;
    });

    let nextState: IronState = {
      ...state,
      missions: updatedMissions
    };
    if (nextState.snap[td]) {
      nextState.snap = {
        ...nextState.snap,
        [td]: nextState.snap[td].filter((x) => x.id !== taskId)
      };
    }
    nextState = evaluateTodayStatus(nextState);
    onUpdateState(nextState, t('tdel'), () => onUpdateState(prevState));
  };

  const handleToggleRest = () => {
    const prevState = { ...state };
    if (isRest) {
      const newRest = { ...state.rest };
      delete newRest[td];
      onUpdateState({ ...state, rest: newRest }, t('trestc'), () => onUpdateState(prevState));
    } else {
      if (isRestUsedThisWeek(state, td) || isWon) return;
      onUpdateState(
        { ...state, rest: { ...state.rest, [td]: 1 } },
        t('trest'),
        () => onUpdateState(prevState)
      );
    }
  };

  // Rank lookup
  let currentRankIndex = 0;
  RANKS.forEach((r, idx) => {
    if (stats.total >= r.threshold) currentRankIndex = idx;
  });
  const currentRank = RANKS[currentRankIndex];

  // Shield check
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${padZero(yesterday.getMonth() + 1)}-${padZero(yesterday.getDate())}`;
  const yesterdayShielded = stats.st[yesterdayStr] === 'shield';

  // Backup due check (7 days)
  const isBackupDue = Date.now() - (state.lastBackup || 0) > 7 * 86400000;

  const hours = Math.floor(secondsRemaining / 3600);
  const mins = Math.floor((secondsRemaining % 3600) / 60);
  const secs = secondsRemaining % 60;
  const dayProgressPct = Math.min(100, Math.max(0, ((86400 - secondsRemaining) / 86400) * 100));

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner: Streak & Rank Badge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            {state.name ? `${state.name} · ` : ''}
            {t('streak')}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-black text-8xl md:text-9xl text-[#e11d1d] tracking-tight leading-none animate-flame">
              {stats.streak}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
              DAYS
            </span>
          </div>
        </div>

        {/* Warrior Rank Badge */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#221010] to-[#141414] border border-[#e11d1d]/40 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-[#e11d1d] flex items-center justify-center text-white font-display font-extrabold text-xl shadow-md shadow-[#e11d1d]/40">
            {currentRank.roman}
          </div>
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[#ff5c5c] mt-1.5">
            {state.lang === 'ar' ? currentRank.nameAr : currentRank.nameEn}
          </span>
        </div>
      </div>

      {/* Goal Banner */}
      {state.goal && (
        <div className="bg-[#151515] border-l-4 border-[#e11d1d] rounded-r-lg px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            {t('mygoal')}
          </span>
          <span className="text-sm font-semibold text-white mt-0.5 block">
            {state.goal}
          </span>
        </div>
      )}

      {/* Stoic Quote Card */}
      <div className="relative overflow-hidden bg-[#151515] border border-[#2a2a2a] border-l-4 border-l-[#e11d1d] rounded-xl p-5 shadow-xl">
        {/* Shimmer sweep */}
        <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none animate-shimmer" />

        <div className="flex items-center justify-between text-xs text-neutral-400 uppercase tracking-widest font-mono">
          <span>{kind === 's' ? t('qhard') : t('qod')}</span>
          <span className="text-[#e11d1d] font-bold">STOIC</span>
        </div>

        <blockquote className="mt-3 font-serif italic text-lg md:text-xl text-neutral-100 leading-snug">
          “{quote[0]}”
        </blockquote>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[#ff5c5c]">
            — {quote[1]}
          </span>
        </div>

        {/* Action bar for quote */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#242424]">
          <button
            onClick={toggleFavorite}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all flutter-tap ${
              isFavorite
                ? 'bg-[#291010] border-[#e11d1d] text-[#ff5c5c]'
                : 'bg-[#1a1a1a] border-[#292929] text-neutral-300 hover:text-white'
            }`}
          >
            <Heart size={14} className={isFavorite ? 'fill-[#ff5c5c]' : ''} />
            <span>{t('fav')}</span>
          </button>
          <button
            onClick={handleShuffleQuote}
            className="py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#292929] text-neutral-300 hover:text-white flutter-tap transition-colors"
          >
            <RotateCw size={14} />
            <span>{t('newq')}</span>
          </button>
        </div>
      </div>

      {/* Shield Warning Notice if yesterday was saved by shield */}
      {yesterdayShielded && (
        <div className="bg-[#241313] border border-[#e11d1d]/60 rounded-xl p-4 flex items-center gap-3">
          <Shield size={22} className="text-[#ff5c5c] shrink-0" />
          <div className="text-xs text-neutral-200 leading-relaxed">
            {t('shw')}
          </div>
        </div>
      )}

      {/* Missions Checklist Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {t('tmis')} · {doneCount} {t('ofw')} {tasks.length}
          </div>
          <button
            onClick={onOpenAddModal}
            className="w-8 h-8 rounded-full bg-[#e11d1d] hover:bg-[#c91818] text-white flex items-center justify-center shadow-lg shadow-[#e11d1d]/40 flutter-tap"
            aria-label={t('addtask')}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[#202020] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#e11d1d] transition-all duration-300"
            style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>

        {isWon && (
          <p className="text-xs text-neutral-400 mb-2 italic">
            {t('lock')}
          </p>
        )}

        {/* Rest Day Card */}
        {isRest ? (
          <div className="bg-[#181818] border border-[#333333] rounded-xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] mx-auto flex items-center justify-center text-neutral-300">
              <Moon size={24} />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-wider">
              {t('restt')}
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              {t('restx')}
            </p>
            <button
              onClick={handleToggleRest}
              className="px-4 py-2 bg-transparent border border-[#333333] hover:border-[#555] text-xs font-semibold text-neutral-300 rounded-lg flutter-tap"
            >
              {t('restc')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {!tasks.length && (
              <div className="p-6 text-center border border-dashed border-[#282828] rounded-xl text-xs text-neutral-400">
                {t('notasks')}
              </div>
            )}

            {tasks.map((task, idx) => {
              const isChecked = doneIds.includes(task.id);
              const isExpanded = expandedId === task.id;
              const example = EXAMPLES_MAP[task.t];

              return (
                <div
                  key={task.id}
                  className={`bg-[#151515] border rounded-xl transition-all ${
                    isChecked
                      ? 'border-[#242424] opacity-75'
                      : 'border-[#2a2a2a] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-1 flex items-center gap-3 text-left flutter-tap"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-white border-white text-black'
                            : 'border-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#ff5c5c]">
                            {padZero(idx + 1)}
                          </span>
                          <span
                            className={`text-sm md:text-base font-semibold leading-tight ${
                              isChecked
                                ? 'line-through text-neutral-400'
                                : 'text-neutral-100'
                            }`}
                          >
                            {task.t}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : task.id)
                      }
                      className="w-8 h-8 rounded-md text-neutral-400 hover:text-white flex items-center justify-center flutter-tap"
                      aria-label="Toggle Details"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 border-t border-[#222222] text-xs space-y-2">
                      {example && (
                        <p className="text-neutral-400 italic">{example}</p>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 pt-1 flutter-tap"
                      >
                        <Trash2 size={13} />
                        <span>{t('del')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Victory card or Next button */}
            {isWon ? (
              <div className="bg-gradient-to-r from-[#17261a] to-[#141d16] border border-emerald-600/40 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                    {t('wonmsg')}
                  </div>
                  <div className="text-xs text-neutral-300">
                    {t('wonsub')}
                  </div>
                </div>
              </div>
            ) : tasks.length > 0 && doneCount < tasks.length ? (
              <button
                onClick={handleDoneNext}
                className="w-full py-4 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-xl font-display font-black text-xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#e11d1d]/30 flutter-tap transition-all"
              >
                <span>{t('next')}</span>
                <Check size={20} strokeWidth={3} />
              </button>
            ) : null}

            {/* Rest Day Button (if not already won) */}
            {!isWon && !isRest && (
              <div className="pt-1">
                {isRestUsedThisWeek(state, td) ? (
                  <div className="text-xs text-neutral-400 flex items-center justify-center gap-2 py-3 bg-[#151515] rounded-xl border border-[#242424]">
                    <Moon size={15} />
                    <span>{t('restu')}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleToggleRest}
                    className="w-full py-3 bg-[#171717] hover:bg-[#202020] border border-[#2a2a2a] rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 flutter-tap transition-colors"
                  >
                    <Moon size={15} />
                    <span>{t('restbtn')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 24h Countdown Timer Card */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-3">
          {isWon || isRest ? t('tdone') : t('tleft')}
        </span>

        <div className="flex items-center justify-center gap-2 font-mono">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 min-w-[70px]">
            <span className="font-display font-bold text-4xl text-[#ff5c5c] block leading-none">
              {padZero(hours)}
            </span>
            <span className="text-[10px] uppercase text-neutral-400 font-sans tracking-widest mt-1 block">
              {t('hrs')}
            </span>
          </div>
          <span className="text-2xl text-neutral-600 font-bold">:</span>
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 min-w-[70px]">
            <span className="font-display font-bold text-4xl text-[#ff5c5c] block leading-none">
              {padZero(mins)}
            </span>
            <span className="text-[10px] uppercase text-neutral-400 font-sans tracking-widest mt-1 block">
              {t('min')}
            </span>
          </div>
          <span className="text-2xl text-neutral-600 font-bold">:</span>
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 min-w-[70px]">
            <span className="font-display font-bold text-4xl text-[#ff5c5c] block leading-none">
              {padZero(secs)}
            </span>
            <span className="text-[10px] uppercase text-neutral-400 font-sans tracking-widest mt-1 block">
              {t('sec')}
            </span>
          </div>
        </div>

        {/* 24-hour cycle track */}
        <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#e11d1d] transition-all duration-500"
            style={{ width: `${dayProgressPct}%` }}
          />
        </div>
      </div>

      {/* Backup Reminder if >7 days */}
      {isBackupDue && (
        <div className="bg-[#241a10] border border-amber-600/40 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="text-xs text-amber-200 leading-snug">
            {t('bkwarn')}
          </div>
          <button
            onClick={onExportBackup}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-md flutter-tap shrink-0"
          >
            {t('bkgo')}
          </button>
        </div>
      )}
    </div>
  );
};
