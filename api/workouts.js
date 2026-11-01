import { db } from './_lib/db.js'
import { route, body, intInRange, HttpError } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { userToday } from './_lib/dates.js'
import { getTodaysWorkout, renameWorkout } from './_lib/workouts.js'

// GET    /api/workouts                      -> today's workout (or null)
// POST   /api/workouts  { exerciseId }      -> add an exercise to today's workout
// DELETE /api/workouts?exerciseId=12        -> remove it again
// PATCH  /api/workouts  { workoutId, action: 'start' | 'finish' }
export default route({
  GET: async (req, res) => {
    const userId = await requireUserId(req)
    res.json({ workout: await getTodaysWorkout(db(), userId, userToday(req)) })
  },

  POST: async (req, res) => {
    const userId = await requireUserId(req)
    const exerciseId = intInRange(body(req).exerciseId, 1, 2 ** 31 - 1, 'exerciseId')
    const today = userToday(req)
    const sql = db()

    const [exercise] = await sql`SELECT id, name, sets FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'That exercise doesn’t exist anymore.')

    // find or create today's open workout (a partial unique index keeps it to one)
    await sql`
      INSERT INTO workouts (user_id, name, workout_date)
      VALUES (${userId}, 'Today’s Workout', ${today})
      ON CONFLICT (user_id, workout_date) WHERE status <> 'completed' DO NOTHING`
    const [workout] = await sql`
      SELECT id FROM workouts WHERE user_id = ${userId} AND workout_date = ${today} AND status <> 'completed'`

    // add the exercise and create its sets in one statement
    const added = await sql`
      WITH we AS (
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        VALUES (${workout.id}, ${exercise.id},
                (SELECT COALESCE(MAX(order_index) + 1, 0) FROM workout_exercises WHERE workout_id = ${workout.id}))
        ON CONFLICT (workout_id, exercise_id) DO NOTHING
        RETURNING id
      )
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT we.id, n FROM we, generate_series(1, ${exercise.sets}::int) AS n
      RETURNING workout_exercise_id`
    if (added.length) await renameWorkout(sql, workout.id)

    res.status(added.length ? 201 : 200).json({
      workout: await getTodaysWorkout(sql, userId, today),
      alreadyAdded: !added.length,
    })
  },

  DELETE: async (req, res) => {
    const userId = await requireUserId(req)
    const exerciseId = intInRange(req.query?.exerciseId, 1, 2 ** 31 - 1, 'exerciseId')
    const today = userToday(req)
    const sql = db()

    const removed = await sql`
      DELETE FROM workout_exercises we
       USING workouts w
       WHERE we.workout_id = w.id AND we.exercise_id = ${exerciseId}
         AND w.user_id = ${userId} AND w.workout_date = ${today} AND w.status <> 'completed'
      RETURNING w.id`
    if (!removed.length) throw new HttpError(404, 'That exercise isn’t in today’s workout.')

    // drop the workout entirely if it's now empty and never started
    await sql`
      DELETE FROM workouts w
       WHERE w.id = ${removed[0].id} AND w.status = 'planned'
         AND NOT EXISTS (SELECT 1 FROM workout_exercises WHERE workout_id = w.id)`
    await renameWorkout(sql, removed[0].id)

    res.json({ workout: await getTodaysWorkout(sql, userId, today) })
  },

  PATCH: async (req, res) => {
    const userId = await requireUserId(req)
    const b = body(req)
    const workoutId = intInRange(b.workoutId, 1, 2 ** 31 - 1, 'workoutId')
    const sql = db()

    if (b.action === 'start') {
      await sql`
        UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
         WHERE id = ${workoutId} AND user_id = ${userId} AND status = 'planned'`
    } else if (b.action === 'finish') {
      // duration is measured on the server from started_at (capped at 4h for forgotten workouts)
      const done = await sql`
        UPDATE workouts
           SET status = 'completed',
               completed_at = now(),
               started_at = COALESCE(started_at, now()),
               duration_minutes = LEAST(240, GREATEST(1,
                 CEIL(EXTRACT(EPOCH FROM now() - COALESCE(started_at, now())) / 60)))::int
         WHERE id = ${workoutId} AND user_id = ${userId} AND status <> 'completed'
           AND EXISTS (SELECT 1 FROM workout_sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id
                        WHERE we.workout_id = ${workoutId} AND s.completed)
        RETURNING id`
      if (!done.length) {
        const [w] = await sql`SELECT status FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}`
        if (!w) throw new HttpError(404, 'Workout not found.')
        if (w.status !== 'completed') throw new HttpError(400, 'Tick off at least one set before finishing your workout.')
      }
    } else {
      throw new HttpError(400, 'action must be "start" or "finish"')
    }

    const [w] = await sql`SELECT to_char(workout_date, 'YYYY-MM-DD') AS d FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}`
    if (!w) throw new HttpError(404, 'Workout not found.')
    res.json({ workout: await getTodaysWorkout(sql, userId, w.d) })
  },
})
