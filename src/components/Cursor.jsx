import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'

// A small amber dot with a trailing ring that grows and labels itself over things you can open
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })
    let forced = null
    let hoverLabel = null
    let hidden = false

    const apply = () => {
      const text = forced ?? hoverLabel
      if (hidden) {
        gsap.to(ring, { scale: 0, opacity: 0, duration: 0.3 })
        return
      }
      if (text !== null && text !== undefined) {
        label.textContent = text
        gsap.to(ring, { scale: text ? 2.6 : 1.8, opacity: 1, duration: 0.4, ease: 'power3.out' })
        gsap.to(label, { opacity: text ? 1 : 0, duration: 0.25 })
      } else {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' })
        gsap.to(label, { opacity: 0, duration: 0.2 })
      }
    }

    const move = (e) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e) => {
      const hide = e.target.closest?.('[data-cursor="hide"]')
      const hit = e.target.closest?.('a, button, [data-cursor]:not([data-cursor="hide"])')
      hidden = !!hide && !hit
      hoverLabel = hit ? (hit.dataset.cursor ?? '') : null
      apply()
    }
    const onLabel = (e) => {
      forced = e.detail
      apply()
    }
    const leaveWin = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 })
    const enterWin = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 })

    window.addEventListener('pointermove', move)
    document.addEventListener('pointerover', over)
    window.addEventListener('noir:cursor', onLabel)
    document.documentElement.addEventListener('pointerleave', leaveWin)
    document.documentElement.addEventListener('pointerenter', enterWin)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      window.removeEventListener('noir:cursor', onLabel)
      document.documentElement.removeEventListener('pointerleave', leaveWin)
      document.documentElement.removeEventListener('pointerenter', enterWin)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__ring" ref={ringRef}>
        <span className="cursor__label mono" ref={labelRef} />
      </div>
      <div className="cursor__dot" ref={dotRef} />
    </div>
  )
}
