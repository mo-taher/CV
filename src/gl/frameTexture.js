// Builds one strip of 35mm film per project: sprocket holes, edge print, and the picture in the gate.
// Projects without a screenshot get a noir title card so the reel always looks consistent.
export const FRAME_W = 1024
export const FRAME_H = 768
const BAND = 96

const serif = '"Instrument Serif", "Times New Roman", serif'
const mono = '"IBM Plex Mono", ui-monospace, monospace'

function cover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height
  const r = w / h
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0
  if (ir > r) {
    sw = img.height * r
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / r
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function wrap(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  })
  if (line) lines.push(line)
  return lines
}

function titleCard(ctx, project, index, x, y, w, h) {
  // Dark stage with a single pool of light, placed differently on each card
  ctx.fillStyle = '#0d0c0b'
  ctx.fillRect(x, y, w, h)
  const spots = [[0.3, 0.35], [0.7, 0.3], [0.5, 0.25], [0.25, 0.6], [0.72, 0.62], [0.5, 0.5]]
  const [sx, sy] = spots[index % spots.length]
  const g = ctx.createRadialGradient(x + w * sx, y + h * sy, 0, x + w * sx, y + h * sy, w * 0.62)
  g.addColorStop(0, 'rgba(230,162,60,0.32)')
  g.addColorStop(0.45, 'rgba(230,162,60,0.08)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)

  // Fine grid, like the back of a case board
  ctx.strokeStyle = 'rgba(232,225,207,0.06)'
  ctx.lineWidth = 1
  for (let gx = x; gx < x + w; gx += 32) {
    ctx.beginPath()
    ctx.moveTo(gx, y)
    ctx.lineTo(gx, y + h)
    ctx.stroke()
  }
  for (let gy = y; gy < y + h; gy += 32) {
    ctx.beginPath()
    ctx.moveTo(x, gy)
    ctx.lineTo(x + w, gy)
    ctx.stroke()
  }

  // Giant outlined case number
  ctx.save()
  ctx.font = `italic 400 ${h * 0.95}px ${serif}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.strokeStyle = 'rgba(232,225,207,0.16)'
  ctx.lineWidth = 2
  ctx.strokeText(project.id, x + w - 24, y + h * 0.88)
  ctx.restore()

  // Label, title and tags
  ctx.fillStyle = '#e6a23c'
  ctx.font = `500 18px ${mono}`
  ctx.textAlign = 'left'
  ctx.fillText(`CASE ${project.id}  /  ${project.status.toUpperCase()}`, x + 48, y + 64)

  ctx.fillStyle = '#e8e1cf'
  ctx.font = `400 74px ${serif}`
  const lines = wrap(ctx, project.title, w * 0.72)
  lines.forEach((l, i) => ctx.fillText(l, x + 46, y + h * 0.5 + i * 70 - (lines.length - 1) * 35))

  ctx.fillStyle = 'rgba(232,225,207,0.6)'
  ctx.font = `500 16px ${mono}`
  ctx.fillText(project.tags.join('   ').toUpperCase(), x + 48, y + h - 44)

  // Oxblood "evidence" stamp
  ctx.save()
  ctx.translate(x + w - 170, y + 74)
  ctx.rotate(-0.12)
  ctx.strokeStyle = 'rgba(168,50,50,0.8)'
  ctx.lineWidth = 3
  ctx.strokeRect(-92, -26, 184, 52)
  ctx.fillStyle = 'rgba(168,50,50,0.85)'
  ctx.font = `600 20px ${mono}`
  ctx.textAlign = 'center'
  ctx.fillText('EVIDENCE', 0, 7)
  ctx.restore()
}

export function drawFrame(project, index, image) {
  const c = document.createElement('canvas')
  c.width = FRAME_W
  c.height = FRAME_H
  const ctx = c.getContext('2d')

  // Film base
  ctx.fillStyle = '#16120e'
  ctx.fillRect(0, 0, FRAME_W, FRAME_H)

  // Sprocket holes along both edges
  ctx.fillStyle = '#d9cfb8'
  const holeW = 40
  const holeH = 30
  const step = 64
  for (let x = 14; x < FRAME_W; x += step) {
    for (const y of [BAND / 2 - holeH / 2 - 8, FRAME_H - BAND / 2 - holeH / 2 + 8]) {
      ctx.beginPath()
      ctx.roundRect(x, y, holeW, holeH, 6)
      ctx.fill()
    }
  }

  // Edge print
  ctx.fillStyle = 'rgba(230,162,60,0.75)'
  ctx.font = `500 13px ${mono}`
  ctx.textAlign = 'left'
  ctx.fillText(`MTA 5247  CASE ${project.id}  >`, 24, BAND - 10)
  ctx.textAlign = 'right'
  ctx.fillText(`SAFETY FILM  ${project.id}A`, FRAME_W - 24, FRAME_H - BAND + 22)

  // The picture in the gate
  const gx = 18
  const gy = BAND
  const gw = FRAME_W - 36
  const gh = FRAME_H - BAND * 2
  if (image) {
    ctx.fillStyle = '#000'
    ctx.fillRect(gx, gy, gw, gh)
    cover(ctx, image, gx, gy, gw, gh)
    // A little label strip so screenshots still read as case files
    const lg = ctx.createLinearGradient(0, gy + gh - 120, 0, gy + gh)
    lg.addColorStop(0, 'rgba(0,0,0,0)')
    lg.addColorStop(1, 'rgba(0,0,0,0.75)')
    ctx.fillStyle = lg
    ctx.fillRect(gx, gy + gh - 120, gw, 120)
    ctx.fillStyle = '#e6a23c'
    ctx.font = `500 16px ${mono}`
    ctx.textAlign = 'left'
    ctx.fillText(`CASE ${project.id}  /  ${project.status.toUpperCase()}`, gx + 28, gy + gh - 26)
  } else {
    titleCard(ctx, project, index, gx, gy, gw, gh)
  }

  // Rounded gate corners
  ctx.strokeStyle = '#16120e'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.roundRect(gx - 4, gy - 4, gw + 8, gh + 8, 16)
  ctx.stroke()

  return c
}

export function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}
