import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { neon } from '@neondatabase/serverless'

// DATABASE_URL=local  -> embedded Postgres (PGlite) stored in ./.data/pulsefit-db (local dev only)
// DATABASE_URL=postgresql://...neon.tech/...  -> Neon over HTTP (production / Vercel)
export const LOCAL_DB_DIR = path.resolve(process.cwd(), '.data', 'pulsefit-db')

let client
let localPg

export const isLocalDb = () => process.env.DATABASE_URL?.trim() === 'local'

// Tagged-template SQL client. Values are always sent as parameters.
export function db() {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) throw new ConfigError('DATABASE_URL is not set')
  client ??= isLocalDb() ? localClient() : neon(url)
  return client
}

// The shared PGlite instance (one per process; it owns the data folder).
export function getLocalPg() {
  localPg ??= import('@electric-sql/pglite').then(async ({ PGlite }) => {
    mkdirSync(path.dirname(LOCAL_DB_DIR), { recursive: true })
    const pg = new PGlite(LOCAL_DB_DIR)
    await pg.waitReady
    return pg
  })
  return localPg
}

// Same call shape as neon(): sql`SELECT ... ${value}` -> rows
function localClient() {
  return async (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => `${acc}$${i}${part}`)
    const pg = await getLocalPg()
    const { rows } = await pg.query(text, values)
    return rows
  }
}

export class ConfigError extends Error {}

// SQLSTATE classes that mean "couldn't connect / log in", not a bad query.
const CONNECTION_CODES = /^(08|28|3D|53|57P0)/

export function isConnectionError(err) {
  if (err instanceof ConfigError) return true
  if (err?.code && /^[0-9A-Z]{5}$/.test(err.code)) return CONNECTION_CODES.test(err.code)
  // Neon's HTTP proxy reports login/endpoint problems without a SQLSTATE code
  return /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|network|connect|authentication failed|endpoint|does not exist|timed? ?out/i.test(
    `${err?.message} ${err?.cause?.code ?? ''} ${err?.cause?.message ?? ''}`,
  )
}
