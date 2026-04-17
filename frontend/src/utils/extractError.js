/**
 * Extract a human-readable error message from an Axios error.
 * Handles FastAPI 422 validation errors (array of {loc, msg, type, ...})
 * as well as plain string detail messages.
 */
export default function extractError(err, fallback = 'Something went wrong') {
  const detail = err?.response?.data?.detail
  if (!detail) return err?.message || fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => {
      const field = d.loc?.slice(-1)[0]
      return field ? `${field}: ${d.msg}` : d.msg
    }).join('; ')
  }
  return fallback
}
