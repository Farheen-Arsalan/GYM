import { db } from './_lib/db.js'
import { route, HttpError } from './_lib/http.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

// GET /api/exercises            -> all exercises
// GET /api/exercises?muscle=Legs -> one muscle group
export default route({
  GET: async (req, res) => {
    const muscle = req.query?.muscle
    if (muscle && muscle !== 'All' && !GROUPS.includes(muscle)) {
      throw new HttpError(400, `Muscle group must be one of: ${GROUPS.join(', ')}`)
    }
    const sql = db()
    const filter = muscle && muscle !== 'All' ? muscle : null
    const exercises = await sql`
      SELECT id, name, muscle_group AS "muscleGroup", sets, reps, difficulty,
             rest_seconds AS "restSeconds", description
        FROM exercises
       WHERE ${filter}::text IS NULL OR muscle_group = ${filter}
       ORDER BY array_position(${GROUPS}::text[], muscle_group), id`
    res.setHeader('Cache-Control', 'public, s-maxage=300')
    res.json({ exercises })
  },
})
