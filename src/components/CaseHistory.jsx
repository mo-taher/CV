import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { useReveals } from '../hooks/useReveals'
import { experience } from '../content/experience'

export default function CaseHistory({ ready, reduced }) {
  const ref = useRef(null)
  useReveals(ref, { ready, reduced })

  // Each dossier is slapped onto the desk, then stamped
  useEffect(() => {
    if (!ready || reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.dossier').forEach((card, i) => {
        const tilt = i % 2 ? 1.2 : -1.1
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' } })
        tl.from(card, { y: 160, rotate: tilt * 5, opacity: 0, duration: 1.3, ease: 'settle' })
          .from(card.querySelectorAll('.dossier__points li'), { x: -20, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'cine' }, '-=0.7')
          .fromTo(
            card.querySelector('.stamp'),
            { scale: 2.6, opacity: 0, rotate: -24 },
            { scale: 1, opacity: 1, rotate: -9, duration: 0.35, ease: 'power4.in' },
            '-=0.4'
          )
          .to(card, { x: '+=3', y: '+=2', duration: 0.05, yoyo: true, repeat: 1 })
      })
    }, ref)
    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <section id="history" className="section history" data-reel="Reel 02 / Case History" ref={ref}>
      <div className="wrap">
        <header className="section__head">
          <p className="mono kicker">Reel 02 / Case History</p>
          <h2 className="section__title" data-split>
            Case <em>History</em>
          </h2>
          <p className="section__intro" data-fade>
            Three files, newest first. Each one is a place where I sat between the people who need a system and the
            people who build it.
          </p>
        </header>

        <div className="dossiers">
          {experience.map((job, i) => (
            <article key={job.file} className={`dossier ${i % 2 ? 'dossier--right' : ''}`}>
              <div className="dossier__tab mono">File {job.file}</div>
              <div className="stamp mono" aria-hidden="true">
                {job.stamp}
              </div>
              <p className="dossier__meta mono">
                <span>{job.dates}</span>
                <span>{job.place}</span>
              </p>
              <h3 className="dossier__role">{job.role}</h3>
              <p className="dossier__company">{job.company}</p>
              <ol className="dossier__points">
                {job.points.map((pt, j) => (
                  <li key={j}>
                    <span className="mono">{String(j + 1).padStart(2, '0')}</span>
                    <p>{pt}</p>
                  </li>
                ))}
              </ol>
              <ul className="dossier__tags">
                {job.tags.map((t) => (
                  <li key={t} className="mono">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
