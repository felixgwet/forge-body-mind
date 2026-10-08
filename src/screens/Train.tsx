import { useEffect, useMemo, useRef, useState } from 'react';
import { Dumbbell, Timer, Trash2, Plus, ChevronDown, ChevronUp, Clock3, CalendarDays } from 'lucide-react';
import { useStore, todayISO, dateISO, notify } from '../lib/store';
import { WEEKLY_PLAN, TIME_OF_DAY_LABEL, timeOfDayFromDate } from '../lib/data';
import type { TimeOfDay } from '../types';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, GhostButton, Input, Select, Label, EmptyState, MiniBars } from '../components/bits';

function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export default function Train() {
  const { state, dispatch } = useStore();
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showManual, setShowManual] = useState(false);
  const [manualDate, setManualDate] = useState(todayISO());
  const [manualMinutes, setManualMinutes] = useState('60');
  const [manualTod, setManualTod] = useState<TimeOfDay>(timeOfDayFromDate(new Date()));
  const [expandedHistory, setExpandedHistory] = useState(false);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (timerStart) {
      tick.current = window.setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (tick.current) window.clearInterval(tick.current);
      };
    }
  }, [timerStart]);

  const todayIdx = new Date().getDay();
  const todayPlan = WEEKLY_PLAN[todayIdx];
  const doneToday = state.gymSessions.some((s) => s.dateISO === todayISO());

  const elapsed = timerStart ? now - timerStart : 0;

  const finishWorkout = () => {
    if (!timerStart) return;
    const end = Date.now();
    const startISO = new Date(timerStart);
    const minutes = Math.max(1, Math.round((end - timerStart) / 60000));
    dispatch({
      type: 'addGym',
      session: {
        dateISO: dateISO(startISO),
        startISO: startISO.toISOString(),
        endISO: new Date(end).toISOString(),
        minutes,
        timeOfDay: timeOfDayFromDate(startISO),
        exercises: todayPlan.exercises.filter((_, i) => checked.has(i)).map((e) => ({ name: e.name })),
        note: undefined,
      },
    });
    notify('Workout logged', `${minutes} min · ~${Math.round(5.5 * state.settings.weightKg * (minutes / 60))} kcal. Well earned.`);
    setTimerStart(null);
    setChecked(new Set());
  };

  // ─── Stats ───
  const sessions = state.gymSessions;
  const avgMin = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.minutes, 0) / sessions.length) : 0;
  const avgKcal = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.calories, 0) / sessions.length) : 0;
  const totalKcal = sessions.reduce((a, s) => a + s.calories, 0);

  const todCounts = useMemo(() => {
    const c: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions.forEach((s) => c[s.timeOfDay]++);
    return c;
  }, [sessions]);

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      const mins = sessions.filter((s) => s.dateISO === iso).reduce((a, s) => a + s.minutes, 0);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: mins });
    }
    return out;
  }, [sessions]);

  const sortedHistory = useMemo(() => [...sessions].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)), [sessions]);
  const historyShown = expandedHistory ? sortedHistory : sortedHistory.slice(0, 5);

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      {/* Timer card */}
      <Card className="mt-3">
        {!timerStart ? (
          <div className="flex flex-col items-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
              <Timer className="text-primary" size={26} />
            </div>
            <p className="text-sm font-semibold">{doneToday ? 'Workout logged today — nice.' : todayPlan.rest ? 'Rest day — recover & recharge.' : `${todayPlan.day}'s session is waiting.`}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 text-center">
              {todayPlan.rest ? 'Sleep, stretch, hydrate. Light walking speeds up recovery.' : 'Hit start when you walk in, finish when you walk out.'}
            </p>
            <PrimaryButton
              className="ring-pulse"
              onClick={() => {
                setTimerStart(Date.now());
                setNow(Date.now());
              }}
              disabled={todayPlan.rest}
            >
              Start Workout
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Session running</p>
            <p className="text-5xl font-bold tabular-nums my-3 tracking-tight">{fmtElapsed(elapsed)}</p>
            <p className="text-xs text-muted-foreground mb-4">Started {new Date(timerStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ~{Math.round(5.5 * state.settings.weightKg * (elapsed / 3600000))} kcal so far</p>
            <div className="flex gap-2 w-full">
              <GhostButton onClick={() => setTimerStart(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={finishWorkout}>Finish & Log</PrimaryButton>
            </div>
          </div>
        )}
      </Card>

      {/* Today's plan */}
      {!todayPlan.rest && (
        <>
          <SectionTitle title={`${todayPlan.day} — today's plan`} sub="Tap exercises as you complete them" />
          <Card className="p-2">
            {todayPlan.exercises.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = new Set(checked);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  setChecked(next);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${checked.has(i) ? 'bg-primary/10' : 'hover:bg-secondary/60'}`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked.has(i) ? 'bg-primary border-primary' : 'border-border'}`}>
                  {checked.has(i) && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${checked.has(i) ? 'line-through opacity-60' : ''}`}>{ex.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{ex.targets}</p>
                </div>
                <Pill tone="neutral">{ex.sets}</Pill>
              </button>
            ))}
            {todayPlan.tip && <p className="text-[11px] text-muted-foreground px-3 py-2 italic border-t border-border mt-1">💡 {todayPlan.tip}</p>}
          </Card>
        </>
      )}

      {/* Weekly plan overview */}
      <SectionTitle title="Weekly plan" sub="From your Men's Edition program" />
      <Card className="p-2 space-y-1">
        {WEEKLY_PLAN.map((d, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl ${i === todayIdx ? 'bg-primary/10' : ''}`}>
            <span className={`text-sm ${i === todayIdx ? 'font-semibold text-primary' : ''}`}>{d.day}</span>
            <span className="text-[11px] text-muted-foreground text-right">
              {d.rest ? 'Rest 🛋️' : `${d.exercises.length} exercises`}
            </span>
          </div>
        ))}
      </Card>

      {/* Stats */}
      <SectionTitle title="Your numbers" />
      <div className="grid grid-cols-2 gap-3">
        <Card><Stat label="Sessions (14d)" value={sessions.filter((s) => s.dateISO >= dateISO(new Date(Date.now() - 13 * 86400000))).length} accent="text-primary" /><p className="text-[11px] text-muted-foreground mt-1">last 14 days</p></Card>
        <Card><Stat label="Avg duration" value={avgMin} unit="min" /><p className="text-[11px] text-muted-foreground mt-1">per session</p></Card>
        <Card><Stat label="Avg burn" value={avgKcal} unit="kcal" accent="text-orange-400" /><p className="text-[11px] text-muted-foreground mt-1">approx, per session</p></Card>
        <Card><Stat label="Total burn" value={totalKcal} unit="kcal" /><p className="text-[11px] text-muted-foreground mt-1">all time</p></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-semibold mb-3 text-foreground/90">Minutes trained — last 14 days</p>
        {sessions.length ? <MiniBars data={bars} /> : <EmptyState icon={<Dumbbell size={28} />} text="No sessions yet — start your first one above." />}
      </Card>

      {/* Time of day */}
      {sessions.length > 0 && (
        <Card className="mt-3">
          <p className="text-xs font-semibold mb-3 text-foreground/90 flex items-center gap-1.5"><Clock3 size={14} /> When you train</p>
          <div className="space-y-2">
            {(Object.keys(todCounts) as TimeOfDay[]).map((k) => {
              const total = sessions.length;
              const pct = Math.round((todCounts[k] / total) * 100);
              if (todCounts[k] === 0) return null;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0">{TIME_OF_DAY_LABEL[k]}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Manual log */}
      <button onClick={() => setShowManual(!showManual)} className="w-full flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Plus size={15} /> Log a past session manually</span>
        {showManual ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showManual && (
        <Card className="mt-2 space-y-3">
          <div>
            <Label>Date</Label>
            <Input type="date" value={manualDate} max={todayISO()} onChange={(e) => setManualDate(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" inputMode="numeric" min={1} value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} />
          </div>
          <div>
            <Label>Time of day</Label>
            <Select value={manualTod} onChange={(e) => setManualTod(e.target.value as TimeOfDay)}>
              {(Object.keys(TIME_OF_DAY_LABEL) as TimeOfDay[]).map((k) => (
                <option key={k} value={k}>{TIME_OF_DAY_LABEL[k]}</option>
              ))}
            </Select>
          </div>
          <PrimaryButton
            disabled={!manualDate || !Number(manualMinutes)}
            onClick={() => {
              const d = new Date(manualDate + 'T12:00:00');
              dispatch({
                type: 'addGym',
                session: {
                  dateISO: manualDate,
                  startISO: d.toISOString(),
                  endISO: new Date(d.getTime() + Number(manualMinutes) * 60000).toISOString(),
                  minutes: Number(manualMinutes),
                  timeOfDay: manualTod,
                  exercises: [],
                },
              });
              setShowManual(false);
            }}
          >
            Save session
          </PrimaryButton>
        </Card>
      )}

      {/* History */}
      <SectionTitle title="History" sub={`${sessions.length} session${sessions.length === 1 ? '' : 's'} logged`} />
      <Card className="p-2">
        {sortedHistory.length === 0 ? (
          <EmptyState icon={<CalendarDays size={28} />} text="Your logged workouts will appear here." />
        ) : (
          <>
            {historyShown.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Dumbbell size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(s.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.minutes} min · ~{s.calories} kcal · {TIME_OF_DAY_LABEL[s.timeOfDay].split(' ')[0]}
                    {s.exercises.length > 0 && ` · ${s.exercises.length} exercises`}
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'deleteGym', id: s.id })}
                  className="p-2 text-muted-foreground/50 hover:text-red-400"
                  aria-label="Delete session"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {sortedHistory.length > 5 && (
              <button onClick={() => setExpandedHistory(!expandedHistory)} className="w-full text-center text-xs text-muted-foreground py-2">
                {expandedHistory ? 'Show less' : `Show all ${sortedHistory.length}`}
              </button>
            )}
          </>
        )}
      </Card>
      <p className="text-[10px] text-muted-foreground/60 text-center pt-3">Calories are approximations based on vigorous weight-training intensity (~5.5 METs) × your body weight. Set your weight in Settings.</p>
    </div>
  );
}
