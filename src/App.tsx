import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Dumbbell, MoonStar, Sparkles, Brain, Settings as SettingsIcon, X, Bell, BellOff, Share, Info } from 'lucide-react';
import { StoreProvider, useStore, todayISO, notify } from './lib/store';
import { WEEKLY_PLAN } from './lib/data';
import Today from './screens/Today';
import Train from './screens/Train';
import Sleep from './screens/Sleep';
import Retention from './screens/Retention';
import Mind from './screens/Mind';
import { Card, PrimaryButton, Input, Label } from './components/bits';

export type Tab = 'today' | 'train' | 'sleep' | 'retention' | 'mind';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'sleep', label: 'Sleep', icon: MoonStar },
  { id: 'retention', label: 'Vitality', icon: Sparkles },
  { id: 'mind', label: 'Mind', icon: Brain },
];

interface Alert {
  key: string;
  title: string;
  body: string;
  tab: Tab;
}

function Shell() {
  const [tab, setTab] = useState<Tab>('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { state, dispatch } = useStore();

  // ─── Reminder / alert engine — re-checked every 30s while app is open ───
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const alerts = useMemo((): Alert[] => {
    const d = new Date(now);
    const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const today = todayISO();
    const out: Alert[] = [];
    const r = state.settings.reminders;
    const dismissed = state.dismissedAlerts;

    const push = (key: string, title: string, body: string, t: Tab) => {
      if (dismissed[key] === today) return; // already shown & dismissed today
      out.push({ key, title, body, tab: t });
    };

    // Gym
    const plan = WEEKLY_PLAN[d.getDay()];
    if (!plan.rest && !state.gymSessions.some((s) => s.dateISO === today) && hm >= r.gym) {
      push(`gym-${today}`, 'Time to train', `${plan.day}'s session is waiting. ${plan.exercises.length} exercises.`, 'train');
    }
    // Meditation
    if (!state.meditationLogs.some((l) => l.dateISO === today) && hm >= r.meditate) {
      push(`med-${today}`, 'Meditation reminder', 'Have you sat today? Even 5 minutes protects your calm.', 'mind');
    }
    // Reading
    if (!state.readingLogs.some((l) => l.dateISO === today) && hm >= r.read) {
      push(`read-${today}`, 'Reading reminder', 'Have you read today? Ten pages keeps the mind warm.', 'mind');
    }
    // Chess
    if (!state.chessLogs.some((l) => l.dateISO === today) && hm >= r.chess) {
      push(`chess-${today}`, 'Chess reminder', 'A quick puzzle set keeps your calculation sharp.', 'mind');
    }
    // Sleep
    if (!state.sleepLogs.some((l) => l.dateISO === today) && hm >= r.sleep) {
      push(`sleep-${today}`, 'Wind down soon', "Log last night's sleep, then aim for 7–9h. Recovery is training.", 'sleep');
    }
    return out.slice(0, 2);
  }, [now, state]);

  // Fire OS notifications for alerts (once each — track via dismissed keys when permission granted)
  useEffect(() => {
    if (!state.settings.notifications) return;
    alerts.forEach((a) => {
      const flag = `notif-${a.key}`;
      if (!state.dismissedAlerts[flag]) {
        notify(a.title, a.body);
        dispatch({ type: 'dismissAlert', key: flag, dateISO: todayISO() });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  const askNotifications = async (enable: boolean) => {
    if (enable && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      dispatch({ type: 'setNotifications', enabled: perm === 'granted', asked: true });
      return;
    }
    dispatch({ type: 'setNotifications', enabled: enable && 'Notification' in window && Notification.permission === 'granted', asked: true });
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="pt-safe sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 via-rose-500 to-violet-500 flex items-center justify-center shadow-md shadow-orange-500/25">
              <Sparkles size={15} className="text-white" fill="white" />
            </div>
            <span className="font-bold tracking-tight">Forge</span>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 text-muted-foreground" aria-label="Settings">
            <SettingsIcon size={19} />
          </button>
        </div>
      </div>

      {/* In-app alert banners */}
      {alerts.map((a) => (
        <div key={a.key} className="px-4 mt-3 animate-in">
          <Card className="border-primary/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Bell size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => {
                    setTab(a.tab);
                    dispatch({ type: 'dismissAlert', key: a.key, dateISO: todayISO() });
                  }}
                  className="text-xs font-semibold text-primary"
                >
                  Open →
                </button>
                <button
                  onClick={() => dispatch({ type: 'dismissAlert', key: a.key, dateISO: todayISO() })}
                  className="text-xs text-muted-foreground"
                >
                  Later
                </button>
              </div>
            </div>
          </Card>
        </div>
      ))}

      {/* Screens */}
      <main>
        {tab === 'today' && <Today go={setTab} />}
        {tab === 'train' && <Train />}
        {tab === 'sleep' && <Sleep />}
        {tab === 'retention' && <Retention />}
        {tab === 'mind' && <Mind />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-background/90 backdrop-blur-md border-t border-border/60 pb-safe">
        <div className="flex justify-around px-2 pt-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px]">
                <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground/60'} />
                <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground/60'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings sheet */}
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} onNotif={askNotifications} />}
    </div>
  );
}

function SettingsSheet({ onClose, onNotif }: { onClose: () => void; onNotif: (enable: boolean) => Promise<void> }) {
  const { state, dispatch } = useStore();
  const [weight, setWeight] = useState(String(state.settings.weightKg));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-safe max-h-[88vh] overflow-y-auto no-scrollbar animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Body weight (kg) — used for calorie estimates</Label>
            <div className="flex gap-2">
              <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <PrimaryButton
                className="w-auto px-5"
                onClick={() => dispatch({ type: 'setWeight', weightKg: Math.max(30, Number(weight) || 75) })}
              >
                Save
              </PrimaryButton>
            </div>
          </div>

          <div>
            <Label>Notifications & alerts</Label>
            <button
              onClick={() => onNotif(!state.settings.notifications)}
              className="w-full flex items-center justify-between bg-secondary rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm">
                {state.settings.notifications ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
                {state.settings.notifications ? 'Notifications on' : 'Notifications off'}
              </span>
              <span className={`w-10 h-6 rounded-full relative transition-colors ${state.settings.notifications ? 'bg-primary' : 'bg-border'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.settings.notifications ? 'left-5' : 'left-1'}`} />
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
              On iPhone, true scheduled push notifications require a native app — a web app can notify you while it's open or installed-to-homescreen via web push. In-app reminders always work, at the times you set below.
            </p>
          </div>

          <div>
            <Label>Daily reminder times</Label>
            <div className="space-y-2">
              {(
                [
                  ['gym', 'Gym / workout'],
                  ['meditate', 'Meditation'],
                  ['read', 'Reading'],
                  ['chess', 'Chess'],
                  ['sleep', 'Wind-down & sleep log'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
                  <span className="text-sm">{label}</span>
                  <input
                    type="time"
                    value={state.settings.reminders[key]}
                    onChange={(e) => dispatch({ type: 'setReminder', habit: key, time: e.target.value })}
                    className="bg-transparent text-sm text-primary font-semibold focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/60 rounded-xl p-4">
            <p className="text-xs font-semibold flex items-center gap-1.5 mb-2"><Share size={13} className="text-primary" /> Install on your iPhone</p>
            <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open this app in Safari on your iPhone.</li>
              <li>Tap the Share button.</li>
              <li>Scroll down and tap "Add to Home Screen".</li>
              <li>Tap "Add" — Forge now opens full-screen like a native app, and your data stays on your device.</li>
            </ol>
          </div>

          <div className="flex gap-2 items-start pb-2">
            <Info size={13} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              All data is stored locally on your device only. Calorie and sleep figures are evidence-based estimates; semen-retention benefits are anecdotal and labelled as such inside the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
