import { useState } from 'react';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { useStore, todayISO, retentionDays } from '../lib/store';
import { RETENTION_MILESTONES, RETENTION_DISCLAIMER } from '../lib/data';
import { Card, SectionTitle, PrimaryButton, GhostButton, Input, Label, Pill } from '../components/bits';
import { notify } from '../lib/store';

export default function Retention() {
  const { state, dispatch } = useStore();
  const [showLog, setShowLog] = useState(false);
  const [releaseDate, setReleaseDate] = useState(todayISO());
  const [releaseTime, setReleaseTime] = useState('22:00');

  const days = retentionDays(state.releases);
  const best = (() => {
    // compute longest past stretch between releases
    const dates = [...state.releases.map((r) => r.dateISO.slice(0, 10))].sort();
    let best = 0;
    for (let i = 1; i < dates.length; i++) {
      const d0 = new Date(dates[i - 1] + 'T12:00:00').getTime();
      const d1 = new Date(dates[i] + 'T12:00:00').getTime();
      best = Math.max(best, Math.round((d1 - d0) / 86400000));
    }
    return Math.max(best, days);
  })();

  const nextMilestone = RETENTION_MILESTONES.find((m) => m.day > days);

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      {/* Hero */}
      <Card className="mt-3 flex flex-col items-center py-6">
        <div className="relative mb-2">
          <Sparkles size={44} className={days > 0 ? 'text-accent' : 'text-muted-foreground/40'} fill={days > 0 ? 'hsl(262 75% 58% / 0.2)' : 'none'} />
        </div>
        <p className="text-6xl font-bold tabular-nums tracking-tight gradient-text">{days}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">day{days === 1 ? '' : 's'} retained</p>
        {best > 0 && <p className="text-[11px] text-muted-foreground mt-2">Personal best: {best} days</p>}
        <div className="flex gap-2 w-full mt-5">
          <GhostButton onClick={() => setShowLog(!showLog)}>Log release (reset)</GhostButton>
        </div>
      </Card>

      {showLog && (
        <Card className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">Honesty keeps the data useful. Logging a release resets the counter — no judgment, day one starts immediately.</p>
          <div>
            <Label>Date</Label>
            <Input type="date" value={releaseDate} max={todayISO()} onChange={(e) => setReleaseDate(e.target.value)} />
          </div>
          <div>
            <Label>Time (optional)</Label>
            <Input type="time" value={releaseTime} onChange={(e) => setReleaseTime(e.target.value)} />
          </div>
          <PrimaryButton
            onClick={() => {
              dispatch({ type: 'logRelease', release: { dateISO: `${releaseDate}T${releaseTime}:00` } });
              setShowLog(false);
              notify('Counter reset', 'Day 1. Every long run you admire started here.');
            }}
          >
            Confirm — start day 1
          </PrimaryButton>
        </Card>
      )}

      {/* Next milestone */}
      {nextMilestone && (
        <Card className="mt-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Next milestone</p>
          <p className="text-sm font-semibold text-primary">Day {nextMilestone.day} — {nextMilestone.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{nextMilestone.text}</p>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (days / nextMilestone.day) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{nextMilestone.day - days} day{nextMilestone.day - days === 1 ? '' : 's'} to go</p>
        </Card>
      )}

      {/* Timeline */}
      <SectionTitle title="The journey" sub="What practitioners commonly report at each stage" />
      <div className="space-y-3">
        {RETENTION_MILESTONES.map((m) => {
          const reached = days >= m.day;
          return (
            <Card key={m.day} className={reached ? 'border-primary/30' : ''}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                  reached ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {reached ? <CheckCircle2 size={17} /> : m.day}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${reached ? '' : 'text-muted-foreground'}`}>
                    Day {m.day} — {m.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.text}</p>
                </div>
                {reached && <Pill tone="accent">reached</Pill>}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 items-start mt-4 p-3 rounded-xl bg-secondary/50 border border-border">
        <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">{RETENTION_DISCLAIMER}</p>
      </div>
    </div>
  );
}
