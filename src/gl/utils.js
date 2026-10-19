import * as THREE from 'three'
import common from './shaders/common.glsl?raw'

// Shared noise helpers available to every shader as #include <noir_common>
THREE.ShaderChunk.noir_common = common

export const MAX_DPR = 1.75

export function getDpr() {
  return Math.min(window.devicePixelRatio || 1, MAX_DPR)
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

export function isTouch() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function createRenderer(canvas, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha,
    antialias: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(getDpr())
  renderer.setClearColor(0x0a0a0a, alpha ? 0 : 1)
  return renderer
}

// Runs a render loop only while the canvas is on screen
export function createLoop(target, tick) {
  let raf = 0
  let running = false
  let visible = true
  let last = performance.now()

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    tick(dt, now / 1000)
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (running || !visible || document.hidden) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      visible ? start() : stop()
    },
    { rootMargin: '100px' }
  )
  io.observe(target)
  const onVis = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVis)

  return {
    start,
    stop,
    dispose() {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    },
  }
}

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
