import type { ExercisePlan, TimeOfDay } from '../types';

// ─── Workout plan — extracted from Weekly_Workout_Plan_Mens_Edition.pdf ───
// index 0 = Sunday … 6 = Saturday (JS getDay)
export const WEEKLY_PLAN: { day: string; rest: boolean; exercises: ExercisePlan[]; tip?: string }[] = [
  { day: 'Sunday', rest: true, exercises: [] },
  {
    day: 'Monday',
    rest: false,
    exercises: [
      { name: 'Squat', sets: '4 × 8', targets: 'Quads · Glutes · Hamstrings · Core' },
      { name: 'Bench Press', sets: '4 × 8', targets: 'Chest · Front Delts · Triceps' },
      { name: 'Dumbbell Row', sets: '3 × 12', targets: 'Lats · Rhomboids · Traps · Biceps' },
      { name: 'Cable Lateral Raise', sets: '4 × 15', targets: 'Side Delts' },
      { name: 'Face Pull', sets: '4 × 15', targets: 'Rear Delts · Traps · Rhomboids' },
      { name: 'Triceps Pushdown', sets: '3 × 15', targets: 'Triceps' },
      { name: 'Barbell Curl', sets: '4 × 10', targets: 'Biceps · Forearms' },
      { name: 'Calf Raises', sets: '4 × 20', targets: 'Calves' },
    ],
  },
  {
    day: 'Tuesday',
    rest: false,
    exercises: [
      { name: 'Pull Up (or Lat Pulldown)', sets: '4 × 5 / 4 × 12', targets: 'Lats · Rhomboids · Biceps' },
      { name: 'Dumbbell Overhead Press', sets: '3 × 12', targets: 'Shoulders · Triceps · Traps' },
      { name: 'Overhead Triceps Extension', sets: '4 × 12', targets: 'Triceps' },
      { name: 'Hammer Curl', sets: '4 × 10', targets: 'Brachialis · Biceps · Forearms' },
      { name: 'Machine Reverse Fly', sets: '4 × 15', targets: 'Rear Delts · Traps' },
      { name: 'Lateral Raise', sets: '4 × 10', targets: 'Side Delts' },
      { name: 'Barbell / Trap Bar Shrug', sets: '4 × 10', targets: 'Traps' },
      { name: 'Hollow Body Hold', sets: '3 × 60 sec', targets: 'Core · Hip Flexors' },
    ],
  },
  { day: 'Wednesday', rest: true, exercises: [] },
  {
    day: 'Thursday',
    rest: false,
    exercises: [
      { name: 'Goblet Squat', sets: '4 × 12', targets: 'Quads · Glutes · Adductors · Core' },
      { name: 'Overhead Press', sets: '3 × 8', targets: 'Shoulders · Triceps · Traps' },
      { name: 'Chin Up', sets: '3 × AMRAP', targets: 'Lats · Biceps' },
      { name: 'Incline Dumbbell Bench', sets: '3 × 12', targets: 'Upper Chest · Front Delts · Triceps' },
      { name: 'Dumbbell Curl', sets: '4 × 15', targets: 'Biceps · Forearms' },
      { name: 'Wrist Curl', sets: '2 × 12', targets: 'Forearm Flexors' },
      { name: 'Farmer Walk', sets: '4 × 30 sec', targets: 'Traps · Grip · Core · Glutes' },
    ],
    tip: 'Keep rest periods tight: 60–90s between isolation sets, up to 3 min on heavy compounds. Control the lowering phase — ~2 seconds down on every rep.',
  },
  {
    day: 'Friday',
    rest: false,
    exercises: [
      { name: 'Barbell Row', sets: '4 × 8', targets: 'Lats · Rhomboids · Traps · Biceps' },
      { name: 'Close Grip Bench Press', sets: '3 × 12', targets: 'Triceps · Inner Chest' },
      { name: 'Lateral Raise', sets: '4 × 12', targets: 'Side Delts' },
      { name: 'Cable Reverse Fly', sets: '4 × 15', targets: 'Rear Delts' },
      { name: 'Dumbbell Curl', sets: '3 × 10', targets: 'Biceps · Forearms' },
      { name: 'Dumbbell Shrug', sets: '4 × 15', targets: 'Traps' },
      { name: 'Hanging Knee Raise', sets: '3 × AMRAP', targets: 'Core · Hip Flexors · Grip' },
    ],
    tip: 'Keep rest periods tight: 60–90s between isolation sets, up to 3 min on heavy compounds. Control the lowering phase — ~2 seconds down on every rep.',
  },
  {
    day: 'Saturday',
    rest: false,
    exercises: [
      { name: 'Squat', sets: '4 × 8', targets: 'Quads · Glutes · Hamstrings · Core' },
      { name: 'Calf Raises', sets: '4 × 20', targets: 'Calves' },
      { name: 'Push Ups', sets: '3 × 20', targets: 'Chest · Front Delts · Triceps · Core' },
      { name: 'Triceps Pushdown', sets: '3 × 15', targets: 'Triceps' },
      { name: 'Calf Raises (burnout)', sets: '2 × AMRAP', targets: 'Calves' },
      { name: 'Squat (finisher)', sets: '1 × AMRAP', targets: 'Quads · Glutes · Hamstrings · Core' },
    ],
  },
];

