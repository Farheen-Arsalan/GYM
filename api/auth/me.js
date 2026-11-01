import { db } from '../_lib/db.js'
import { route } from '../_lib/http.js'
import { AuthError, clearSession, requireUserId } from '../_lib/auth.js'
import { publicUser } from '../_lib/users.js'
import { getStreak } from '../_lib/workouts.js'
import { userToday } from '../_lib/dates.js'

export default route({
  GET: async (req, res) => {
    const userId = await requireUserId(req)
    const sql = db()
    const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (!user) {
      clearSession(res) // account was deleted
      throw new AuthError()
    }
    const streak = await getStreak(sql, userId, userToday(req))
    res.json({ user: { ...publicUser(user), streak } })
  },
})
