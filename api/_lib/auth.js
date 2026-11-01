import { SignJWT, jwtVerify } from 'jose'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export class AuthError extends Error {
  status = 401
  constructor(message = 'Please log in to continue.') {
    super(message)
  }
}

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new Error('JWT_SECRET is missing or too short')
  return new TextEncoder().encode(s)
}

function cookieHeader(value, maxAge) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

export async function setSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', cookieHeader(token, MAX_AGE))
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', cookieHeader('', 0))
}

function readCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

// Returns the logged-in user's id, or null.
export async function getUserId(req) {
  const token = readCookie(req, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export async function requireUserId(req) {
  const id = await getUserId(req)
  if (!id) throw new AuthError()
  return id
}