// ─── Sleep ───
export interface SleepBand {
  max: number; // upper bound (exclusive), Infinity for last
  label: string;
  tone: 'bad' | 'warn' | 'good' | 'info';
  headline: string;
  pros: string[];
  cons: string[];
}

export const SLEEP_BANDS: SleepBand[] = [
  {
    max: 6,
    label: 'Under 6h',
    tone: 'bad',
    headline: 'Critical sleep debt',
    pros: ['More awake hours — but at a steep price'],
    cons: [
      'Two weeks of 6h nights impairs you as much as two nights with zero sleep — and you barely notice it happening (Van Dongen et al., 2003)',
      'Attention lapses, slower reactions, poor memory consolidation',
      'Elevated cortisol and hunger hormones — cravings and fat gain risk',
      'Linked to higher risk of obesity, diabetes, heart disease and depression (AASM/NSF consensus)',
      'Weakened immune system — you get sick more often',
    ],
  },
  {
    max: 7,
    label: '6 – 7h',
    tone: 'warn',
    headline: 'Below the recommended floor',
    pros: ['You can function — workouts are still possible'],
    cons: [
      'Below the 7h minimum recommended for adults (AASM / CDC / Sleep Foundation)',
      'Chronic short sleepers consistently underestimate how impaired they are',
      'Recovery between gym sessions is slower — muscle repair happens mostly during sleep',
      'Mood and stress resilience take a quiet hit',
    ],
  },
  {
    max: 9,
    label: '7 – 9h',
    tone: 'good',
    headline: 'The optimal zone',
    pros: [
      'Meets the adult recommendation of 7+ hours — the range tied to the best health outcomes',
      'Best memory consolidation, focus and reaction time',
      'Lowest all-cause mortality in large cohort studies — the risk curve bottoms out around 7h',
      'Muscle recovery, growth hormone release and immune function all peak',
      'Better mood, stress resilience and appetite control',
    ],
    cons: ['None — this is the target range. Keep it consistent, even on weekends'],
  },
  {
    max: Infinity,
    label: 'Over 9h',
    tone: 'info',
    headline: 'Possibly oversleeping',
    pros: ['Fine occasionally — illness, heavy training blocks and catching up on debt are valid reasons'],
    cons: [
      'Regularly sleeping 9h+ is associated in studies with higher health risks (U-shaped curve)',
      'Can leave you groggier than 7–8h if it disrupts your rhythm',
      'If this keeps happening, it may signal poor sleep quality or an underlying issue',
    ],
  },
];

export const SLEEP_TIPS = [
  'Keep a consistent bedtime and wake time — even on weekends. Rhythm beats duration.',
  'Dark, cool room (around 18°C / 65°F).',
  'No heavy meals or intense screens in the last hour.',
  'Morning light exposure anchors your body clock.',
  'Caffeine after early afternoon steals deep sleep hours later.',
];

