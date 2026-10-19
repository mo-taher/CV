import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { scrollToTarget, useLenis } from '../hooks/useLenis'
import { profile } from '../content/profile'

const LINES = [
  { text: 'OPEN', italic: false },
  { text: 'A CASE', italic: true },
]

const subject = encodeURIComponent('Opening a case')
const body = encodeURIComponent('Hi Taher,\n\nI found your site and would like to talk about ')

export default function OpenACase({ ready, touch, reduced }) {
  const rootRef = useRef(null)
  const bigRef = useRef(null)
  const glowRef = useRef(null)
  const lenis = useLenis()

  // Magnetic letters: each one leans toward the cursor and catches the beam
  useEffect(() => {
    if (touch || reduced) return undefined
    const root = rootRef.current
    const letters = [...bigRef.current.querySelectorAll('.big__char')]
    const movers = letters.map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' }),
      y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' }),
      r: gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' }),
    }))
    const gx = gsap.quickTo(glowRef.current, 'x', { duration: 0.5, ease: 'power3.out' })
    const gy = gsap.quickTo(glowRef.current, 'y', { duration: 0.5, ease: 'power3.out' })

    const move = (e) => {
      const rr = root.getBoundingClientRect()
      gx(e.clientX - rr.left)
      gy(e.clientY - rr.top)
      const reach = Math.max(window.innerWidth * 0.32, 260)
      movers.forEach((m) => {
        const r = m.el.getBoundingClientRect()
        const cx = r.left + r.width / 2 - (gsap.getProperty(m.el, 'x') || 0)
        const cy = r.top + r.height / 2 - (gsap.getProperty(m.el, 'y') || 0)
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const d = Math.hypot(dx, dy)
        const f = Math.max(0, 1 - d / reach)
        const pull = f * f
        m.x(dx * pull * 0.3)
        m.y(dy * pull * 0.3)
        m.r(dx * pull * 0.02)
        m.el.style.setProperty('--lit', Math.max(0, 1 - d / (reach * 0.75)).toFixed(3))
      })
    }
    const enter = () => gsap.to(glowRef.current, { opacity: 0.9, duration: 0.6 })
    const leave = () => {
      gsap.to(glowRef.current, { opacity: 0, duration: 0.6 })
      movers.forEach((m) => {
        m.x(0)
        m.y(0)
        m.r(0)
        m.el.style.setProperty('--lit', '0')
      })
    }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerenter', enter)
    root.addEventListener('pointerleave', leave)
    return () => {
      root.removeEventListener('pointerenter', enter)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
    }
  }, [touch, reduced])

  // Entrance
  useEffect(() => {
    if (!ready || reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.big__char', {
        yPercent: 120,
        rotate: 8,
        duration: 1.4,
        ease: 'cine',
        stagger: 0.04,
        scrollTrigger: { trigger: bigRef.current, start: 'top 85%' },
      })
      gsap.from('.close__links li, .close__sub', {
        y: 30,
        opacity: 0,
        stagger: 0.06,
        duration: 1,
        ease: 'cine',
        scrollTrigger: { trigger: '.close__links', start: 'top 92%' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <footer id="contact" className={`close ${touch ? 'close--touch' : ''}`} data-reel="Reel 06 / Closing" ref={rootRef}>
      <div className="close__glow" ref={glowRef} aria-hidden="true" />
      <div className="wrap close__inner">
        <p className="mono kicker">Reel 06 / Closing</p>
        <a
          className="big"
          ref={bigRef}
          href={`mailto:${profile.email}?subject=${subject}&body=${body}`}
          data-cursor="WRITE"
          aria-label={`Open a case: email ${profile.email}`}
        >
          {LINES.map((line) => (
            <span key={line.text} className={`big__line ${line.italic ? 'big__line--it' : ''}`} aria-hidden="true">
              {[...line.text].map((ch, i) => (
                <span key={i} className={`big__char ${ch === ' ' ? 'big__space' : ''}`}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </span>
          ))}
        </a>
        <p className="close__sub">
          Hiring a business analyst, systems analyst or operations lead? Send me the brief and I will take it from
          there.
        </p>

        <ul className="close__links">
          <li>
            <span className="mono">Email</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <span className="mono">Phone</span>
            <a href={profile.phoneHref}>{profile.phone}</a>
          </li>
          <li>
            <span className="mono">LinkedIn</span>
            <a href={profile.linkedin} target="_blank" rel="noopener">
              m-taher-abdullah
            </a>
          </li>
          <li>
            <span className="mono">GitHub</span>
            <a href={profile.github} target="_blank" rel="noopener">
              mo-taher
            </a>
          </li>
          <li>
            <span className="mono">Resume</span>
            <a href={profile.resume} target="_blank" rel="noopener" data-cursor="PDF">
              Download PDF
            </a>
          </li>
        </ul>

        <div className="close__bar mono">
          <span>&copy; {new Date().getFullYear()} {profile.name}</span>
          <span>Shot on location in {profile.location}</span>
          <button type="button" onClick={() => scrollToTarget(lenis, '#top')}>
            Rewind to start
          </button>
        </div>
      </div>
    </footer>
  )
}
