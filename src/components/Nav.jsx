import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { scrollToTarget, useLenis } from '../hooks/useLenis'
import { profile } from '../content/profile'

const LINKS = [
  { href: '#subject', label: 'Subject' },
  { href: '#history', label: 'History' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#cases', label: 'Cases' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav({ ready }) {
  const ref = useRef(null)
  const lenis = useLenis()

  useEffect(() => {
    if (!ready) return
    gsap.fromTo(ref.current, { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'cine', delay: 0.9 })
  }, [ready])

  const go = (e, href) => {
    e.preventDefault()
    scrollToTarget(lenis, href)
  }

  return (
    <header className="nav" ref={ref}>
      <a href="#top" className="nav__brand mono" onClick={(e) => go(e, '#top')} aria-label="Back to top">
        <span className="nav__rec" aria-hidden="true" />
        M.T.A.
      </a>
      <nav aria-label="Main">
        <ul className="nav__links">
          {LINKS.map((l, i) => (
            <li key={l.href} className={i < 4 ? 'nav__hide-sm' : ''}>
              <a className="mono" href={l.href} onClick={(e) => go(e, l.href)}>
                <span className="nav__num">0{i + 1}</span> {l.label}
              </a>
            </li>
          ))}
          <li>
            <a className="mono nav__resume" href={profile.resume} target="_blank" rel="noopener" data-cursor="PDF">
              Resume
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
