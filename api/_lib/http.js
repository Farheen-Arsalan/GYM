import { isConnectionError } from './db.js'
import { AuthError } from './auth.js'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Wraps a Vercel-style handler: method routing + friendly JSON errors.
// usage: export default route({ GET: async (req, res) => {...}, POST: ... })
export function route(methods) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const fn = methods[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError || err instanceof AuthError) {
        return res.status(err.status).json({ error: err.message })
      }
      if (isConnectionError(err)) {
        console.error('[api] database unreachable:', err.message)
        return res.status(503).json({
          error: 'We can’t reach the PulseFit database right now. Check your connection and try again in a moment.',
          code: 'DB_UNREACHABLE',
        })
      }
      console.error(`[api] ${req.method} ${req.url} failed:`, err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  }
}

export function body(req) {
  const b = req.body
  if (b && typeof b === 'object') return b
  if (typeof b === 'string' && b) {
    try {
      return JSON.parse(b)
    } catch {
      throw new HttpError(400, 'Request body must be valid JSON')
    }
  }
  return {}
}

export function intInRange(value, min, max, label) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${label} must be a whole number between ${min} and ${max}`)
  return n
}
