import { db } from './_lib/db.js'
import { route } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { addDays, dayLabel, userToday, weekStart } from './_lib/dates.js'
import { getStreak, getTodaysWorkout } from './_lib/workouts.js'

export default route({
  GET: async (req, res) => {
    const userId = await requireUserId(req)
    const today = userToday(req)
    const monday = weekStart(today)
    const sql = db()

    const [[user], todaysWorkout, daily, streak] = await Promise.all([
      sql`SELECT full_name, weekly_goal_workouts, weekly_goal_minutes FROM users WHERE id = ${userId}`,
      getTodaysWorkout(sql, userId, today),
      // completed minutes per day for the last 14 days (7 shown + 7 for comparison)
      sql`
        SELECT to_char(d, 'YYYY-MM-DD') AS date,
               COALESCE(SUM(w.duration_minutes), 0)::int AS minutes,
               COUNT(w.id)::int AS workouts
          FROM generate_series(${today}::date - 13, ${today}::date, interval '1 day') AS d
          LEFT JOIN workouts w
            ON w.user_id = ${userId} AND w.status = 'completed' AND w.workout_date = d::date
         GROUP BY d ORDER BY d`,
      getStreak(sql, userId, today),
    ])

    const goalWorkouts = user.weekly_goal_workouts
    const goalMinutes = user.weekly_goal_minutes
    // a "goal day" = a day this week where you trained at least your per-workout share of the weekly minutes
    const dailyTarget = Math.max(1, Math.round(goalMinutes / goalWorkouts))

    const thisWeek = daily.filter((d) => d.date >= monday)
    const last7 = daily.slice(7)
    const prev7Total = daily.slice(0, 7).reduce((s, d) => s + d.minutes, 0)

    res.json({
      firstName: user.full_name.split(' ')[0],
      today,
      todaysWorkout,
      streak,
      activity: last7.map((d) => ({ ...d, day: dayLabel(d.date) })),
      previousWeekMinutes: prev7Total,
      week: {
        workouts: thisWeek.reduce((s, d) => s + d.workouts, 0),
        minutes: thisWeek.reduce((s, d) => s + d.minutes, 0),
        goalDays: thisWeek.filter((d) => d.minutes >= dailyTarget).length,
        goalWorkouts,
        goalMinutes,
        dailyTarget,
      },
    })
  },
})
