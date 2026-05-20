import { useState, useCallback, useEffect } from 'react'

/**
 * A custom hook to manage structural layout and navigation states.
 * Handles desktop collapse/expand toggle and mobile drawer opening/closing.
 */
export function useSidebar() {
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Desktop collapse state (persisted in localStorage for better UX)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  // Sync collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed))
    } catch (e) {
      console.warn('LocalStorage not available for sidebar preference storage', e)
    }
  }, [isCollapsed])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const openMobile = useCallback(() => {
    setIsMobileOpen(true)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return {
    isMobileOpen,
    isCollapsed,
    toggleMobile,
    closeMobile,
    openMobile,
    toggleCollapsed,
  }
}
