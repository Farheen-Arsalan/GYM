import { db } from './_lib/db.js'
import { route } from './_lib/http.js'

// Public landing-page numbers (aggregate counts only, no personal data).
export default route({
  GET: async (req, res) => {
    const sql = db()
    const [row] = await sql`
      SELECT (SELECT count(*) FROM users)::int AS members,
             (SELECT count(*) FROM workouts WHERE status = 'completed')::int AS "workoutsCompleted",
             (SELECT count(*) FROM classes
               WHERE start_time >= date_trunc('week', now())
                 AND start_time <  date_trunc('week', now()) + interval '7 days')::int AS "classesThisWeek"`
    res.json(row)
  },
})
