import { useRef } from 'react'
import { useReveals } from '../hooks/useReveals'
import { about, profile } from '../content/profile'

export default function Subject({ ready, reduced }) {
  const ref = useRef(null)
  useReveals(ref, { ready, reduced })

  return (
    <section id="subject" className="section subject" data-reel="Reel 01 / The Subject" ref={ref}>
      <div className="wrap subject__grid">
        <aside className="subject__plate" aria-hidden="true" data-fade>
          <div className="plate__chart">
            {[7, 6, 5, 4, 3, 2].map((n) => (
              <span key={n}>
                <i />
                {n}'0"
              </span>
            ))}
          </div>
          <div className="plate__board mono">
            <span>Subject</span>
            <strong>M.T. Abdullah</strong>
            <span>File 0419 / Adelaide</span>
          </div>
        </aside>

        <div className="subject__text">
          <p className="mono kicker">Reel 01 / The Subject</p>
          <h2 className="subject__lead" data-split>
            {about.lead}
          </h2>
          <div className="subject__body">
            {about.body.map((p) => (
              <p key={p.slice(0, 24)} data-fade>
                {p}
              </p>
            ))}
          </div>
          <dl className="facts" data-fade>
            {about.facts.map((f) => (
              <div key={f.label} className="facts__row">
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="subject__sign mono" data-fade>
            Statement taken from {profile.name}
          </p>
        </div>
      </div>
    </section>
  )
}
