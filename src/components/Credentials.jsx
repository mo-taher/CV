import { useRef } from 'react'
import { useReveals } from '../hooks/useReveals'
import { education } from '../content/education'

export default function Credentials({ ready, reduced }) {
  const ref = useRef(null)
  useReveals(ref, { ready, reduced })

  return (
    <section id="credentials" className="section credentials" data-reel="Reel 05 / Credentials" ref={ref}>
      <div className="wrap">
        <header className="section__head">
          <p className="mono kicker">Reel 05 / Credentials</p>
          <h2 className="section__title" data-split>
            On the <em>record</em>
          </h2>
        </header>
        <ul className="records">
          {education.map((e) => (
            <li key={e.record} className="record" data-fade>
              <p className="mono record__id">Record {e.record}</p>
              <p className="mono record__dates">{e.dates}</p>
              <div className="record__main">
                <h3 className="record__degree">
                  {e.degree} <em>{e.stream}</em>
                </h3>
                <p className="record__school">
                  {e.school}, {e.place}
                </p>
              </div>
              <p className="record__detail">{e.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
