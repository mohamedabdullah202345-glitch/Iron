import React, { useState, useRef } from 'react';
import { IronState } from '../types';
import {
  computeIronStats,
  getWeekStatsSummary,
  getEffectiveToday,
  addDays,
  getTasksForDay,
  getDoneCountOnDay
} from '../services/dateUtils';
import { RANKS, QUOTES_NORMAL, QUOTES_SOFT, TRANSLATIONS } from '../constants/content';
import {
  Shield,
  Award,
  Calendar,
  Heart,
  Save,
  Download,
  Upload,
  Settings,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  Trash2,
  ExternalLink,
  HardDrive,
  User,
  LogOut,
  Bell,
  Cloud
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { RemindersSettings } from './RemindersSettings';
import { SyncStatusBadge } from './SyncStatusBadge';
import { requestStoragePersistence } from '../services/storage';

interface MeScreenProps {
  state: IronState;
  currentUser?: any;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onUpdateState: (newState: IronState, message?: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenConfirm: (msg: string, onConfirm: () => void) => void;
  onResetAll: () => void;
}

export const MeScreen: React.FC<MeScreenProps> = ({
  state,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  onUpdateState,
  onExportBackup,
  onImportBackup,
  onOpenConfirm,
  onResetAll
}) => {
  const [nameInput, setNameInput] = useState(state.name || '');
  const [goalInput, setGoalInput] = useState(state.goal || '');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    wk: true,
    ht: true,
    bd: false,
    fav: false,
    bk: false,
    rem: true,
    set: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = computeIronStats(state);
  const weekSummary = getWeekStatsSummary(state);
  const td = getEffectiveToday(state.dayEnd);

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[state.lang === 'ar' ? 1 : 0] : k;
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Current rank
  let currentRankIdx = 0;
  RANKS.forEach((r, idx) => {
    if (stats.total >= r.threshold) currentRankIdx = idx;
  });
  const currentRank = RANKS[currentRankIdx];
  const nextRank = RANKS[currentRankIdx + 1];
  const rankProgressPct = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          ((stats.total - currentRank.threshold) /
            (nextRank.threshold - currentRank.threshold)) *
            100
        )
      )
    : 100;

  // Badges
  const badgesList = [
    { id: 'b1', name: t('b1'), num: '1', earned: stats.total >= 1 },
    { id: 'b2', name: t('b2'), num: '3', earned: stats.best >= 3 },
    { id: 'b3', name: t('b3'), num: '7', earned: stats.best >= 7 },
    { id: 'b4', name: t('b4'), num: '14', earned: stats.best >= 14 },
    { id: 'b5', name: t('b5'), num: '30', earned: stats.best >= 30 },
    { id: 'b6', name: t('b6'), num: '60', earned: stats.best >= 60 }
  ];

  // Favorite quotes list
  const favoriteQuotes = state.favs
    .map((key) => {
      const isSoft = key.startsWith('s');
      const idx = parseInt(key.slice(1), 10);
      const list = isSoft ? QUOTES_SOFT : QUOTES_NORMAL;
      const q = list[idx];
      return q ? { key, quote: q } : null;
    })
    .filter(Boolean) as Array<{ key: string; quote: [string, string] }>;

  const handleRemoveFavorite = (key: string) => {
    onUpdateState(
      {
        ...state,
        favs: state.favs.filter((k) => k !== key)
      },
      t('unfav')
    );
  };

  const handleSaveProfile = () => {
    onUpdateState(
      {
        ...state,
        name: nameInput.trim(),
        goal: goalInput.trim()
      },
      t('saved')
    );
  };

  const handleChangeDayEnd = (hour: number) => {
    onUpdateState(
      {
        ...state,
        dayEnd: hour
      },
      t('saved')
    );
  };

  const handleSetDayEndNow = () => {
    handleChangeDayEnd(new Date().getHours());
  };

  // Build 28-day Activity Heatmap
  const heatmapDays: Array<{ date: string; status: string; pct: number }> = [];
  let curD = addDays(td, -27);
  for (let i = 0; i < 28; i++) {
    const isBeforeStart = curD < state.start;
    const s = isBeforeStart ? 'none' : stats.st[curD] || 'none';
    let p = 0;
    if (s === 'now' || s === 'miss') {
      const dayTasks = getTasksForDay(state, curD);
      p = dayTasks.length ? getDoneCountOnDay(state, curD) / dayTasks.length : 0;
    }
    heatmapDays.push({ date: curD, status: s, pct: p });
    curD = addDays(curD, 1);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-3xl tracking-wider text-white uppercase">
          {t('me')}
        </h2>
      </div>

      {/* Main Warrior Rank Card */}
      <div className="bg-gradient-to-br from-[#290e0e] via-[#161616] to-[#121212] border border-[#e11d1d]/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#a30f0f] to-[#ff4d4d] flex items-center justify-center text-white font-display font-black text-3xl shadow-lg shadow-[#e11d1d]/50 shrink-0">
            {currentRank.roman}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              {t('yrank')}
            </span>
            <div className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-wider leading-none mt-0.5">
              {state.lang === 'ar' ? currentRank.nameAr : currentRank.nameEn}
            </div>

            {/* Rank progress bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 flex-1 bg-[#222222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e11d1d] transition-all duration-300"
                  style={{ width: `${rankProgressPct}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#ff5c5c]">
                {nextRank ? `${stats.total}/${nextRank.threshold}` : stats.total}
              </span>
            </div>

            <span className="text-[11px] text-neutral-400 mt-1 block">
              {nextRank
                ? t('daysto')
                    .replace('{n}', String(nextRank.threshold - stats.total))
                    .replace(
                      '{r}',
                      state.lang === 'ar' ? nextRank.nameAr : nextRank.nameEn
                    )
                : t('toprk')}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Rank Ladder */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {RANKS.map((rk, i) => {
          const isCurrent = i === currentRankIdx;
          const isUnlocked = i <= currentRankIdx;
          return (
            <div
              key={rk.roman}
              className={`flex-none w-20 p-2 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'border-[#e11d1d] bg-[#291010]'
                  : isUnlocked
                  ? 'border-[#333333] bg-[#161616]'
                  : 'border-[#222222] bg-[#101010] opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 mx-auto rounded flex items-center justify-center font-display font-bold text-xs ${
                  isUnlocked ? 'bg-[#e11d1d] text-white' : 'bg-[#333333] text-neutral-400'
                }`}
              >
                {rk.roman}
              </div>
              <div className="text-[10px] font-semibold text-neutral-300 mt-1.5 truncate">
                {state.lang === 'ar' ? rk.nameAr : rk.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Key Stats Box */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-[#ff5c5c] block leading-tight">
            {stats.streak}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('streak').split(' ')[0]}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-white block leading-tight">
            {stats.best}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('best')}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
          <span className="font-display font-black text-3xl text-[#ff5c5c] block leading-tight">
            {stats.total}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            {t('dwon')}
          </span>
        </div>
      </div>

      {/* Account & Cloud Sync Banner */}
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#221010] text-[#ff5c5c] flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                {currentUser
                  ? state.lang === 'ar'
                    ? 'الحساب والمزامنة السحابية'
                    : 'Cloud Account'
                  : state.lang === 'ar'
                  ? 'حساب IRON'
                  : 'IRON Account'}
              </span>
              <SyncStatusBadge lang={state.lang} />
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              {currentUser
                ? currentUser.email || (state.lang === 'ar' ? 'متصل عبر Google' : 'Connected via Google')
                : state.lang === 'ar'
                ? 'سجّل دخولك لمزامنة تقدمك تلقائيًا عبر كل أجهزتك'
                : 'Sign in to auto-sync your progress across all devices'}
            </p>
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-neutral-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flutter-tap shrink-0"
            title={state.lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{state.lang === 'ar' ? 'خروج' : 'Sign Out'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 flutter-tap shadow-md shadow-[#e11d1d]/30 shrink-0"
          >
            <User size={13} />
            <span>{state.lang === 'ar' ? 'دخول' : 'Sign In'}</span>
          </button>
        )}
      </div>

      {/* PWA In-App Install Card */}
      <PWAInstallButton lang={state.lang} variant="card" />

      {/* Accordion 1: Weekly Review */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('wk')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('wrev')}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.wk ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.wk && (
          <div className="p-4 pt-0 border-t border-[#202020] space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-[#222222]">
              <span className="text-neutral-400">{t('wwon')}</span>
              <span className="font-bold text-[#ff5c5c]">
                {weekSummary.wonCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#222222]">
              <span className="text-neutral-400">{t('wbest')}</span>
              <span className="font-semibold text-white truncate max-w-[180px]">
                {weekSummary.bestTask || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">{t('wskip')}</span>
              <span className="font-semibold text-neutral-300 truncate max-w-[180px]">
                {weekSummary.skippedTask || '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: 28-day Heatmap */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('ht')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('heat')}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.ht ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.ht && (
          <div className="p-4 pt-0 border-t border-[#202020] space-y-3">
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {heatmapDays.map((d, i) => {
                let bgClass = 'bg-[#1a1a1a] border-[#222]';
                let style = {};

                if (d.status === 'won') {
                  bgClass = 'bg-[#e11d1d] border-[#e11d1d] shadow-sm shadow-[#e11d1d]/40';
                } else if (d.status === 'shield') {
                  bgClass = 'bg-transparent border-[#ff5c5c] border-2';
                } else if (d.status === 'rest') {
                  bgClass = 'bg-[#444444] border-[#444444]';
                } else if (d.pct > 0) {
                  style = { backgroundColor: `rgba(225, 29, 29, ${0.2 + d.pct * 0.6})` };
                }

                const isToday = d.date === td;

                return (
                  <div
                    key={d.date}
                    style={style}
                    title={`${d.date} (${d.status})`}
                    className={`aspect-square rounded-md border flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-105 ${bgClass} ${
                      isToday ? 'ring-2 ring-white/60' : ''
                    }`}
                  />
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap gap-4 text-[11px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded bg-[#e11d1d] inline-block" />
                {t('lwon')}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded border border-[#ff5c5c] bg-transparent inline-block" />
                {t('lshield')}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded bg-[#444444] inline-block" />
                {t('lrest')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Badges */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('bd')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('badges')}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.bd ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.bd && (
          <div className="p-4 pt-0 border-t border-[#202020]">
            <div className="grid grid-cols-3 gap-2 pt-2">
              {badgesList.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    badge.earned
                      ? 'border-[#e11d1d] bg-[#1e1111]'
                      : 'border-[#222222] bg-[#121212] opacity-35 grayscale'
                  }`}
                >
                  <span className="font-display font-black text-3xl text-[#ff5c5c] block leading-none">
                    {badge.num}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-300 mt-1 block">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: Favorite Quotes */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('fav')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('favs')} ({favoriteQuotes.length})
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.fav ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.fav && (
          <div className="p-4 pt-0 border-t border-[#202020] space-y-2">
            {!favoriteQuotes.length ? (
              <p className="text-xs text-neutral-400 py-2 italic">{t('nofav')}</p>
            ) : (
              favoriteQuotes.map((item) => (
                <div
                  key={item.key}
                  className="p-3 bg-[#171717] rounded-lg border border-[#262626] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <p className="font-serif italic text-white leading-relaxed">
                      “{item.quote[0]}”
                    </p>
                    <span className="font-display font-bold text-[#ff5c5c] uppercase tracking-wider mt-1 block">
                      — {item.quote[1]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(item.key)}
                    className="text-rose-400 hover:text-rose-300 p-1 flutter-tap shrink-0"
                    aria-label={t('unfav')}
                  >
                    <Heart size={14} className="fill-rose-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Accordion 5: Backup & Storage */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('bk')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('backup')}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.bk ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.bk && (
          <div className="p-4 pt-0 border-t border-[#202020] space-y-3">
            <p className="text-xs text-neutral-400 pt-1">
              {t(state.persisted ? 'pers1' : 'pers2')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportBackup}
                className="py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 flutter-tap"
              >
                <Download size={14} />
                <span>{t('exp')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 flutter-tap"
              >
                <Upload size={14} />
                <span>{t('imp')}</span>
              </button>
            </div>

            {!state.persisted && (
              <button
                onClick={async () => {
                  const success = await requestStoragePersistence();
                  if (success) {
                    onUpdateState({ ...state, persisted: 1 }, t('saved'));
                  }
                }}
                className="w-full py-2 bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 flutter-tap"
              >
                <HardDrive size={13} />
                <span>
                  {state.lang === 'ar'
                    ? 'حماية بيانات التطبيق من الحذف'
                    : 'Protect Storage from Browser Eviction'}
                </span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImportBackup(file);
                  e.target.value = '';
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Accordion: Reminders */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('rem')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Bell size={14} className="text-[#ff5c5c]" />
            <span>{state.lang === 'ar' ? 'التذكيرات والإشعارات' : 'Reminders & Notifications'}</span>
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.rem ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.rem && (
          <div className="p-4 pt-0 border-t border-[#202020] pt-2">
            <RemindersSettings
              reminders={
                state.reminders || {
                  morningEnabled: true,
                  morningTime: '06:00',
                  eveningEnabled: true,
                  eveningTime: '20:00',
                  warningEnabled: true,
                  timezone:
                    typeof Intl !== 'undefined'
                      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
                      : 'UTC'
                }
              }
              dayEndHour={state.dayEnd}
              lang={state.lang}
              userId={currentUser?.id}
              onUpdateReminders={(updated) => {
                onUpdateState(
                  { ...state, reminders: updated },
                  state.lang === 'ar' ? 'تم حفظ التذكيرات' : 'Reminders saved'
                );
              }}
              onShowMessage={(msg) => onUpdateState(state, msg)}
            />
          </div>
        )}
      </div>

      {/* Accordion 6: Settings */}
      <div className="border border-[#262626] rounded-xl bg-[#141414] overflow-hidden">
        <button
          onClick={() => toggleSection('set')}
          className="w-full p-4 flex items-center justify-between text-left flutter-tap"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {t('settings')}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${
              openSections.set ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.set && (
          <div className="p-4 pt-0 border-t border-[#202020] space-y-4 pt-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1 block">
                {t('name')}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={30}
                className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1 block">
                {t('mygoal')}
              </label>
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                maxLength={80}
                className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 bg-[#222222] hover:bg-[#2d2d2d] border border-[#333333] text-white rounded-lg text-xs font-bold uppercase tracking-wider flutter-tap"
            >
              {t('save')}
            </button>

            {/* Custom Day Start Hour */}
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1 block">
                {t('daystart')}
              </label>
              <select
                value={state.dayEnd}
                onChange={(e) => handleChangeDayEnd(parseInt(e.target.value, 10))}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white outline-none mb-2"
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const ampm = h < 12 ? (state.lang === 'ar' ? 'ص' : 'AM') : state.lang === 'ar' ? 'م' : 'PM';
                  const label = `${h % 12 || 12}:00 ${ampm}`;
                  return (
                    <option key={h} value={h}>
                      {label}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleSetDayEndNow}
                className="w-full py-2 bg-[#1b1b1b] border border-[#2e2e2e] rounded-lg text-xs font-semibold text-neutral-300 hover:text-white flutter-tap"
              >
                {t('dnow')} ({new Date().getHours()}:00)
              </button>
              <p className="text-[11px] text-neutral-400 mt-1">{t('daystarth')}</p>
            </div>

            {/* Language Switch */}
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1.5 block">
                {t('lang')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateState({ ...state, lang: 'en' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    state.lang === 'en'
                      ? 'border-[#e11d1d] bg-[#291010] text-[#ff5c5c]'
                      : 'border-[#262626] bg-[#181818] text-neutral-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateState({ ...state, lang: 'ar' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    state.lang === 'ar'
                      ? 'border-[#e11d1d] bg-[#291010] text-[#ff5c5c]'
                      : 'border-[#262626] bg-[#181818] text-neutral-400 hover:text-white'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            {/* Reset All Data Button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenConfirm(t('resetq'), onResetAll)}
                className="w-full py-3 bg-transparent border border-rose-900/60 hover:bg-rose-950/20 text-rose-400 rounded-lg text-xs font-bold uppercase tracking-wider flutter-tap"
              >
                {t('reset')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Ask us on WhatsApp & Powered by VOREX */}
      <footer className="pt-4 border-t border-[#202020] text-center space-y-4">
        <div className="bg-gradient-to-r from-[#0d2a18] to-[#141414] border border-[#25d366] rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-neutral-200 mb-3">
            {t('askd')}
          </p>
          <a
            href="https://wa.me/201507737118"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25d366] hover:bg-[#20b858] text-[#04230f] rounded-lg font-display font-extrabold text-base tracking-wider uppercase flutter-tap shadow-lg shadow-[#25d366]/20"
          >
            <span>{t('askus')}</span>
            <ExternalLink size={16} />
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-neutral-400 font-mono">
          <span>{t('powered')}</span>
          <span className="font-display font-black text-sm text-white tracking-widest">
            VOREX
          </span>
        </div>
      </footer>
    </div>
  );
};
