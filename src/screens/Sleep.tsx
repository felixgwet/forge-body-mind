import { useMemo, useState } from 'react';
import { MoonStar, Trash2, Lightbulb, BedDouble } from 'lucide-react';
import { useStore, todayISO, dateISO } from '../lib/store';
import { SLEEP_BANDS, SLEEP_TIPS } from '../lib/data';
import type { SleepLog } from '../types';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, Input, Label, EmptyState, MiniBars } from '../components/bits';
import { notify } from '../lib/store';

function bandFor(hours: number) {
  return SLEEP_BANDS.find((b) => hours < b.max)!;
}

export default function Sleep() {
  const { state, dispatch } = useStore();
  const [date, setDate] = useState(todayISO());
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<SleepLog['quality']>(3);

  const logs = state.sleepLogs;
  const avg = logs.length ? logs.reduce((a, l) => a + l.hours, 0) / logs.length : 0;
  const inZone = logs.filter((l) => l.hours >= 7 && l.hours <= 9).length;

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      const log = logs.find((l) => l.dateISO === iso);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: log ? Math.round(log.hours * 10) / 10 : 0 });
    }
    return out;
  }, [logs]);

  const sorted = useMemo(() => [...logs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 14), [logs]);
  const lastNight = logs.find((l) => l.dateISO === todayISO()) || sorted[0];
  const lastBand = lastNight ? bandFor(lastNight.hours) : null;

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <Card className="mt-3">
        <p className="text-xs font-semibold text-foreground/90 mb-3">Log last night's sleep</p>
        <div className="space-y-3">
          <div>
            <Label>Date (day you woke up)</Label>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Hours slept</Label>
            <Input type="number" inputMode="decimal" step="0.5" min="0" max="16" value={hours} onChange={(e) => setHours(e.target.value)} />
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={Number(hours) || 0}
              onChange={(e) => setHours(e.target.value)}
              className="w-full mt-3 accent-[hsl(38_92%_55%)]"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>3h</span><span className="text-emerald-400 font-medium">7–9h optimal</span><span>12h</span>
            </div>
          </div>
          <div>
            <Label>How rested do you feel?</Label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                    quality === q ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton
            disabled={!date || !Number(hours)}
            onClick={() => {
              dispatch({ type: 'addSleep', log: { dateISO: date, hours: Number(hours), quality } });
              const b = bandFor(Number(hours));
              if (b.tone === 'good') notify('Sleep logged', `${hours}h — right in the optimal zone.`);
              else notify('Sleep logged', `${hours}h — aim for 7–9h tonight.`);
            }}
          >
            Save sleep
          </PrimaryButton>
        </div>
      </Card>

      {/* Last night verdict */}
      {lastNight && lastBand && (
        <Card className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <MoonStar size={16} className={lastBand.tone === 'good' ? 'text-emerald-400' : lastBand.tone === 'bad' ? 'text-red-400' : 'text-amber-400'} />
            <p className="text-sm font-semibold">Last log: {lastNight.hours}h — {lastBand.headline}</p>
          </div>
          <div className="space-y-1.5">
            {lastBand.pros.map((p, i) => (
              <p key={`p${i}`} className="text-xs text-emerald-400/90 flex gap-2"><span>+</span><span>{p}</span></p>
            ))}
            {lastBand.cons.map((c, i) => (
              <p key={`c${i}`} className="text-xs text-muted-foreground flex gap-2"><span>–</span><span>{c}</span></p>
            ))}
          </div>
        </Card>
      )}

      {/* Stats */}
      <SectionTitle title="Your sleep" />
      <div className="grid grid-cols-2 gap-3">
        <Card><Stat label="Average" value={avg ? avg.toFixed(1) : '—'} unit="h" accent="text-primary" /><p className="text-[11px] text-muted-foreground mt-1">across {logs.length} night{logs.length === 1 ? '' : 's'}</p></Card>
        <Card><Stat label="In optimal zone" value={logs.length ? Math.round((inZone / logs.length) * 100) : 0} unit="%" accent="text-emerald-400" /><p className="text-[11px] text-muted-foreground mt-1">of nights at 7–9h</p></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-semibold mb-3 text-foreground/90">Hours — last 14 days</p>
        {logs.length ? <MiniBars data={bars} color="hsl(210 90% 60%)" /> : <EmptyState icon={<BedDouble size={28} />} text="Log your first night above." />}
      </Card>

      {/* Reference bands */}
      <SectionTitle title="What the research says" sub="Adult recommendation: 7–9 hours (AASM / CDC / Sleep Foundation)" />
      <div className="space-y-3">
        {SLEEP_BANDS.map((b) => (
          <Card key={b.label} className={b.tone === 'good' ? 'border-emerald-500/30' : ''}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold">{b.label}</p>
              <Pill tone={b.tone === 'good' ? 'good' : b.tone === 'bad' ? 'bad' : b.tone === 'warn' ? 'warn' : 'info'}>{b.headline}</Pill>
            </div>
            <div className="space-y-1">
              {b.pros.map((p, i) => <p key={`p${i}`} className="text-[11px] text-emerald-400/90 flex gap-2"><span>+</span><span>{p}</span></p>)}
              {b.cons.map((c, i) => <p key={`c${i}`} className="text-[11px] text-muted-foreground flex gap-2"><span>–</span><span>{c}</span></p>)}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-3">
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-foreground/90"><Lightbulb size={14} className="text-primary" /> Sleep better tonight</p>
        <ul className="space-y-1.5">
          {SLEEP_TIPS.map((t, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-primary">•</span>{t}</li>
          ))}
        </ul>
      </Card>

      {/* History */}
      {sorted.length > 0 && (
        <>
          <SectionTitle title="Recent nights" />
          <Card className="p-2">
            {sorted.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(l.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[11px] text-muted-foreground">{l.hours}h · felt {l.quality}/5</p>
                </div>
                <Pill tone={bandFor(l.hours).tone === 'good' ? 'good' : bandFor(l.hours).tone === 'bad' ? 'bad' : bandFor(l.hours).tone === 'warn' ? 'warn' : 'info'}>
                  {bandFor(l.hours).label}
                </Pill>
                <button onClick={() => dispatch({ type: 'deleteSleep', id: l.id })} className="p-2 text-muted-foreground/50 hover:text-red-400" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
