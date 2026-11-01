import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { route, body, HttpError } from '../_lib/http.js'
import { setSession } from '../_lib/auth.js'
import { publicUser } from '../_lib/users.js'
import { getStreak } from '../_lib/workouts.js'
import { userToday } from '../_lib/dates.js'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('pulsefit-timing-guard', 10)

export default route({
  POST: async (req, res) => {
    const b = body(req)
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    if (!email || !password) throw new HttpError(400, 'Please enter your email and password.')

    const sql = db()
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
    if (!user || !ok) throw new HttpError(401, 'That email and password don’t match. Please try again.')

    await setSession(res, user.id)
    const streak = await getStreak(sql, user.id, userToday(req))
    res.json({ user: { ...publicUser(user), streak } })
  },
})
