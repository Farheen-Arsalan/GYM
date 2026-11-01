// Local-only: prepares .env before the dev server or db scripts run.
// On Vercel, environment variables come from the project settings instead.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'

const ENV_PATH = path.resolve(process.cwd(), '.env')

const NEON_HELP = `
  ── DATABASE_URL is missing from your .env file ──────────────────────

  Quickest: use the built-in local database. Put this line in .env:
       DATABASE_URL=local

  Or use Neon (free, about 2 minutes):

    1. Go to https://console.neon.tech and sign in (or create a free account).
    2. Create a project (any name, e.g. "pulsefit"); pick the region closest to you.
    3. On the project dashboard, click the "Connect" button (top right).
    4. Leave Branch = main, Database = neondb, keep "Connection pooling" ON.
    5. Copy the connection string. It looks like:
         postgresql://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
    6. Open the .env file in this project folder and paste it after DATABASE_URL=
       (no quotes, no spaces), then save.

  Then run:  npm run db:setup   and after that:  npm run dev
`

function setVar(text, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm')
  return re.test(text) ? text.replace(re, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`
}

export function loadEnv({ requireDatabase = true } = {}) {
  if (!existsSync(ENV_PATH)) {
    writeFileSync(ENV_PATH, readFileSync(path.resolve(process.cwd(), '.env.example'), 'utf8'))
    console.log('  Created .env from .env.example')
  }

  let text = readFileSync(ENV_PATH, 'utf8')
  if (!/^JWT_SECRET=\S+/m.test(text)) {
    text = setVar(text, 'JWT_SECRET', randomBytes(48).toString('base64url'))
    writeFileSync(ENV_PATH, text)
    console.log('  Generated a strong random JWT_SECRET and saved it to .env')
  }

  process.loadEnvFile(ENV_PATH)

  if (requireDatabase && !process.env.DATABASE_URL?.trim()) {
    console.error(NEON_HELP)
    process.exit(1)
  }
  const url = process.env.DATABASE_URL?.trim()
  if (url && url !== 'local' && !/^postgres(ql)?:\/\//.test(url)) {
    console.error('\n  DATABASE_URL in .env should be either "local" or a Postgres connection string starting with postgresql://\n')
    process.exit(1)
  }
}
