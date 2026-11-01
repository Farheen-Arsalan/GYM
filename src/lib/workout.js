const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const SECONDS_PER_SET = 45 // rough time under tension per set, for estimates

export function workoutSummary(workout) {
  const exercises = workout?.exercises ?? []
  const allSets = exercises.flatMap((e) => e.sets)
  const estSeconds = exercises.reduce((s, e) => s + e.sets.length * (SECONDS_PER_SET + e.restSeconds), 0)
  return {
    totalSets: allSets.length,
    doneSets: allSets.filter((s) => s.completed).length,
    focus: [...new Set(exercises.map((e) => e.muscleGroup))].join(' · '),
    difficulty: LEVELS[Math.max(0, ...exercises.map((e) => LEVELS.indexOf(e.difficulty)))],
    estMinutes: Math.max(1, Math.round(estSeconds / 60)),
  }
}
