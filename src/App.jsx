import { useEffect, useState } from 'react'
import { LenisContext, useLenisSetup } from './hooks/useLenis'
import { useMedia, useReducedMotion, useTouch } from './hooks/useMedia'
import { ScrollTrigger } from './hooks/motion'
import { hasWebGL } from './gl/utils'

import Preloader from './components/Preloader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Subject from './components/Subject'
import CaseHistory from './components/CaseHistory'
import Evidence from './components/Evidence'
import CaseFiles from './components/CaseFiles'
import Credentials from './components/Credentials'
import OpenACase from './components/OpenACase'
import Letterbox from './components/Letterbox'
import Cursor from './components/Cursor'
import Grain from './components/Grain'

export default function App() {
  const reduced = useReducedMotion()
  const touch = useTouch()
  const wide = useMedia('(min-width: 900px)')
  const [webgl] = useState(hasWebGL)
  const [ready, setReady] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  const lenisRef = useLenisSetup(!reduced)

  // Hold the page still while the film leader runs
  useEffect(() => {
    document.body.classList.toggle('is-loading', !ready)
    const lenis = lenisRef.current
    if (lenis) (ready ? lenis.start() : lenis.stop())
    if (ready) {
      window.scrollTo(0, 0)
      requestAnimationFrame(() => {
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      })
    }
  }, [ready, lenisRef])

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const cursor = !touch && !reduced
    document.documentElement.classList.toggle('has-cursor', cursor)
  }, [touch, reduced])

  const reelMode = webgl && !reduced && !touch && wide

  return (
    <LenisContext.Provider value={lenisRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {showLoader && (
        <Preloader reduced={reduced} onBurn={() => setReady(true)} onExit={() => setShowLoader(false)} />
      )}
      <Nav ready={ready} />
      <main id="main">
        <Hero ready={ready} webgl={webgl} reduced={reduced} touch={touch} />
        <Subject ready={ready} reduced={reduced} />
        <CaseHistory ready={ready} reduced={reduced} />
        <Evidence ready={ready} reduced={reduced} />
        <CaseFiles ready={ready} mode={reelMode ? 'reel' : 'strip'} />
        <Credentials ready={ready} reduced={reduced} />
      </main>
      <OpenACase ready={ready} touch={touch} reduced={reduced} />
      <Letterbox ready={ready} reduced={reduced} />
      <Grain />
      {!touch && !reduced && <Cursor />}
    </LenisContext.Provider>
  )
}
