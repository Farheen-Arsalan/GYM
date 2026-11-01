// Runs db/schema.sql then db/seed.sql (both idempotent) and returns row counts.
import { readFileSync } from 'node:fs'

const COUNTS_SQL = `
  SELECT (SELECT count(*) FROM exercises)::int AS exercises,
         (SELECT count(*) FROM classes)::int   AS classes,
         (SELECT count(*) FROM classes
           WHERE start_time >= date_trunc('week', now())
             AND start_time <  date_trunc('week', now()) + interval '7 days')::int AS classes_this_week,
         (SELECT count(*) FROM users)::int     AS users`

// `run(sqlText)` must accept multi-statement SQL and resolve to { rows } for the last query.
export async function setupDatabase(run, log = () => {}) {
  for (const file of ['db/schema.sql', 'db/seed.sql']) {
    log(`  Running ${file} … `)
    await run(readFileSync(file, 'utf8'))
    log('done\n')
  }
  const { rows } = await run(COUNTS_SQL)
  return rows[0]
}
