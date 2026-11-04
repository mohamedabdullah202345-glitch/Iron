import React, { useState } from 'react';
import { IronState, Mission } from '../types';
import {
  MISSION_PACKS,
  MISSION_LIBRARY,
  EXAMPLES_MAP,
  DAYS_NAMES,
  TRANSLATIONS
} from '../constants/content';
import { getEffectiveToday, addDays } from '../services/dateUtils';
import { Plus, Trash2, ChevronDown, Check, Sparkles } from 'lucide-react';

interface MissionsScreenProps {
  state: IronState;
  onUpdateState: (newState: IronState, message?: string, undoFn?: () => void) => void;
  onOpenConfirm: (msg: string, onConfirm: () => void) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  state,
  onUpdateState,
  onOpenConfirm
}) => {
  const [customText, setCustomText] = useState('');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number | null>(null);

  const td = getEffectiveToday(state.dayEnd);
  const activeMissions = state.missions.filter((m) => !m.to || m.to > td);

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[state.lang === 'ar' ? 1 : 0] : k;
  };

  const dn = (idx: number) => {
    return DAYS_NAMES[idx][state.lang === 'ar' ? 1 : 0];
  };

  const handleAddMission = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (activeMissions.some((m) => m.t.toLowerCase() === trimmed.toLowerCase())) return;

    const prevState = { ...state };
    const startsTomorrow = !!state.won[td];
    const fromDate = startsTomorrow ? addDays(td, 1) : td;

    const newMission: Mission = {
      id: `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      t: trimmed,
      days: [0, 1, 2, 3, 4, 5, 6],
      from: fromDate,
      to: ''
    };

    onUpdateState(
      {
        ...state,
        missions: [...state.missions, newMission]
      },
      startsTomorrow ? t('tadd2') : t('tadd'),
      () => onUpdateState(prevState)
    );
    setCustomText('');
  };

  const handleDeleteMission = (id: string) => {
    const prevState = { ...state };
    const updated = state.missions.map((m) => {
      if (m.id === id) {
        return { ...m, to: td };
      }
      return m;
    });

    onUpdateState(
      {
        ...state,
        missions: updated
      },
      t('tdel'),
      () => onUpdateState(prevState)
    );
  };

  const handleToggleDay = (missionId: string, dayIndex: number) => {
    const updated = state.missions.map((m) => {
      if (m.id !== missionId) return m;
      let newDays = [...m.days];
      if (newDays.includes(dayIndex)) {
        if (newDays.length > 1) {
          newDays = newDays.filter((d) => d !== dayIndex);
        }
      } else {
        newDays.push(dayIndex);
      }
      return { ...m, days: newDays };
    });

    onUpdateState({ ...state, missions: updated });
  };

  const handleApplyPack = (packIndex: number) => {
    const [packName, packTasks] = MISSION_PACKS[packIndex];
    onOpenConfirm(
      `Apply ${packName.toUpperCase()} pack? This replaces your current active tasks.`,
      () => {
        const prevState = { ...state };
        const startsTomorrow = !!state.won[td];
        const effectiveDate = startsTomorrow ? addDays(td, 1) : td;

        const closedExisting = state.missions.map((m) => {
          if (!m.to) {
            return { ...m, to: effectiveDate };
          }
          return m;
        });

        const newMissions: Mission[] = packTasks.map((title, i) => ({
          id: `m_${Date.now()}_${i}`,
          t: title,
          days: [0, 1, 2, 3, 4, 5, 6],
          from: effectiveDate,
          to: ''
        }));

        onUpdateState(
          {
            ...state,
            missions: [...closedExisting, ...newMissions]
          },
          t('tpack'),
          () => onUpdateState(prevState)
        );
      }
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-3xl tracking-wider text-white uppercase">
          {t('missions')}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">{t('msub')}</p>
      </div>

      {/* Active Missions List */}
      <div className="space-y-2">
        {!activeMissions.length && (
          <div className="p-6 text-center border border-dashed border-[#282828] rounded-xl text-xs text-neutral-400">
            {t('mnone')}
          </div>
        )}

        {activeMissions.map((mission) => {
          const isExpanded = expandedMissionId === mission.id;
          const isTomorrow = mission.from && mission.from > td;
          const example = EXAMPLES_MAP[mission.t];
          const isEveryDay = mission.days.length === 7;
          const daysText = isEveryDay
            ? t('every')
            : mission.days
                .slice()
                .sort()
                .map(dn)
                .join(' · ');

          return (
            <div
              key={mission.id}
              className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden"
            >
              <div
                onClick={() =>
                  setExpandedMissionId(isExpanded ? null : mission.id)
                }
                className="p-3.5 flex items-center justify-between cursor-pointer flutter-tap"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm md:text-base text-white">
                      {mission.t}
                    </span>
                    {isTomorrow && (
                      <span className="text-[10px] font-mono font-bold bg-[#e11d1d]/20 text-[#ff5c5c] px-1.5 py-0.5 rounded border border-[#e11d1d]/30">
                        {t('tmrw')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {daysText}
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#222222] bg-[#121212] space-y-3">
                  {example && (
                    <p className="text-xs text-neutral-400 italic">{example}</p>
                  )}

                  {/* Days Selector Chips */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                      {t('daysl')}
                    </span>
                    <div className="grid grid-cols-7 gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                        const isDayActive = mission.days.includes(dayIdx);
                        return (
                          <button
                            key={dayIdx}
                            type="button"
                            onClick={() =>
                              handleToggleDay(mission.id, dayIdx)
                            }
                            className={`py-2 text-[11px] font-bold rounded-md border text-center transition-colors flutter-tap ${
                              isDayActive
                                ? 'bg-[#261010] border-[#e11d1d] text-[#ff5c5c]'
                                : 'bg-[#181818] border-[#292929] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {dn(dayIdx)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMission(mission.id)}
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
      </div>

      {/* Add Custom Mission Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddMission(customText);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={t('ownph')}
          maxLength={60}
          className="flex-1 bg-[#151515] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-5 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-xl flex items-center justify-center font-bold flutter-tap"
          aria-label={t('addtask')}
        >
          <Plus size={20} />
        </button>
      </form>

      {/* Preset Packs Section */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
          {t('packs')}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MISSION_PACKS.map(([packName, tasks], i) => (
            <button
              key={packName}
              onClick={() => handleApplyPack(i)}
              className="p-3 bg-[#161616] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl text-center flutter-tap transition-colors"
            >
              <div className="font-display font-extrabold text-sm md:text-base text-white uppercase tracking-wider">
                {packName}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                {tasks.length} {t('nmis')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pick from Library Categories */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
          {t('pick')}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {MISSION_LIBRARY.map(([catName, tasks], i) => {
            const isExpanded = selectedCategoryIdx === i;
            const addedCount = tasks.filter(([title]) =>
              activeMissions.some((m) => m.t === title)
            ).length;

            return (
              <button
                key={catName}
                onClick={() =>
                  setSelectedCategoryIdx(isExpanded ? null : i)
                }
                className={`p-3.5 rounded-xl border text-left flutter-tap transition-colors ${
                  isExpanded
                    ? 'bg-[#221010] border-[#e11d1d]'
                    : 'bg-[#151515] border-[#262626] hover:border-[#383838]'
                }`}
              >
                <div
                  className={`font-display font-black text-lg uppercase tracking-wider leading-none ${
                    isExpanded ? 'text-[#ff5c5c]' : 'text-white'
                  }`}
                >
                  {catName}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                  {tasks.length} {t('nmis')}
                  {addedCount > 0 && ` · ${addedCount} ${t('added')}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected category task list */}
        {selectedCategoryIdx !== null && (
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
            {MISSION_LIBRARY[selectedCategoryIdx][1].map(([title, example]) => {
              const alreadyAdded = activeMissions.some((m) => m.t === title);
              return (
                <div
                  key={title}
                  className="p-2.5 bg-[#171717] rounded-lg border border-[#242424] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white leading-tight">
                      {title}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                      {example}
                    </div>
                  </div>

                  <button
                    disabled={alreadyAdded}
                    onClick={() => handleAddMission(title)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      alreadyAdded
                        ? 'bg-neutral-800 text-neutral-500 cursor-default'
                        : 'bg-[#e11d1d] hover:bg-[#c91818] text-white flutter-tap'
                    }`}
                  >
                    {alreadyAdded ? <Check size={14} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
