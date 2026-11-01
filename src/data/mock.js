// Sample data for the screens not yet backed by the database
// (Progress, Classes, Profile, landing illustration). Real data comes from /api.

export const user = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  handle: '@alexlifts',
  initials: 'AR',
  membership: 'Pulse Elite',
  memberSince: 'March 2024',
  homeGym: 'PulseFit Downtown',
  level: 23,
  xp: 7420,
  nextLevelXp: 9000,
  streak: 12,
  bestStreak: 31,
  totalWorkouts: 286,
  totalHours: 241,
  weight: '78 kg',
  height: '180 cm',
  goal: 'Build strength & lean muscle',
}

export const weeklyActivity = [
  { day: 'Mon', minutes: 52, calories: 480 },
  { day: 'Tue', minutes: 38, calories: 350 },
  { day: 'Wed', minutes: 0, calories: 0 },
  { day: 'Thu', minutes: 61, calories: 590 },
  { day: 'Fri', minutes: 45, calories: 410 },
  { day: 'Sat', minutes: 18, calories: 160 },
  { day: 'Sun', minutes: 0, calories: 0 },
]

export const todaysWorkout = {
  id: 'push-power',
  name: 'Push Power',
  focus: 'Chest · Shoulders · Triceps',
  duration: 48,
  calories: 420,
  difficulty: 'Intermediate',
  coach: 'Coach Jordan',
  exercises: [
    { id: 'bench', name: 'Barbell Bench Press', sets: 4, reps: 8, weight: '70 kg', rest: 90 },
    { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: '24 kg', rest: 75 },
    { id: 'ohp', name: 'Overhead Press', sets: 3, reps: 8, weight: '42 kg', rest: 90 },
    { id: 'dips', name: 'Weighted Dips', sets: 3, reps: 12, weight: '+10 kg', rest: 60 },
    { id: 'pushdown', name: 'Cable Triceps Pushdown', sets: 3, reps: 15, weight: '25 kg', rest: 45 },
  ],
}

export const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export const strengthHistory = [
  { month: 'May', bench: 60, squat: 85, deadlift: 120 },
  { month: 'Jun', bench: 62.5, squat: 90, deadlift: 130 },
  { month: 'Jul', bench: 65, squat: 97.5, deadlift: 140 },
  { month: 'Aug', bench: 67.5, squat: 100, deadlift: 150 },
  { month: 'Sep', bench: 70, squat: 107.5, deadlift: 160 },
  { month: 'Oct', bench: 75, squat: 115, deadlift: 172.5 },
]

export const personalRecords = [
  { id: 'dl', lift: 'Deadlift', value: 180, unit: 'kg', date: 'Oct 18', delta: 10, tier: 'gold' },
  { id: 'sq', lift: 'Back Squat', value: 120, unit: 'kg', date: 'Oct 9', delta: 5, tier: 'gold' },
  { id: 'bp', lift: 'Bench Press', value: 80, unit: 'kg', date: 'Oct 2', delta: 2.5, tier: 'silver' },
  { id: 'pu', lift: 'Pull-Ups', value: 15, unit: 'reps', date: 'Sep 27', delta: 3, tier: 'silver' },
  { id: '5k', lift: '5K Run', value: '22:41', unit: 'min', date: 'Sep 14', delta: null, tier: 'bronze' },
  { id: 'pl', lift: 'Plank Hold', value: '3:20', unit: 'min', date: 'Aug 30', delta: null, tier: 'bronze' },
]

