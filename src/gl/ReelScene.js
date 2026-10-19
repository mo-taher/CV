import * as THREE from 'three'
import { createRenderer, createLoop, getDpr, lerp, clamp } from './utils'
import { drawFrame, loadImage, FRAME_W, FRAME_H } from './frameTexture'
import vert from './shaders/reel.vert?raw'
import frag from './shaders/reel.frag?raw'

const FRAME_HEIGHT = 1
const FRAME_WIDTH = (FRAME_W / FRAME_H) * FRAME_HEIGHT
const GAP = 0.05
const RADIUS = 2.6
const STEP = (FRAME_WIDTH + GAP) / RADIUS // angle between frames
const FOV = 30

// The film reel. Frames sit on a cylinder; scroll turns the cylinder.
export class ReelScene {
  constructor(canvas, projects, { onActive, onHover } = {}) {
    this.canvas = canvas
    this.projects = projects
    this.onActive = onActive
    this.onHover = onHover
    this.count = projects.length
    this.progress = 0
    this.current = 0
    this.magnet = 0
    this.vel = 0
    this.targetVel = 0
    this.active = -1
    this.hovered = -1
    this.pointer = new THREE.Vector2(-10, -10)
    this.raycaster = new THREE.Raycaster()

    this.renderer = createRenderer(canvas)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50)
    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.shared = {
      uRadius: { value: RADIUS },
      uVel: { value: 0 },
      uTime: { value: 0 },
    }
    this.meshes = []
    this.loop = createLoop(canvas, (dt, t) => this.tick(dt, t))
    this.resize()
  }

  async load() {
    const images = await Promise.all(this.projects.map((p) => loadImage(p.image)))
    if (document.fonts?.ready) await document.fonts.ready
    const geo = new THREE.PlaneGeometry(FRAME_WIDTH, FRAME_HEIGHT, 48, 6)
    this.projects.forEach((p, i) => {
      const tex = new THREE.CanvasTexture(drawFrame(p, i, images[i]))
      tex.colorSpace = THREE.NoColorSpace
      tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy())
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          ...this.shared,
          uMap: { value: tex },
          uActive: { value: i === 0 ? 1 : 0 },
          uHover: { value: 0 },
          uSeed: { value: i * 7.31 + 1.7 },
        },
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      const a = i * STEP
      mesh.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS)
      mesh.rotation.y = a
      mesh.userData.index = i
      this.group.add(mesh)
      this.meshes.push(mesh)
    })
    this.setActive(0)
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setPixelRatio(getDpr())
    this.renderer.setSize(w, h, false)
    const aspect = w / h
    this.camera.aspect = aspect
    // Keep the frame in the gate at about 62% of the width or 60% of the height, whichever is tighter
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const wideLayout = aspect > 1.25
    const byH = FRAME_HEIGHT / ((wideLayout ? 0.56 : 0.6) * 2 * t)
    const byW = FRAME_WIDTH / ((wideLayout ? 0.5 : 0.62) * 2 * t * aspect)
    const dist = Math.max(byH, byW)
    // On wide screens the frame in the gate sits right of centre, clear of the case notes
    const visW = 2 * dist * t * aspect
    const ox = wideLayout ? visW * 0.13 : 0
    this.camera.position.set(-ox, -0.04, RADIUS + dist)
    this.camera.lookAt(-ox, -0.04, RADIUS)
    this.camera.updateProjectionMatrix()
  }

  setProgress(p) {
    this.progress = clamp(p, 0, 1)
  }

  setVelocity(v) {
    this.targetVel = clamp(v, -1, 1)
  }

  setPointer(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect()
    this.pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
  }

  clearPointer() {
    this.pointer.set(-10, -10)
  }

  hoveredIndex() {
    return this.hovered
  }

  setActive(i) {
    if (i === this.active) return
    this.active = i
    this.onActive?.(i)
  }

  tick(dt, t) {
    const n = this.count
    const target = this.progress * (n - 1)
    // When the scroll settles, the reel eases onto the nearest whole frame
    const still = Math.abs(this.targetVel) < 0.03
    this.magnet = lerp(this.magnet, still ? 1 : 0, 1 - Math.pow(still ? 0.02 : 0.0001, dt))
    const aim = target + (Math.round(target) - target) * this.magnet
    this.current = lerp(this.current, aim, 1 - Math.pow(0.002, dt))

    this.vel = lerp(this.vel, this.targetVel, 1 - Math.pow(0.01, dt))
    this.targetVel *= Math.pow(0.15, dt)

    this.group.rotation.y = -this.current * STEP
    this.shared.uVel.value = this.vel
    this.shared.uTime.value = t

    // Hover test against the frames
    let hovered = -1
    if (this.pointer.x > -2) {
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const hit = this.raycaster.intersectObjects(this.meshes, false)[0]
      if (hit) hovered = hit.object.userData.index
    }
    if (hovered !== this.hovered) {
      this.hovered = hovered
      this.onHover?.(hovered)
    }

    this.meshes.forEach((m, i) => {
      const u = m.material.uniforms
      u.uActive.value = clamp(1 - Math.abs(i - this.current) * 1.4, 0, 1)
      u.uHover.value = lerp(u.uHover.value, i === hovered ? 1 : 0, 0.12)
    })

    this.setActive(clamp(Math.round(this.current), 0, n - 1))
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    this.loop.start()
  }

  dispose() {
    this.loop.dispose()
    this.meshes.forEach((m) => {
      m.material.uniforms.uMap.value.dispose()
      m.material.dispose()
    })
    this.meshes[0]?.geometry.dispose()
    this.renderer.dispose()
  }
}
