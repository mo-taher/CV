import * as THREE from 'three'
import { createRenderer, createLoop, getDpr, lerp, clamp } from './utils'
import { drawWall } from './wallText'
import vert from './shaders/fullscreen.vert?raw'
import frag from './shaders/flashlight.frag?raw'
import dustVert from './shaders/dust.vert?raw'
import dustFrag from './shaders/dust.frag?raw'

// The flashlight hero. Plain Three.js so React only has to mount and dispose it.
export class HeroScene {
  constructor(canvas, { profile, touch = false, reduced = false }) {
    this.canvas = canvas
    this.profile = profile
    this.touch = touch
    this.reduced = reduced
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, lastMove: 0 }
    this.vel = 0

    this.renderer = createRenderer(canvas)
    this.scene = new THREE.Scene()
    this.camera = new THREE.Camera()

    this.textCanvas = document.createElement('canvas')
    this.textTex = new THREE.CanvasTexture(this.textCanvas)
    this.textTex.minFilter = THREE.LinearFilter
    this.textTex.generateMipmaps = false

    this.uniforms = {
      uText: { value: this.textTex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uBeamR: { value: 300 },
      uReveal: { value: 0 },
      uFlash: { value: 0 },
      uLit: { value: reduced ? 1 : 0 },
      uVel: { value: 0 },
      uPixelRatio: { value: getDpr() },
    }

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms, depthTest: false })
    )
    this.scene.add(quad)

    // Dust hanging in the beam
    const count = touch ? 260 : 650
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = Math.random()
      seeds[i * 4 + 1] = Math.random()
      seeds[i * 4 + 2] = Math.random()
      seeds[i * 4 + 3] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    this.dust = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        vertexShader: dustVert,
        fragmentShader: dustFrag,
        uniforms: this.uniforms,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      })
    )
    this.dust.frustumCulled = false
    this.scene.add(this.dust)

    this.loop = createLoop(canvas, (dt, t) => this.tick(dt, t))
    this.resize()
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    const dpr = getDpr()
    this.w = w
    this.h = h
    this.dpr = dpr
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.uniforms.uRes.value.set(w * dpr, h * dpr)
    this.uniforms.uPixelRatio.value = dpr
    this.uniforms.uBeamR.value = Math.max(170, Math.min(w, h) * (this.touch ? 0.42 : 0.33)) * dpr
    drawWall(this.textCanvas, { width: w, height: h, dpr: Math.min(dpr, 1.5), profile: this.profile })
    this.textTex.needsUpdate = true
    if (!this.pointer.active) {
      this.pointer.tx = this.pointer.x = w * 0.5
      this.pointer.ty = this.pointer.y = h * 0.42
    }
  }

  setPointer(x, y) {
    const rect = this.canvas.getBoundingClientRect()
    this.pointer.tx = x - rect.left
    this.pointer.ty = y - rect.top
    this.pointer.active = true
    this.pointer.lastMove = performance.now()
  }

  // Struck match: a short burst of light that settles back to the beam
  flash() {
    const u = this.uniforms.uFlash
    u.value = 1
    this.flashDecay = true
  }

  tick(dt, t) {
    const p = this.pointer
    const idle = performance.now() - p.lastMove > 2600
    // With no input (touch screens, or a still mouse) the beam drifts across the wall by itself
    if (!p.active || (this.touch && idle)) {
      p.tx = this.w * (0.5 + Math.sin(t * 0.37) * 0.32)
      p.ty = this.h * (0.45 + Math.sin(t * 0.53 + 1.2) * 0.2)
    }
    const k = 1 - Math.pow(0.0009, dt)
    const px = p.x
    const py = p.y
    p.x = lerp(p.x, p.tx, k)
    p.y = lerp(p.y, p.ty, k)
    const speed = Math.hypot(p.x - px, p.y - py) / Math.max(dt, 0.001)
    this.vel = lerp(this.vel, clamp(speed / 2500, 0, 1), 0.12)

    const u = this.uniforms
    u.uTime.value = t
    u.uMouse.value.set(p.x * this.dpr, (this.h - p.y) * this.dpr)
    u.uVel.value = this.vel
    if (this.flashDecay) {
      u.uFlash.value *= Math.pow(0.04, dt)
      if (u.uFlash.value < 0.002) {
        u.uFlash.value = 0
        this.flashDecay = false
      }
    }
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    this.loop.start()
  }

  dispose() {
    this.loop.dispose()
    this.scene.traverse((o) => {
      o.geometry?.dispose()
      o.material?.dispose()
    })
    this.textTex.dispose()
    this.renderer.dispose()
  }
}
