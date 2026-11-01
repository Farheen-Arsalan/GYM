import { route } from '../_lib/http.js'
import { clearSession } from '../_lib/auth.js'

export default route({
  POST: async (req, res) => {
    clearSession(res)
    res.json({ ok: true })
  },
})
