import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { State, GymSession, SleepLog, MeditationLog, ReadingLog, ChessLog, ReleaseLog } from '../types';
import { estimateCalories } from './data';

const STORAGE_KEY = 'forge-state-v1';

const DEFAULT_STATE: State = {
  settings: {
    weightKg: 75,
    notifications: false,
    notifAsked: false,
    reminders: { gym: '17:00', meditate: '07:30', read: '21:30', chess: '16:00', sleep: '22:30' },
  },
  gymSessions: [],
  sleepLogs: [],
  meditationLogs: [],
  readingLogs: [],
  chessLogs: [],
  releases: [],
  dismissedAlerts: {},
  seenCongrats: [],
};

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}), reminders: { ...DEFAULT_STATE.settings.reminders, ...(parsed.settings?.reminders || {}) } },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

type Action =
  | { type: 'addGym'; session: Omit<GymSession, 'id' | 'calories'> }
  | { type: 'deleteGym'; id: string }
  | { type: 'addSleep'; log: Omit<SleepLog, 'id'> }
  | { type: 'deleteSleep'; id: string }
  | { type: 'addMeditation'; log: Omit<MeditationLog, 'id'> }
  | { type: 'addReading'; log: Omit<ReadingLog, 'id'> }
  | { type: 'addChess'; log: Omit<ChessLog, 'id'> }
  | { type: 'logRelease'; release: Omit<ReleaseLog, 'id'> }
  | { type: 'deleteLog'; habit: 'meditation' | 'reading' | 'chess'; id: string }
  | { type: 'setWeight'; weightKg: number }
  | { type: 'setReminder'; habit: keyof State['settings']['reminders']; time: string }
  | { type: 'setNotifications'; enabled: boolean; asked: boolean }
  | { type: 'dismissAlert'; key: string; dateISO: string }
  | { type: 'markCongrats'; keys: string[] };

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addGym': {
      const s: GymSession = { ...action.session, id: uid(), calories: estimateCalories(state.settings.weightKg, action.session.minutes) };
      return { ...state, gymSessions: [s, ...state.gymSessions] };
    }
    case 'deleteGym':
      return { ...state, gymSessions: state.gymSessions.filter((s) => s.id !== action.id) };
    case 'addSleep':
      return { ...state, sleepLogs: [{ ...action.log, id: uid() }, ...state.sleepLogs] };
    case 'deleteSleep':
      return { ...state, sleepLogs: state.sleepLogs.filter((s) => s.id !== action.id) };
    case 'addMeditation':
      return { ...state, meditationLogs: [{ ...action.log, id: uid() }, ...state.meditationLogs] };
    case 'addReading':
      return { ...state, readingLogs: [{ ...action.log, id: uid() }, ...state.readingLogs] };
    case 'addChess':
      return { ...state, chessLogs: [{ ...action.log, id: uid() }, ...state.chessLogs] };
    case 'logRelease':
      return { ...state, releases: [{ ...action.release, id: uid() }, ...state.releases] };
    case 'deleteLog': {
      const key = action.habit + 'Logs';
      const list = (state as unknown as Record<string, unknown[]>)[key].filter((l) => (l as { id: string }).id !== action.id);
      return { ...state, [key]: list } as State;
    }
    case 'setWeight':
      return { ...state, settings: { ...state.settings, weightKg: action.weightKg } };
    case 'setReminder':
      return { ...state, settings: { ...state.settings, reminders: { ...state.settings.reminders, [action.habit]: action.time } } };
    case 'setNotifications':
      return { ...state, settings: { ...state.settings, notifications: action.enabled, notifAsked: action.asked } };
    case 'dismissAlert':
      return { ...state, dismissedAlerts: { ...state.dismissedAlerts, [action.key]: action.dateISO } };
    case 'markCongrats':
      return { ...state, seenCongrats: [...new Set([...state.seenCongrats, ...action.keys])] };
    default:
      return state;
  }
}

// ─── Date helpers ───
export function dateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function todayISO(): string {
  return dateISO(new Date());
}

export function daysBetween(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split('-').map(Number);
  const [by, bm, bd] = bISO.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** Days since the most recent date in the list (0 if today). */
export function daysSinceLatest(datesISO: string[]): number | null {
  if (!datesISO.length) return null;
  const latest = datesISO.reduce((a, b) => (a > b ? a : b));
  return daysBetween(latest, todayISO());
}

// ─── Context ───
interface StoreCtx {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const Ctx = createContext<StoreCtx>({ state: DEFAULT_STATE, dispatch: () => {} });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — ignore */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  return useContext(Ctx);
}

// ─── Derived stats helpers ───
export function retentionDays(releases: ReleaseLog[]): number {
  if (!releases.length) return 0;
  const latest = releases.map((r) => r.dateISO.slice(0, 10)).reduce((a, b) => (a > b ? a : b));
  return daysBetween(latest, todayISO());
}

export function lastWeekSessions(sessions: GymSession[]): GymSession[] {
  const cutoff = dateISO(new Date(Date.now() - 6 * 86400000));
  return sessions.filter((s) => s.dateISO >= cutoff);
}

export function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon.svg', badge: '/icon.svg' });
    }
  } catch {
    /* notifications unsupported — in-app alerts still work */
  }
}
