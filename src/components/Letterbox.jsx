import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../hooks/motion'

// Cinematic bars that close in and open again each time a new reel starts
export default function Letterbox({ ready, reduced }) {
  const topRef = useRef(null)
  const botRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!ready || reduced) return undefined
    let tl = null
    const play = (label) => {
      tl?.kill()
      labelRef.current.textContent = label
      tl = gsap
        .timeline()
        .to([topRef.current, botRef.current], { scaleY: 1, duration: 0.45, ease: 'shutter' })
        .fromTo(labelRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')
        .to(labelRef.current, { opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.6')
        .to([topRef.current, botRef.current], { scaleY: 0, duration: 0.6, ease: 'cine' }, '<0.1')
    }
    const triggers = [...document.querySelectorAll('[data-reel]')].map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        onEnter: () => play(el.dataset.reel),
        onEnterBack: () => play(el.dataset.reel),
      })
    )
    return () => {
      tl?.kill()
      triggers.forEach((t) => t.kill())
    }
  }, [ready, reduced])

  return (
    <div className="letterbox" aria-hidden="true">
      <div className="letterbox__bar letterbox__bar--top" ref={topRef} />
      <div className="letterbox__bar letterbox__bar--bot" ref={botRef}>
        <span className="letterbox__label mono" ref={labelRef} />
      </div>
    </div>
  )
}
