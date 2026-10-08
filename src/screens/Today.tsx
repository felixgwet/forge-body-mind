import { useEffect, useMemo } from 'react';
import { Dumbbell, MoonStar, Flame, Brain, BookOpen, Crown, ChevronRight, Trophy, AlertTriangle } from 'lucide-react';
import { useStore, todayISO, dateISO, streakFromDates, daysSinceLatest, retentionStreakDays, lastWeekSessions } from '../lib/store';
import { WEEKLY_PLAN, SLEEP_BANDS, CONGRATS_MESSAGES } from '../lib/data';
import { Card, SectionTitle, Pill, Ring } from '../components/bits';
import type { Tab } from '../App';

export default function Today({ go }: { go: (t: Tab) => void }) {
  const { state, dispatch } = useStore();
  const today = new Date();
  const todayIdx = today.getDay();
  const plan = WEEKLY_PLAN[todayIdx];

  const gymThisWeek = lastWeekSessions(state.gymSessions).length;
  const doneToday = state.gymSessions.some((s) => s.dateISO === todayISO());

  const lastSleep = [...state.sleepLogs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))[0];
  const sleepBand = lastSleep ? SLEEP_BANDS.find((b) => lastSleep.hours < b.max) : null;

  const retDays = retentionStreakDays(state.releases);
  const medStreak = streakFromDates(state.meditationLogs.map((l) => l.dateISO));
  const readStreak = streakFromDates(state.readingLogs.map((l) => l.dateISO));
  const chessGap = daysSinceLatest(state.chessLogs.map((l) => l.dateISO));

  const hour = today.getHours();
  const greeting = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // active gap warnings for dashboard
  const warnings = useMemo(() => {
    const w: { text: string; tab: Tab }[] = [];
    if (!plan.rest && !doneToday) w.push({ text: `${plan.day} session not logged yet.`, tab: 'train' });
    if (chessGap !== null && chessGap >= 3) w.push({ text: `${chessGap} days without chess — sharpness fading.`, tab: 'mind' });
    const medGap = daysSinceLatest(state.meditationLogs.map((l) => l.dateISO));
    if (medGap !== null && medGap >= 2) w.push({ text: `${medGap} days without meditation.`, tab: 'mind' });
    const readGap = daysSinceLatest(state.readingLogs.map((l) => l.dateISO));
    if (readGap !== null && readGap >= 2) w.push({ text: `${readGap} days without reading.`, tab: 'mind' });
    if (lastSleep) {
      const sleepAge = Math.round((Date.now() - new Date(lastSleep.dateISO + 'T12:00:00').getTime()) / 86400000);
      if (sleepAge >= 1) w.push({ text: "Last night's sleep isn't logged yet.", tab: 'sleep' });
    }
    return w;
  }, [plan, doneToday, chessGap, state, lastSleep]);

  // pending congrats
  const congrats = useMemo(() => {
    const keys: string[] = [];
    const medSt = streakFromDates(state.meditationLogs.map((l) => l.dateISO));
    const readSt = streakFromDates(state.readingLogs.map((l) => l.dateISO));
    const chessSt = streakFromDates(state.chessLogs.map((l) => l.dateISO));
    const ret = retentionStreakDays(state.releases);
    if (gymThisWeek >= 4) keys.push('gym-4week');
    else if (gymThisWeek >= 3) keys.push('gym-3week');
    if (ret >= 90) keys.push('retention-90');
    else if (ret >= 30) keys.push('retention-30');
    else if (ret >= 7) keys.push('retention-7');
    if (medSt >= 30) keys.push('meditate-30');
    else if (medSt >= 7) keys.push('meditate-7');
    if (readSt >= 30) keys.push('read-30');
    else if (readSt >= 7) keys.push('read-7');
    if (chessSt >= 30) keys.push('chess-30');
    else if (chessSt >= 7) keys.push('chess-7');
    const weekLogs = state.sleepLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000)));
    if (weekLogs.length >= 5 && weekLogs.every((l) => l.hours >= 7 && l.hours <= 9)) keys.push('sleep-week-good');
    return keys.filter((k) => !state.seenCongrats.includes(k) && CONGRATS_MESSAGES[k]);
  }, [state, gymThisWeek]);

  // Celebrate, then mark as seen so each milestone fires once
  useEffect(() => {
    if (!congrats.length) return;
    const t = window.setTimeout(() => dispatch({ type: 'markCongrats', keys: congrats }), 12000);
    return () => window.clearTimeout(t);
  }, [congrats, dispatch]);

  return (
    <div className="px-4 pt-2 pb-28">
      <div className="mt-3 mb-4">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">{greeting}.</h1>
      </div>

      {/* Congrats */}
      {congrats.map((k) => (
        <Card key={k} className="mb-3 border-primary/40">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Trophy size={19} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Milestone reached 🎉</p>
              <p className="text-xs text-muted-foreground mt-0.5">{CONGRATS_MESSAGES[k]}</p>
            </div>
          </div>
        </Card>
      ))}

      {/* Nudges */}
      {warnings.length > 0 && (
        <div className="mb-3 space-y-2">
          {warnings.slice(0, 3).map((w, i) => (
            <button key={i} onClick={() => go(w.tab)} className="w-full">
              <Card className="border-amber-500/25 flex items-center gap-3">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200/90 flex-1 text-left">{w.text}</span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Rings overview */}
      <Card>
        <p className="text-xs font-semibold text-foreground/90 mb-4">Today's body & mind</p>
        <div className="flex justify-around">
          <button onClick={() => go('train')} className="flex flex-col items-center gap-1.5">
            <Ring percent={plan.rest ? 100 : doneToday ? 100 : 0} color={doneToday || plan.rest ? 'hsl(150 70% 45%)' : 'hsl(38 92% 55%)'}>
              <Dumbbell size={18} className={doneToday || plan.rest ? 'text-emerald-400' : 'text-muted-foreground'} />
            </Ring>
            <span className="text-[10px] text-muted-foreground">{plan.rest ? 'Rest day' : doneToday ? 'Trained ✓' : 'Train'}</span>
          </button>
          <button onClick={() => go('sleep')} className="flex flex-col items-center gap-1.5">
            <Ring percent={lastSleep ? Math.min(100, (lastSleep.hours / 9) * 100) : 0} color="hsl(210 90% 60%)">
              <MoonStar size={18} className={lastSleep ? 'text-sky-400' : 'text-muted-foreground'} />
            </Ring>
            <span className="text-[10px] text-muted-foreground">{lastSleep ? `${lastSleep.hours}h` : 'Sleep'}</span>
          </button>
          <button onClick={() => go('retention')} className="flex flex-col items-center gap-1.5">
            <Ring percent={Math.min(100, (retDays / 90) * 100)} color="hsl(20 90% 55%)">
              <Flame size={18} className={retDays > 0 ? 'text-orange-400' : 'text-muted-foreground'} />
            </Ring>
            <span className="text-[10px] text-muted-foreground">{retDays}d streak</span>
          </button>
        </div>
      </Card>

      {/* Mind habits */}
      <SectionTitle title="Mind habits" sub="Tap to log" />
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <Brain size={20} className={medStreak > 0 ? 'text-primary' : 'text-muted-foreground/50'} />
            <span className="text-base font-bold">{medStreak}</span>
            <span className="text-[10px] text-muted-foreground">meditation days</span>
          </Card>
        </button>
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <BookOpen size={20} className={readStreak > 0 ? 'text-primary' : 'text-muted-foreground/50'} />
            <span className="text-base font-bold">{readStreak}</span>
            <span className="text-[10px] text-muted-foreground">reading days</span>
          </Card>
        </button>
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <Crown size={20} className={chessGap === null ? 'text-muted-foreground/50' : chessGap <= 1 ? 'text-primary' : 'text-red-400'} />
            <span className="text-base font-bold">{chessGap === null ? '—' : `${chessGap}d`}</span>
            <span className="text-[10px] text-muted-foreground">since chess</span>
          </Card>
        </button>
      </div>

      {/* Today plan preview */}
      <SectionTitle title={plan.rest ? 'Today: recover' : `Today: ${plan.day} session`} sub={plan.rest ? 'Sleep, stretch, hydrate' : `${plan.exercises.length} exercises`} />
      <Card>
        {plan.rest ? (
          <p className="text-xs text-muted-foreground">Rest & recharge — light walking, mobility work and good sleep speed up recovery. Maybe meditate and read a little extra today.</p>
        ) : (
          <div className="space-y-2">
            {plan.exercises.slice(0, 4).map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs truncate">{e.name}</span>
                <Pill tone="neutral">{e.sets}</Pill>
              </div>
            ))}
            {plan.exercises.length > 4 && <p className="text-[11px] text-muted-foreground">+ {plan.exercises.length - 4} more…</p>}
            <button onClick={() => go('train')} className="w-full text-left text-xs text-primary font-semibold pt-1">
              Open workout →
            </button>
          </div>
        )}
      </Card>

      {/* Sleep verdict */}
      {lastSleep && sleepBand && (
        <>
          <SectionTitle title="Sleep check" />
          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{lastSleep.hours}h last logged</p>
              <Pill tone={sleepBand.tone === 'good' ? 'good' : sleepBand.tone === 'bad' ? 'bad' : sleepBand.tone === 'warn' ? 'warn' : 'info'}>{sleepBand.headline}</Pill>
            </div>
            <p className="text-[11px] text-muted-foreground">{sleepBand.tone === 'good' ? sleepBand.pros[0] : sleepBand.cons[0]}</p>
          </Card>
        </>
      )}

      {/* Week summary */}
      <SectionTitle title="This week" />
      <Card>
        <div className="flex justify-between text-center">
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">{gymThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">workouts</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-sky-400">
              {(() => {
                const wk = state.sleepLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000)));
                return wk.length ? (wk.reduce((a, l) => a + l.hours, 0) / wk.length).toFixed(1) : '—';
              })()}
            </p>
            <p className="text-[10px] text-muted-foreground">avg sleep h</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-emerald-400">
              {state.meditationLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000))).length +
                state.readingLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000))).length +
                state.chessLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000))).length}
            </p>
            <p className="text-[10px] text-muted-foreground">mind sessions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
