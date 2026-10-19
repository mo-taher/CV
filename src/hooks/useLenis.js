import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion'

export const LenisContext = createContext({ current: null })

// Weighted smooth scroll, driven by the same ticker as GSAP so pinned scenes never drift
export function useLenisSetup(enabled) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled) return undefined
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true })
    ref.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      ref.current = null
    }
  }, [enabled])
  return ref
}

export function useLenis() {
  return useContext(LenisContext)
}

export function scrollToTarget(lenisRef, target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenisRef?.current) lenisRef.current.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: 'smooth' })
}