// ─── Semen retention (anecdotal — clearly labelled) ───
export const RETENTION_MILESTONES = [
  {
    day: 1,
    title: 'The starting line',
    text: 'Day one is a decision, not a streak. Every long streak you admire started here.',
  },
  {
    day: 3,
    title: 'Urge management begins',
    text: 'The first days are usually the hardest — habit loops fight back. Push through and each day gets easier. (community reports)',
  },
  {
    day: 7,
    title: 'The week-one surge',
    text: 'A small 2003 study measured a temporary testosterone spike around day 7 of abstinence (back to baseline after). Community members report a matching boost in energy, confidence and gym drive this week.',
  },
  {
    day: 14,
    title: 'Fog starts lifting',
    text: 'Frequently reported around week two: clearer thinking, more stable mood, less compulsive scrolling. Some people hit a temporary low-motivation "flatline" instead — community consensus says it passes.',
  },
  {
    day: 30,
    title: 'The month mark',
    text: 'In NoFap community surveys, most respondents report better self-control and stronger confidence by ~30 days; a large share report improved emotional stability. Self-discipline starts compounding.',
  },
  {
    day: 60,
    title: 'Discipline becomes identity',
    text: 'Two months in, practitioners commonly describe the practice as "just who I am now" — urges weaken, energy gets redirected into training, work and purpose.',
  },
  {
    day: 90,
    title: 'The "reboot"',
    text: 'The classic reboot milestone: reported deep focus, reduced anxiety, sharper presence, and habits rebuilt around goals instead of compulsion. Many keep going — it becomes a lifestyle. (anecdotal)',
  },
];

export const RETENTION_DISCLAIMER =
  'The benefits on this screen are anecdotal reports from NoFap / semen-retention communities and small studies — not established medical science. Track how you feel and let your own data be the judge.';

// ─── Meditation ───
export const MEDITATION_BENEFITS = [
  {
    minDays: 1,
    title: 'Immediate',
    text: 'Even a single session measurably reduces anxiety. Just 15 minutes can shift you to the relaxation level of a vacation day (2020 study, J. of Positive Psychology).',
  },
  {
    minDays: 7,
    title: 'After ~1 week',
    text: 'Brief training (as little as 4 days) improves sustained attention, working memory and visuo-spatial processing, while cutting anxiety and mental fatigue.',
  },
  {
    minDays: 30,
    title: 'After ~1 month',
    text: 'An 8-week mindfulness program reduced anxiety by ~30% — comparable to conventional treatment, per a JAMA Psychiatry study; another found mindfulness nearly as effective as the antidepressant escitalopram for anxiety disorders.',
  },
  {
    minDays: 90,
    title: 'Long term',
    text: 'Long-term meditators show increased cortical folding (faster information processing) and better-preserved grey matter with age (UCLA, 2012). Consistent practice also lowers inflammation and raises stress resilience.',
  },
];

export const MEDITATION_KINDS = ['Breath awareness', 'Guided', 'Mindfulness / body scan', 'Moving / walking', 'Other'];

// ─── Reading ───
export const READING_CATEGORIES: Record<string, { label: string; benefits: string[] }> = {
  fiction: {
    label: 'Fiction',
    benefits: [
      'Narrative fiction builds empathy and theory of mind — understanding other people\'s inner worlds',
      'Vocabulary and language instincts grow passively',
      'Sustained attention span trains like a muscle',
    ],
  },
  nonfiction: {
    label: 'Non-fiction',
    benefits: [
      'Direct knowledge compounding — every session makes you more capable than yesterday',
      'Better conversations, decisions and frameworks for thinking',
      'Reading for as little as ~6 minutes has been shown to reduce stress',
    ],
  },
  selfdev: {
    label: 'Self-development',
    benefits: [
      'Mindset reinforcement — you absorb the identity you are trying to build',
      'Practical strategies surface right when you need them',
      'Pairs powerfully with meditation and discipline work',
    ],
  },
  biography: {
    label: 'Biography / history',
    benefits: [
      'Pattern-matching from real lives — you inherit decades of others\' experience in hours',
      'Perspective and motivation: your struggles have been survived before',
      'Sharper judgment about people, power and decisions',
    ],
  },
  other: {
    label: 'Other',
    benefits: [
      'Any sustained reading trains focus and deepens knowledge',
      'Screen-free time before bed also protects your sleep',
    ],
  },
};

