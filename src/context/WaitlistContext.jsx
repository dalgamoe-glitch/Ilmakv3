import { createContext, useContext, useMemo, useState } from 'react'

const WaitlistContext = createContext(null)

// Lets any section open the shared waitlist modal without prop-drilling a
// callback through every intermediate component.
export function WaitlistProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({
      open,
      openWaitlist: () => setOpen(true),
      closeWaitlist: () => setOpen(false),
    }),
    [open],
  )
  return (
    <WaitlistContext.Provider value={value}>
      {children}
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) throw new Error('useWaitlist must be used within WaitlistProvider')
  return ctx
}
