import { RefObject, useEffect } from 'react'
import { useLocation } from 'react-router'

export const useScrollRestoration = (ref: RefObject<HTMLElement | null>) => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname && ref.current) {
      const saved = sessionStorage.getItem(`${location.pathname}-scroll`)

      if (saved) {
        ref.current.scrollTo({
          top: parseInt(saved || '0'),
          behavior: 'instant'
        })
      }
    }
  }, [pathname, ref])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleScroll = () => {
      sessionStorage.setItem(`${pathname}-scroll`, element.scrollTop.toString())
    }

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [pathname, ref])
}