// ─── Chess ───
export const CHESS_BENEFITS = [
  {
    minDays: 1,
    title: 'Every session',
    text: 'A game of chess engages both hemispheres — logic and analytics on the left, creativity and pattern holistics on the right. One game is a full workout for planning, working memory and concentration.',
  },
  {
    minDays: 7,
    title: 'Consistent week',
    text: 'In one study, 30 minutes of chess a day for 6 months improved children\'s attention span by ~50% — and the gains transferred to schoolwork. Sustained focus is the first thing regular play trains.',
  },
  {
    minDays: 30,
    title: 'Consistent month',
    text: 'University of La Laguna (Spain): students doing 2h of chess per week improved working memory by 22% in one semester (vs 8% for controls). A 2016 study in Intelligence linked 3 months of chess to improved IQ scores.',
  },
  {
    minDays: 90,
    title: 'Long term',
    text: 'Regular chess is linked to stronger problem-solving under pressure, better planning, and long-term brain health — mentally stimulating activities are associated with lower cognitive-decline risk later in life.',
  },
];

export const CHESS_GAP_WARNINGS = [
  { days: 2, text: '2+ days without chess: your tactical pattern recall is starting to fade.' },
  { days: 4, text: '4+ days off: calculation speed and board vision are noticeably duller. A 15-min puzzle set brings it back fast.' },
  { days: 7, text: 'A week away: openings and patterns get rusty — "use it or lose it" applies hard to chess. Play one game today.' },
];

export const HABIT_GAP_WARNINGS: Record<string, { days: number; text: string }[]> = {
  meditation: [
    { days: 2, text: '2 days without meditation: stress and reactivity start creeping back. Even 5 minutes resets the day.' },
    { days: 4, text: '4 days off: attention gains begin to decay. Sit for 10 minutes — future you will feel it.' },
  ],
  reading: [
    { days: 2, text: '2 days without reading: the habit is colder than you think. Ten pages keeps the chain alive.' },
    { days: 4, text: '4 days off: momentum is fading. Read before bed tonight — your sleep will thank you too.' },
  ],
};

export const TIME_OF_DAY_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning (5–11)',
  afternoon: 'Afternoon (11–17)',
  evening: 'Evening (17–22)',
  night: 'Night (22–5)',
};

export function timeOfDayFromDate(d: Date): TimeOfDay {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

// Vigorous weight training ≈ 5–6 METs. Approximation, clearly labelled as such.
export function estimateCalories(weightKg: number, minutes: number): number {
  const met = 5.5;
  return Math.round(met * weightKg * (minutes / 60));
}

export const CONGRATS_MESSAGES: Record<string, string> = {
  'gym-3week': '3+ workouts this week — your consistency is compounding. Muscle is being built one session at a time.',
  'gym-4week': '4+ workouts this week — elite consistency. This is how physiques are made.',
  'sleep-week-good': 'A full week averaging 7–9h of sleep — recovery, hormones and focus are all operating at their peak.',
  'meditate-7': '7 days of meditation — anxiety down, attention up. You are literally reshaping your brain.',
  'meditate-30': '30 days of meditation — this is now a practice, not a phase. JAMA-level results territory.',
  'read-7': '7 days of reading — knowledge is compounding. Readers finish the year as different people.',
  'read-30': '30 days of reading — a genuine identity-level habit. Keep feeding your mind.',
  'chess-7': '7 days of chess — your pattern recognition and calculation are sharpening daily.',
  'chess-30': '30 days of chess — working-memory training in disguise. The board is your second gym.',
  'retention-7': '7 days of retention — the week-one surge. Channel the energy into your training.',
  'retention-30': '30 days of retention — a full month of self-mastery. Confidence and discipline are compounding.',
  'retention-90': '90 days — the full "reboot". What you have built is identity, not just a streak. Legendary discipline.',
};
