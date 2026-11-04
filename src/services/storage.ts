import { IronState, Mission } from '../types';
import { DEFAULT_MISSIONS, QUOTES_NORMAL, QUOTES_SOFT } from '../constants/content';
import { getEffectiveToday, getTasksForDay, getDoneCountOnDay } from './dateUtils';

const STORAGE_KEY = 'iron_v2';
const LEGACY_STORAGE_KEY = 'iron_v1';

export function createDefaultState(): IronState {
  const today = getEffectiveToday(0);
  return {
    v: 2,
    setup: 0,
    name: '',
    goal: '',
    lang: 'en',
    dayEnd: 0,
    start: today,
    missions: DEFAULT_MISSIONS.map((t, i) => ({
      id: `m_${Date.now()}_${i}`,
      t,
      days: [0, 1, 2, 3, 4, 5, 6],
      from: today,
      to: ''
    })),
    done: {},
    won: {},
    rest: {},
    snap: {},
    notes: {},
    fix: {},
    focus: {},
    fses: {},
    frun: null,
    fmin: 25,
    favs: [],
    bagN: [],
    bagS: [],
    qday: null,
    hard: {},
    lastBackup: 0,
    persisted: 0,
    reminders: {
      morningEnabled: true,
      morningTime: '06:00',
      eveningEnabled: true,
      eveningTime: '20:00',
      warningEnabled: true,
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC'
    },
    cloudMigrated: false
  };
}

export function normalizeState(raw: any): IronState {
  const d = createDefaultState();
  if (!raw || typeof raw !== 'object') return d;

  const legacy = raw.v === undefined && Array.isArray(raw.missions);
  const out: any = { ...d, ...raw };

  ['done', 'won', 'rest', 'snap', 'notes', 'fix', 'hard', 'focus', 'fses'].forEach((key) => {
    if (typeof out[key] !== 'object' || Array.isArray(out[key]) || out[key] === null) {
      out[key] = {};
    }
  });

  ['favs', 'bagN', 'bagS'].forEach((key) => {
    if (!Array.isArray(out[key])) {
      out[key] = [];
    }
  });

  out.v = 2;
  if (legacy) {
    out.setup = 1;
  }

  if (!out.frun || typeof out.frun !== 'object' || !(out.frun.end > 0) || !(out.frun.min > 0)) {
    out.frun = null;
  }

  out.fmin = [15, 25, 45, 60].includes(Number(out.fmin)) ? Number(out.fmin) : 25;
  const de0 = parseInt(String(out.dayEnd), 10);
  out.dayEnd = de0 >= 0 && de0 <= 23 ? de0 : 0;
  out.lang = out.lang === 'ar' ? 'ar' : 'en';

  out.missions = (Array.isArray(out.missions) ? out.missions : [])
    .filter((m: any) => m && m.id && m.t)
    .map((m: any) => {
      const dy = Array.isArray(m.days) ? m.days.filter((x: any) => typeof x === 'number' && x >= 0 && x <= 6) : [];
      return {
        id: String(m.id),
        t: String(m.t),
        days: dy.length ? dy : [0, 1, 2, 3, 4, 5, 6],
        from: m.from || '',
        to: m.to || ''
      };
    });

  if (!out.start) {
    const dates = [
      ...Object.keys(out.won),
      ...Object.keys(out.done),
      ...Object.keys(out.notes)
    ].sort();
    out.start = dates[0] || getEffectiveToday(out.dayEnd);
  }

  if (!out.reminders || typeof out.reminders !== 'object') {
    out.reminders = {
      morningEnabled: true,
      morningTime: '06:00',
      eveningEnabled: true,
      eveningTime: '20:00',
      warningEnabled: true,
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC'
    };
  } else {
    out.reminders = {
      morningEnabled: out.reminders.morningEnabled ?? true,
      morningTime: out.reminders.morningTime || '06:00',
      eveningEnabled: out.reminders.eveningEnabled ?? true,
      eveningTime: out.reminders.eveningTime || '20:00',
      warningEnabled: out.reminders.warningEnabled ?? true,
      timezone: out.reminders.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC')
    };
  }

  return out as IronState;
}

/**
 * Safely merges remote cloud state and local state.
 * Never loses completed missions or won days (union of "done" and "won" per date).
 * Union of rest and favs.
 * For missions: merges by ID.
 * Newest write wins for scalars.
 */
