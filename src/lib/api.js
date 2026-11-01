// Tiny fetch wrapper for the /api functions. The browser never talks to the database directly.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
  get isOffline() {
    return this.status === 503 || this.status === 0
  }
}

const timezone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
})()

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'X-Timezone': timezone, ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Can’t reach PulseFit. Check your internet connection and try again.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // non-JSON reply: usually the API server isn't running (dev proxy error)
    if (!res.ok) throw new ApiError('The PulseFit server isn’t responding. Please try again in a moment.', 0)
  }
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status, data?.code)
  return data
}
