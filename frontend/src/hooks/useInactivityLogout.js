import { useEffect, useRef, useCallback } from 'react'

const INACTIVITY_MS = 10 * 60 * 1000  // 10 minutes

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

/**
 * Calls onLogout() after INACTIVITY_MS of no user activity.
 * Timer resets on any mouse/keyboard/touch/scroll event.
 */
export default function useInactivityLogout(onLogout, enabled = true) {
  const timerRef = useRef(null)
  const onLogoutRef = useRef(onLogout)
  onLogoutRef.current = onLogout

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onLogoutRef.current()
    }, INACTIVITY_MS)
  }, [])

  useEffect(() => {
    if (!enabled) return

    resetTimer()
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer))
    }
  }, [enabled, resetTimer])
}
