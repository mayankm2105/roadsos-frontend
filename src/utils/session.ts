export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('roadsos_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('roadsos_session_id', sessionId)
  }
  return sessionId
}
