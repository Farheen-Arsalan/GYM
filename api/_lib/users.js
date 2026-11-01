// Public shape of a user row (never includes password_hash).
export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    weeklyGoalWorkouts: row.weekly_goal_workouts,
    weeklyGoalMinutes: row.weekly_goal_minutes,
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
