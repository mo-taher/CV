import { useEffect, useRef } from 'react'
import { gsap } from '../hooks/motion'
import { projects } from '../content/projects'
import { loadImage } from '../gl/frameTexture'

const FONTS = [
  '400 100px "Instrument Serif"',
  'italic 400 100px "Instrument Serif"',
  '500 12px "IBM Plex Mono"',
  '400 16px "Inter Tight"',
]

// A film countdown leader that runs while fonts and pictures load, then burns out to white
export default function Preloader({ reduced, onBurn, onExit }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const pctRef = useRef(null)
  const flashRef = useRef(null)
  const cbs = useRef({ onBurn, onExit })
  cbs.current = { onBurn, onExit }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    const state = { p: 0 }
    let lastNum = 3
    let blink = 0
    let raf = 0

    const draw = () => {
      const p = state.p
      const n = Math.max(1, 3 - Math.min(2, Math.floor(p * 3)))
      const sweep = p >= 1 ? 1 : (p * 3) % 1
      if (n !== lastNum) {
        blink = 1
        lastNum = n
      }
      blink *= 0.86

      const jx = (Math.random() - 0.5) * 1.6
      const jy = (Math.random() - 0.5) * 1.6
      const flick = 0.9 + Math.random() * 0.1
      ctx.save()
      ctx.fillStyle = `rgb(${18 * flick}, ${17 * flick}, ${15 * flick})`
      ctx.fillRect(0, 0, w, h)
      ctx.translate(jx, jy)

      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.3

      // Swept segment
      ctx.fillStyle = 'rgba(232,225,207,0.1)'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r * 1.9, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2)
      ctx.closePath()
      ctx.fill()

      // Crosshair and rings
      ctx.strokeStyle = 'rgba(232,225,207,0.55)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, h)
      ctx.stroke()
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.14, 0, Math.PI * 2)
      ctx.stroke()

      // The number
      ctx.fillStyle = `rgba(232,225,207,${0.92 - blink * 0.6})`
      ctx.font = `400 ${r * 1.45}px "Instrument Serif", "Times New Roman", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(n), cx, cy + r * 0.08)

      // Scratches and dust
      if (Math.random() > 0.6) {
        ctx.strokeStyle = `rgba(232,225,207,${0.08 + Math.random() * 0.15})`
        ctx.lineWidth = 1
        const sx = Math.random() * w
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx + (Math.random() - 0.5) * 20, h)
        ctx.stroke()
      }
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '232,225,207' : '0,0,0'},${Math.random() * 0.5})`
        const s = Math.random() * 2.2
        ctx.fillRect(Math.random() * w, Math.random() * h, s, s)
      }
      ctx.restore()

      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // Real loading: fonts and project pictures
    const fonts = document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve()
    const images = Promise.all(projects.filter((p) => p.image).map((p) => loadImage(p.image)))
    const assets = Promise.all([fonts, images])
    const timeout = new Promise((res) => setTimeout(res, 6000))

    const run = gsap.to(state, { p: 0.82, duration: reduced ? 0.25 : 2.3, ease: 'none' })
    let killed = false

    const burn = () => {
      if (killed) return
      const tl = gsap.timeline()
      tl.to(flashRef.current, { opacity: 1, duration: reduced ? 0.05 : 0.16, ease: 'power2.in' })
        .add(() => cbs.current.onBurn?.())
        .to(rootRef.current, { opacity: 0, duration: reduced ? 0.2 : 1, ease: 'cine' })
        .add(() => cbs.current.onExit?.())
    }

    Promise.all([Promise.race([assets, timeout]), run.then()]).then(() => {
      if (killed) return
      gsap.to(state, { p: 1, duration: reduced ? 0.1 : 0.55, ease: 'power1.in', onComplete: burn })
    })

    return () => {
      killed = true
      cancelAnimationFrame(raf)
      run.kill()
      window.removeEventListener('resize', size)
    }
  }, [reduced])

  return (
    <div className="pre" ref={rootRef} role="status" aria-label="Loading">
      <canvas className="pre__canvas" ref={canvasRef} aria-hidden="true" />
      <div className="pre__meta mono pre__meta--tl">M.T.A. / Case Files</div>
      <div className="pre__meta mono pre__meta--tr">Reel 00 / Leader</div>
      <div className="pre__meta mono pre__meta--bl">Adelaide, SA</div>
      <div className="pre__meta mono pre__meta--br">
        Loading reel <span ref={pctRef}>000</span>%
      </div>
      <div className="pre__flash" ref={flashRef} />
    </div>
  )
}
