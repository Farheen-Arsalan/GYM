// Shared workout queries. Every query is scoped by user_id.
import { addDays } from './dates.js'

// Today's workout for a user: the open (unfinished) one if any, otherwise the
// most recently completed one. Includes exercises and their sets.
export async function getTodaysWorkout(sql, userId, today) {
  const rows = await sql`
    SELECT w.id, w.name, w.status, w.duration_minutes AS "durationMinutes",
           w.started_at AS "startedAt", w.completed_at AS "completedAt",
           to_char(w.workout_date, 'YYYY-MM-DD') AS "workoutDate",
           COALESCE((
             SELECT json_agg(json_build_object(
                      'workoutExerciseId', we.id,
                      'exerciseId', e.id,
                      'name', e.name,
                      'muscleGroup', e.muscle_group,
                      'reps', e.reps,
                      'difficulty', e.difficulty,
                      'restSeconds', e.rest_seconds,
                      'sets', (SELECT json_agg(json_build_object('id', s.id, 'setNumber', s.set_number, 'completed', s.completed)
                                               ORDER BY s.set_number)
                                 FROM workout_sets s WHERE s.workout_exercise_id = we.id)
                    ) ORDER BY we.order_index)
               FROM workout_exercises we
               JOIN exercises e ON e.id = we.exercise_id
              WHERE we.workout_id = w.id
           ), '[]'::json) AS exercises
      FROM workouts w
     WHERE w.user_id = ${userId} AND w.workout_date = ${today}
     ORDER BY (w.status <> 'completed') DESC, w.id DESC
     LIMIT 1`
  return rows[0] ?? null
}

// Name a workout after its muscle groups, e.g. "Chest & Arms Workout".
export async function renameWorkout(sql, workoutId) {
  const rows = await sql`
    SELECT DISTINCT e.muscle_group AS g
      FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
     WHERE we.workout_id = ${workoutId}
     ORDER BY 1`
  const groups = rows.map((r) => r.g)
  const name =
    groups.length === 0 ? 'Today’s Workout'
      : groups.length > 3 ? 'Full Body Workout'
        : `${groups.join(' & ')} Workout`
  await sql`UPDATE workouts SET name = ${name} WHERE id = ${workoutId}`
}

// Consecutive days (ending today, or yesterday if today isn't done yet) with a completed workout.
export function computeStreak(dates, today) {
  const done = new Set(dates)
  let day = done.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (done.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}

export async function getStreak(sql, userId, today) {
  const rows = await sql`
    SELECT DISTINCT to_char(workout_date, 'YYYY-MM-DD') AS d
      FROM workouts
     WHERE user_id = ${userId} AND status = 'completed' AND workout_date <= ${today}
     ORDER BY 1 DESC
     LIMIT 400`
  return computeStreak(rows.map((r) => r.d), today)
}
