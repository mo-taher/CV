import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../hooks/motion'
import { useLenis } from '../hooks/useLenis'
import { ReelScene } from '../gl/ReelScene'
import { drawFrame, loadImage } from '../gl/frameTexture'
import { projects } from '../content/projects'

function cursorLabel(label) {
  window.dispatchEvent(new CustomEvent('noir:cursor', { detail: label }))
}

function ProjectInfo({ project, total }) {
  return (
    <div className="case-info" key={project.id}>
      <p className="mono case-info__id">
        Case {project.id} <span>/ {String(total).padStart(2, '0')}</span>
      </p>
      <h3 className="case-info__title">{project.title}</h3>
      <p className="mono case-info__status">{project.status}</p>
      <p className="case-info__summary">{project.summary}</p>
      {project.role && <p className="case-info__role">{project.role}</p>}
      <ul className="case-info__tags">
        {project.tags.map((t) => (
          <li key={t} className="mono">
            {t}
          </li>
        ))}
      </ul>
      {project.link ? (
        <a className="case-info__link mono" href={project.link} target="_blank" rel="noopener" data-cursor="OPEN">
          Open the file on GitHub <span aria-hidden="true">&#8599;</span>
        </a>
      ) : (
        <p className="case-info__link case-info__link--off mono">File sealed / no public repo</p>
      )}
    </div>
  )
}

// Desktop: a pinned WebGL film reel driven by scroll
function Reel({ ready }) {
  const pinRef = useRef(null)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const stRef = useRef(null)
  const lenis = useLenis()
  const [active, setActive] = useState(0)
  const n = projects.length

  useEffect(() => {
    const scene = new ReelScene(canvasRef.current, projects, {
      onActive: setActive,
      onHover: (i) => {
        if (i < 0) return cursorLabel(null)
        const st = stRef.current
        const isFront = sceneRef.current && i === sceneRef.current.active
        cursorLabel(isFront ? (projects[i].link ? 'OPEN' : 'SEALED') : 'VIEW')
        canvasRef.current.style.cursor = st ? 'pointer' : ''
      },
    })
    sceneRef.current = scene
    scene.load().then(() => scene.start())

    const canvas = canvasRef.current
    const move = (e) => scene.setPointer(e.clientX, e.clientY)
    const leave = () => {
      scene.clearPointer()
      cursorLabel(null)
    }
    const click = () => {
      const i = scene.hoveredIndex()
      if (i < 0) return
      if (i === scene.active) {
        if (projects[i].link) window.open(projects[i].link, '_blank', 'noopener')
        return
      }
      const st = stRef.current
      if (!st) return
      const y = st.start + (i / (n - 1)) * (st.end - st.start)
      if (lenis.current) lenis.current.scrollTo(y, { duration: 1.4 })
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('click', click)
    const resize = () => scene.resize()
    window.addEventListener('resize', resize)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('click', click)
      window.removeEventListener('resize', resize)
      cursorLabel(null)
      scene.dispose()
      sceneRef.current = null
    }
  }, [lenis, n])

  useEffect(() => {
    if (!ready) return undefined
    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: pinRef.current,
        pin: true,
        start: 'top top',
        end: () => `+=${window.innerHeight * (n - 1) * 0.85}`,
        onUpdate: (self) => {
          const s = sceneRef.current
          if (!s) return
          s.setProgress(self.progress)
          s.setVelocity(self.getVelocity() / 2600)
        },
      })
      gsap.from('.reel__head > *', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: 'cine',
        scrollTrigger: { trigger: pinRef.current, start: 'top 70%' },
      })
    }, pinRef)
    return () => {
      ctx.revert()
      stRef.current = null
    }
  }, [ready, n])

  return (
    <div className="reel" ref={pinRef}>
      <header className="reel__head wrap">
        <p className="mono kicker">Reel 04 / Case Files</p>
        <h2 className="section__title reel__title">
          Case <em>Files</em>
        </h2>
      </header>
      <canvas className="reel__canvas" ref={canvasRef} aria-hidden="true" />
      <div className="reel__info wrap" aria-live="polite">
        <ProjectInfo project={projects[active]} total={n} />
      </div>
      <div className="reel__counter" aria-hidden="true">
        {projects.map((p, i) => (
          <span key={p.id} className={i === active ? 'is-on' : ''} />
        ))}
        <em className="mono">Scroll to run the reel</em>
      </div>
    </div>
  )
}

// Phones, tablets and reduced motion: a swipeable strip of the same frames
function Strip({ ready }) {
  const [srcs, setSrcs] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (document.fonts?.ready) await document.fonts.ready
      const imgs = await Promise.all(projects.map((p) => loadImage(p.image)))
      const out = projects.map((p, i) => drawFrame(p, i, imgs[i]).toDataURL('image/jpeg', 0.82))
      if (alive) setSrcs(out)
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.strip__card', {
        x: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'cine',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [ready])

  return (
    <div className="strip" ref={ref}>
      <header className="wrap section__head">
        <p className="mono kicker">Reel 04 / Case Files</p>
        <h2 className="section__title">
          Case <em>Files</em>
        </h2>
        <p className="section__intro mono">Swipe through the reel</p>
      </header>
      <ul className="strip__track">
        {projects.map((p, i) => (
          <li key={p.id} className="strip__card">
            <div className="strip__frame">{srcs[i] && <img src={srcs[i]} alt="" loading="lazy" />}</div>
            <ProjectInfo project={p} total={projects.length} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CaseFiles({ ready, mode }) {
  return (
    <section id="cases" className="section cases" data-reel="Reel 04 / Case Files">
      {mode === 'reel' ? <Reel ready={ready} /> : <Strip ready={ready} />}
      {mode === 'reel' && (
        <ol className="sr-only">
          {projects.map((p) => (
            <li key={p.id}>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              {p.link && <a href={p.link}>View {p.title} on GitHub</a>}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
