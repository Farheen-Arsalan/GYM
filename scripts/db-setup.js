// npm run db:setup — creates tables (db/schema.sql) then loads sample data (db/seed.sql).
// Both files are idempotent, so running this again never creates duplicates.
import net from 'node:net'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { loadEnv } from '../server/env.js'
import { setupDatabase } from '../server/db-setup.js'
import { getLocalPg, isLocalDb, LOCAL_DB_DIR } from '../api/_lib/db.js'

loadEnv()
const log = (s) => process.stdout.write(s)

// the local database folder can only be opened by one process at a time
const portBusy = (port) =>
  new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1')
    socket.once('connect', () => (socket.destroy(), resolve(true)))
    socket.once('error', () => resolve(false))
  })

try {
  let counts
  if (isLocalDb()) {
    if (await portBusy(Number(process.env.API_PORT) || 3001)) {
      console.error('\n  "npm run dev" is running and is using the local database.')
      console.error('  It already sets the database up on start, so you don’t need this — or stop it (Ctrl+C) and run db:setup again.\n')
      process.exit(1)
    }
    console.log(`  Using the local database in ${LOCAL_DB_DIR}`)
    const pg = await getLocalPg()
    counts = await setupDatabase(async (text) => (await pg.exec(text)).at(-1), log)
    await pg.close()
  } else {
    if (globalThis.WebSocket) neonConfig.webSocketConstructor = globalThis.WebSocket
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    try {
      counts = await setupDatabase((text) => pool.query(text), log) // multi-statement, simple query protocol
    } finally {
      await pool.end()
    }
  }
  console.log('\n  Row counts:')
  console.table(counts)
} catch (err) {
  console.error('\n\n  Database setup failed:', err.message)
  if (!err.code || /^(08|28|3D)/.test(err.code)) {
    console.error('  This usually means the database could not be reached. Check DATABASE_URL in .env:')
    console.error('  use "local" for the built-in local database, or the full connection string from the Neon dashboard.')
  }
  process.exitCode = 1
}