export const classTypes = {
  // colours come from CSS variables so they adapt to light/dark mode (see index.css)
  Yoga: { color: 'rgb(var(--type-yoga))', soft: 'rgb(var(--type-yoga) / 0.14)' },
  HIIT: { color: 'rgb(var(--type-hiit))', soft: 'rgb(var(--type-hiit) / 0.14)' },
  Spin: { color: 'rgb(var(--type-spin))', soft: 'rgb(var(--type-spin) / 0.14)' },
  Boxing: { color: 'rgb(var(--type-boxing))', soft: 'rgb(var(--type-boxing) / 0.14)' },
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classSchedule = {
  Mon: [
    { id: 'm1', type: 'Yoga', title: 'Sunrise Flow', time: '07:00', duration: 45, coach: 'Maya Chen', spots: 6, capacity: 20 },
    { id: 'm2', type: 'HIIT', title: 'Burn 30', time: '12:15', duration: 30, coach: 'Jordan Blake', spots: 2, capacity: 16 },
    { id: 'm3', type: 'Boxing', title: 'Fight Club Fundamentals', time: '18:30', duration: 60, coach: 'Dre Okafor', spots: 9, capacity: 14 },
  ],
  Tue: [
    { id: 't1', type: 'Spin', title: 'Rhythm Ride', time: '06:30', duration: 45, coach: 'Lena Park', spots: 0, capacity: 24 },
    { id: 't2', type: 'Yoga', title: 'Power Vinyasa', time: '17:45', duration: 60, coach: 'Maya Chen', spots: 11, capacity: 20 },
  ],
  Wed: [
    { id: 'w1', type: 'HIIT', title: 'Tabata Thunder', time: '07:00', duration: 30, coach: 'Jordan Blake', spots: 5, capacity: 16 },
    { id: 'w2', type: 'Spin', title: 'Climb & Sprint', time: '12:00', duration: 45, coach: 'Lena Park', spots: 8, capacity: 24 },
    { id: 'w3', type: 'Boxing', title: 'Heavy Bag Rounds', time: '19:00', duration: 45, coach: 'Dre Okafor', spots: 1, capacity: 14 },
  ],
  Thu: [
    { id: 'th1', type: 'Yoga', title: 'Mobility Reset', time: '08:00', duration: 40, coach: 'Sana Ali', spots: 14, capacity: 20 },
    { id: 'th2', type: 'HIIT', title: 'Engine Builder', time: '18:00', duration: 45, coach: 'Jordan Blake', spots: 3, capacity: 16 },
  ],
  Fri: [
    { id: 'f1', type: 'Spin', title: 'Friday Night Ride', time: '18:00', duration: 50, coach: 'Lena Park', spots: 12, capacity: 24 },
    { id: 'f2', type: 'Boxing', title: 'Pads & Power', time: '19:15', duration: 60, coach: 'Dre Okafor', spots: 4, capacity: 14 },
  ],
  Sat: [
    { id: 's1', type: 'HIIT', title: 'Weekend Warrior', time: '09:00', duration: 45, coach: 'Jordan Blake', spots: 7, capacity: 20 },
    { id: 's2', type: 'Yoga', title: 'Slow Flow & Stretch', time: '10:30', duration: 60, coach: 'Sana Ali', spots: 10, capacity: 20 },
  ],
  Sun: [],
}

export const achievements = [
  { id: 'streak', name: 'On Fire', desc: '10-day workout streak', icon: 'Flame', unlocked: true },
  { id: 'early', name: 'Early Bird', desc: '20 workouts before 8am', icon: 'Sunrise', unlocked: true },
  { id: 'iron', name: 'Iron Club', desc: '1,000 kg total lifted in a session', icon: 'Dumbbell', unlocked: true },
  { id: 'pr', name: 'PR Machine', desc: 'Set 5 personal records', icon: 'Trophy', unlocked: true },
  { id: 'class', name: 'Social Sweat', desc: 'Attend 25 classes', icon: 'Users', unlocked: true },
  { id: 'cardio', name: 'Cardio King', desc: 'Burn 50,000 kcal', icon: 'HeartPulse', unlocked: false, progress: 72 },
  { id: 'century', name: 'Centurion', desc: '100-day streak', icon: 'Crown', unlocked: false, progress: 31 },
  { id: 'night', name: 'Night Owl', desc: '20 workouts after 9pm', icon: 'Moon', unlocked: false, progress: 45 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Strength does not come from the body. It comes from the will.', author: 'Arnold Schwarzenegger' },
  { text: 'Don’t count the days. Make the days count.', author: 'Muhammad Ali' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Hard work beats talent when talent doesn’t work hard.', author: 'Tim Notke' },
]

export function quoteOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  return quotes[dayOfYear % quotes.length]
}

export const features = [
  { icon: 'Dumbbell', title: 'Smart workout plans', desc: 'Programs that adapt to your strength, schedule and recovery.' },
  { icon: 'Timer', title: 'Live workout mode', desc: 'Rest timers, set tracking and a little celebration when you finish.' },
  { icon: 'TrendingUp', title: 'Progress you can see', desc: 'Strength curves, PR trophies and weekly activity at a glance.' },
  { icon: 'Calendar', title: 'Book classes in a tap', desc: 'Yoga, HIIT, Spin and Boxing — see spots left in real time.' },
]
