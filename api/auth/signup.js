import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { route, body, intInRange, HttpError } from '../_lib/http.js'
import { setSession } from '../_lib/auth.js'
import { publicUser, EMAIL_RE } from '../_lib/users.js'

export default route({
  POST: async (req, res) => {
    const b = body(req)
    const fullName = String(b.fullName ?? '').trim()
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')

    if (fullName.length < 2 || fullName.length > 80) throw new HttpError(400, 'Please enter your name (2–80 characters).')
    if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, 'Please enter a valid email address.')
    if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Password must be 8–72 characters.')
    const goalWorkouts = intInRange(b.weeklyGoalWorkouts ?? 4, 1, 14, 'Weekly workouts goal')
    const goalMinutes = intInRange(b.weeklyGoalMinutes ?? 150, 10, 2000, 'Weekly minutes goal')

    const hash = await bcrypt.hash(password, 10)
    const sql = db()
    const rows = await sql`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING *`
    if (!rows.length) throw new HttpError(409, 'An account with this email already exists. Try logging in instead.')

    await setSession(res, rows[0].id)
    res.status(201).json({ user: { ...publicUser(rows[0]), streak: 0 } })
  },
})
