import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { useReveals } from '../hooks/useReveals'
import { stats, skills } from '../content/skills'

const LETTERS = 'ABCDEFGH'

export default function Evidence({ ready, reduced }) {
  const ref = useRef(null)
  useReveals(ref, { ready, reduced })

  useEffect(() => {
    if (!ready || reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.exhibit').forEach((tag, i) => {
        const num = tag.querySelector('.exhibit__num')
        const target = Number(num.dataset.value)
        const obj = { v: 0 }
        num.textContent = '0'
        gsap
          .timeline({ scrollTrigger: { trigger: tag, start: 'top 88%' } })
          .from(tag, { y: 80, rotate: i % 2 ? 6 : -5, opacity: 0, duration: 1.1, ease: 'settle', delay: (i % 3) * 0.08 })
          .to(obj, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => (num.textContent = Math.round(obj.v)) }, '<0.2')
      })
      gsap.from('.skills__group', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'cine',
        scrollTrigger: { trigger: '.skills', start: 'top 82%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <section id="evidence" className="section evidence" data-reel="Reel 03 / The Evidence" ref={ref}>
      <div className="wrap">
        <header className="section__head">
          <p className="mono kicker">Reel 03 / The Evidence</p>
          <h2 className="section__title" data-split>
            The <em>Evidence</em>
          </h2>
          <p className="section__intro" data-fade>
            Numbers from the work, logged and tagged.
          </p>
        </header>

        <ul className="exhibits">
          {stats.map((s, i) => (
            <li key={s.label} className="exhibit">
              <span className="exhibit__hole" aria-hidden="true" />
              <span className="mono exhibit__id">Exhibit {LETTERS[i]}</span>
              <p className="exhibit__value">
                <span className="exhibit__num" data-value={s.value}>
                  {s.value}
                </span>
                <span className="exhibit__suffix">{s.suffix}</span>
              </p>
              <p className="exhibit__label">{s.label}</p>
              <p className="mono exhibit__src">{s.source}</p>
            </li>
          ))}
        </ul>

        <div className="skills">
          <h3 className="skills__title">
            Tools of the <em>trade</em>
          </h3>
          <div className="skills__grid">
            {skills.map((g) => (
              <div key={g.group} className="skills__group">
                <h4 className="mono">{g.group}</h4>
                <ul>
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
