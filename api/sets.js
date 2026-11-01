import { db } from './_lib/db.js'
import { route, body, intInRange, HttpError } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

// PATCH /api/sets { setId, completed } -> tick / untick one set of the user's own workout.
// Ticking the first set also starts a planned workout.
export default route({
  PATCH: async (req, res) => {
    const userId = await requireUserId(req)
    const b = body(req)
    const setId = intInRange(b.setId, 1, 2 ** 31 - 1, 'setId')
    if (typeof b.completed !== 'boolean') throw new HttpError(400, 'completed must be true or false')
    const sql = db()

    const rows = await sql`
      UPDATE workout_sets s
         SET completed = ${b.completed},
             completed_at = CASE WHEN ${b.completed} THEN now() ELSE NULL END
        FROM workout_exercises we, workouts w
       WHERE s.id = ${setId}
         AND we.id = s.workout_exercise_id
         AND w.id = we.workout_id
         AND w.user_id = ${userId}
         AND w.status <> 'completed'
      RETURNING s.id, s.completed, w.id AS "workoutId", w.status`
    if (!rows.length) throw new HttpError(404, 'We couldn’t find that set — the workout may already be finished.')

    const { workoutId, status } = rows[0]
    let started = null
    if (status === 'planned' && b.completed) {
      ;[started] = await sql`
        UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
         WHERE id = ${workoutId} AND user_id = ${userId}
        RETURNING started_at AS "startedAt"`
    }
    res.json({ set: { id: rows[0].id, completed: rows[0].completed }, workoutId, startedAt: started?.startedAt ?? null })
  },
})
