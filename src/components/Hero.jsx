import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { HeroScene } from '../gl/HeroScene'
import { profile } from '../content/profile'

export default function Hero({ ready, webgl, reduced, touch }) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const hintRef = useRef(null)

  // Build the WebGL scene once
  useEffect(() => {
    if (!webgl) return undefined
    const scene = new HeroScene(canvasRef.current, { profile, touch, reduced })
    sceneRef.current = scene
    scene.start()

    // Repaint the wall once the real fonts arrive
    document.fonts?.ready.then(() => sceneRef.current === scene && scene.resize())

    const section = sectionRef.current
    const move = (e) => scene.setPointer(e.clientX, e.clientY)
    const click = (e) => {
      if (e.target.closest('a, button')) return
      scene.flash()
    }
    let rt = 0
    const resize = () => {
      clearTimeout(rt)
      rt = setTimeout(() => scene.resize(), 120)
    }
    section.addEventListener('pointermove', move)
    section.addEventListener('pointerdown', move)
    section.addEventListener('click', click)
    window.addEventListener('resize', resize)
    return () => {
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerdown', move)
      section.removeEventListener('click', click)
      window.removeEventListener('resize', resize)
      clearTimeout(rt)
      scene.dispose()
      sceneRef.current = null
    }
  }, [webgl, touch, reduced])

  // Intro and scroll-out
  useEffect(() => {
    if (!ready) return undefined
    const ctx = gsap.context(() => {
      const s = sceneRef.current
      if (s) {
        s.uniforms.uReveal.value = 0
        gsap.to(s.uniforms.uReveal, { value: 1, duration: reduced ? 0.01 : 2.6, ease: 'cine', delay: 0.15 })
      }
      gsap.from('.hero__fallback > *', { y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'cine', delay: 0.2 })
      gsap.from(hintRef.current.children, { opacity: 0, y: 12, duration: 1, stagger: 0.12, ease: 'cine', delay: 1.6 })
      if (!reduced) {
        gsap.to(stageRef.current, {
          yPercent: 22,
          scale: 1.06,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [ready, reduced])

  const hint = reduced ? '' : touch ? 'Drag to move the light' : 'Move the light / Click to strike a match'

  return (
    <section id="top" className={`hero ${webgl ? 'hero--gl' : 'hero--plain'}`} ref={sectionRef} data-cursor="hide">
      <div className="hero__stage" ref={stageRef}>
        {webgl && <canvas className="hero__canvas" ref={canvasRef} aria-hidden="true" />}
        <div className="hero__fallback">
          <p className="mono hero__kicker">The Subject</p>
          <h1 className="hero__title">
            <span>Mohammed Taher</span> <em>Abdullah</em>
          </h1>
          <p className="hero__hook">{profile.hook}</p>
          <p className="mono hero__roles">{profile.roles.join('  /  ')}</p>
        </div>
      </div>
      <div className="hero__hint" ref={hintRef}>
        {hint && <span className="mono">{hint}</span>}
        <span className="mono hero__scroll">
          Scroll to open the file <span className="hero__arrow" aria-hidden="true" />
        </span>
      </div>
    </section>
  )
}
