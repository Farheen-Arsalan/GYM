// Local development: runs the /api route files (the same ones Vercel deploys)
// on a small Express server, and starts Vite, which proxies /api to it.
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { createServer } from 'vite'
import { loadEnv } from './env.js'
import { setupDatabase } from './db-setup.js'
import { getLocalPg, isLocalDb, LOCAL_DB_DIR } from '../api/_lib/db.js'

loadEnv()

if (isLocalDb()) {
  // the local database lives in this process, so set it up here (idempotent, takes a moment)
  try {
    const pg = await getLocalPg()
    const counts = await setupDatabase(async (text) => (await pg.exec(text)).at(-1))
    console.log(`\n  DB   local Postgres in ${path.relative(process.cwd(), LOCAL_DB_DIR)} — ${counts.exercises} exercises, ${counts.classes} classes, ${counts.users} users`)
  } catch (err) {
    console.error('\n  Could not open the local database:', err.message)
    console.error('  If another "npm run dev" or "npm run db:setup" is running, stop it and try again.\n')
    process.exit(1)
  }
}

const API_PORT = Number(process.env.API_PORT) || 3001
const API_DIR = path.resolve(process.cwd(), 'api')

// /api/auth/login -> api/auth/login.js (or api/auth/login/index.js), like Vercel.
function resolveRoute(urlPath) {
  const rel = urlPath.replace(/^\/+|\/+$/g, '')
  const segments = rel.split('/')
  // files/folders starting with _ or . are private helpers, never routes
  if (!rel || segments.some((s) => !s || s.startsWith('_') || s.startsWith('.'))) return null
  for (const file of [path.join(API_DIR, `${rel}.js`), path.join(API_DIR, rel, 'index.js')]) {
    if (file.startsWith(API_DIR + path.sep) && existsSync(file)) return file
  }
  return null
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.use('/api', async (req, res) => {
  const file = resolveRoute(req.path)
  if (!file) return res.status(404).json({ error: 'Not found' })
  try {
    // mtime query string = route file edits are picked up without a restart
    const mod = await import(`${pathToFileURL(file).href}?v=${statSync(file).mtimeMs}`)
    await mod.default(req, res)
  } catch (err) {
    console.error(`[api] ${req.method} ${req.originalUrl} crashed:`, err)
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
  }
})

// Express's own JSON parser rejects bad bodies before reaching the route
app.use((err, req, res, _next) => {
  res.status(err.status || 400).json({ error: 'That request looked malformed. Please try again.' })
})

await new Promise((resolve, reject) => {
  const server = app.listen(API_PORT, resolve)
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') console.error(`\n  Port ${API_PORT} is busy — is another "npm run dev" still running?\n`)
    reject(e)
  })
})
console.log(`\n  API  ready on http://localhost:${API_PORT}/api  (files from ./api)`)

const vite = await createServer()
await vite.listen()
vite.printUrls()