export function mergeIronStates(local: IronState, remote: IronState): IronState {
  const mergedWon: Record<string, number> = { ...remote.won, ...local.won };
  const mergedRest: Record<string, number> = { ...remote.rest, ...local.rest };

  // Union of done mission IDs per date
  const mergedDone: Record<string, string[]> = { ...remote.done };
  Object.keys(local.done || {}).forEach((dateKey) => {
    const localIds = local.done[dateKey] || [];
    const remoteIds = mergedDone[dateKey] || [];
    const set = new Set([...remoteIds, ...localIds]);
    mergedDone[dateKey] = Array.from(set);
  });

  const mergedSnap: Record<string, Array<{ id: string; t: string }>> = {
    ...remote.snap,
    ...local.snap
  };

  const mergedFavs = Array.from(
    new Set([...(remote.favs || []), ...(local.favs || [])])
  );

  const missionsMap = new Map<string, Mission>();
  (remote.missions || []).forEach((m) => missionsMap.set(m.id, m));
  (local.missions || []).forEach((m) => missionsMap.set(m.id, m));
  const mergedMissions = Array.from(missionsMap.values());

  const mergedFocus: Record<string, number> = { ...remote.focus };
  Object.keys(local.focus || {}).forEach((d) => {
    mergedFocus[d] = Math.max(mergedFocus[d] || 0, local.focus[d] || 0);
  });

  const mergedFses: Record<string, number> = { ...remote.fses };
  Object.keys(local.fses || {}).forEach((d) => {
    mergedFses[d] = Math.max(mergedFses[d] || 0, local.fses[d] || 0);
  });

  const mergedNotes: Record<string, string> = { ...remote.notes, ...local.notes };
  const mergedFix: Record<string, string> = { ...remote.fix, ...local.fix };

  return {
    ...remote,
    ...local,
    missions: mergedMissions,
    done: mergedDone,
    won: mergedWon,
    rest: mergedRest,
    snap: mergedSnap,
    favs: mergedFavs,
    focus: mergedFocus,
    fses: mergedFses,
    notes: mergedNotes,
    fix: mergedFix,
    name: local.name || remote.name || '',
    goal: local.goal || remote.goal || '',
    lang: local.lang || remote.lang || 'en',
    dayEnd: local.dayEnd ?? remote.dayEnd ?? 0,
    reminders: local.reminders || remote.reminders,
    lastBackup: Math.max(local.lastBackup || 0, remote.lastBackup || 0),
    cloudMigrated: true
  };
}

export function loadIronState(): IronState {
  if (typeof window === 'undefined') return createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeState(JSON.parse(raw));
    }
  } catch {
    //
  }

  try {
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const parsed = JSON.parse(rawLegacy);
      if (parsed && parsed.missions) {
        const normalized = normalizeState(parsed);
        saveIronState(normalized);
        return normalized;
      }
    }
  } catch {
    //
  }

  return createDefaultState();
}

export function saveIronState(state: IronState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota error
  }
}

export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) return true;
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Shuffles quote bag and returns next index without repeats
 */
export function drawQuoteIndex(state: IronState, kind: 'n' | 's'): { index: number; state: IronState } {
  const key = kind === 's' ? 'bagS' : 'bagN';
  const src = kind === 's' ? QUOTES_SOFT : QUOTES_NORMAL;
  let bag = (state[key] || []).filter((i) => i < src.length);

  if (!bag.length) {
    bag = src.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = bag[i];
      bag[i] = bag[j];
      bag[j] = temp;
    }
    // Prevent immediate repeat if possible
    if (state.qday && state.qday.k === kind && bag.length > 1 && bag[bag.length - 1] === state.qday.i) {
      const popped = bag.pop()!;
      bag.unshift(popped);
    }
  }

  const nextIndex = bag.pop()!;
  const updatedState = {
    ...state,
    [key]: bag
  };
  return { index: nextIndex, state: updatedState };
}

/**
 * Checks whether today is considered a hard day based on hour and completion rate
 */
export function isAutoHardDay(state: IronState): boolean {
  const td = getEffectiveToday(state.dayEnd);
  if (state.won[td] || state.rest[td]) return false;
  const tasks = getTasksForDay(state, td);
  if (!tasks.length) return false;

  const now = new Date();
  const elapsedHours = (now.getHours() - state.dayEnd + 24) % 24;
  if (elapsedHours < 16) return false;

  return getDoneCountOnDay(state, td) < tasks.length / 2;
}

export function getCurrentQuote(state: IronState): {
  quote: [string, string];
  kind: 'n' | 's';
  index: number;
  key: string;
  updatedState?: IronState;
} {
  const td = getEffectiveToday(state.dayEnd);
  const wantKind = isAutoHardDay(state) ? 's' : 'n';

  if (!state.qday || state.qday.d !== td || state.qday.k !== wantKind) {
    const { index, state: withDrawnBag } = drawQuoteIndex(state, wantKind);
    const updatedState: IronState = {
      ...withDrawnBag,
      qday: { d: td, k: wantKind, i: index }
    };
    saveIronState(updatedState);
    const src = wantKind === 's' ? QUOTES_SOFT : QUOTES_NORMAL;
    const q = src[index] || QUOTES_NORMAL[0];
    return {
      quote: q,
      kind: wantKind,
      index,
      key: `${wantKind}${index}`,
      updatedState
    };
  }

  const src = state.qday.k === 's' ? QUOTES_SOFT : QUOTES_NORMAL;
  const q = src[state.qday.i] || QUOTES_NORMAL[0];
  return {
    quote: q,
    kind: state.qday.k,
    index: state.qday.i,
    key: `${state.qday.k}${state.qday.i}`
  };
}

export function evaluateTodayStatus(state: IronState, keepOnly: boolean = false): IronState {
  const td = getEffectiveToday(state.dayEnd);
  const tasks = getTasksForDay(state, td);
  const isAllDone = tasks.length > 0 && !state.rest[td] && getDoneCountOnDay(state, td) === tasks.length;

  const next = { ...state };
  if (isAllDone) {
    next.won = { ...next.won, [td]: 1 };
    if (!next.snap[td]) {
      next.snap = {
        ...next.snap,
        [td]: tasks.map((m) => ({ id: m.id, t: m.t }))
      };
    }
  } else if (next.won[td] && !keepOnly) {
    const newWon = { ...next.won };
    delete newWon[td];
    const newSnap = { ...next.snap };
    delete newSnap[td];
    next.won = newWon;
    next.snap = newSnap;
  }
  return next;
}
