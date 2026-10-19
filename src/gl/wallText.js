// Paints the hero lettering onto a 2D canvas. The flashlight shader then lights it like paint on a wall.
const BONE = '#e8e1cf'
const AMBER = '#e6a23c'
const OXBLOOD = '#8a2424'

function fitFont(ctx, text, family, style, maxWidth, maxSize) {
  let size = maxSize
  ctx.font = `${style} ${size}px ${family}`
  const w = ctx.measureText(text).width
  if (w > maxWidth) size = Math.floor((size * maxWidth) / w)
  return size
}

function spaced(ctx, text, x, y, spacing, align = 'center') {
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  ctx.textAlign = 'left'
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y)
    cx += widths[i] + spacing
  })
}

export function drawWall(canvas, { width, height, dpr, profile }) {
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.textBaseline = 'alphabetic'

  const portrait = width / height < 0.9
  const cx = width / 2
  const serif = '"Instrument Serif", "Times New Roman", serif'
  const mono = '"IBM Plex Mono", ui-monospace, monospace'

  // Detective board: pins and red string across the wall, kept faint so the name leads
  const pins = portrait
    ? [[0.12, 0.16], [0.84, 0.12], [0.9, 0.88], [0.1, 0.9]]
    : [[0.08, 0.2], [0.27, 0.1], [0.78, 0.13], [0.93, 0.36], [0.88, 0.86], [0.12, 0.84]]
  ctx.strokeStyle = 'rgba(138,36,36,0.55)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  pins.forEach(([px, py], i) => {
    const x = px * width
    const y = py * height
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  })
  ctx.closePath()
  ctx.stroke()
  pins.forEach(([px, py]) => {
    ctx.fillStyle = OXBLOOD
    ctx.beginPath()
    ctx.arc(px * width, py * height, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // Small notes pinned next to some of the pins
  ctx.fillStyle = 'rgba(232,225,207,0.5)'
  ctx.font = `500 ${portrait ? 9 : 11}px ${mono}`
  if (!portrait) {
    ctx.textAlign = 'left'
    ctx.fillText('EXHIBIT 01: REQUIREMENTS', 0.08 * width + 12, 0.2 * height + 22)
    ctx.fillText('EXHIBIT 02: PROCESS MAPS', 0.78 * width + 12, 0.13 * height + 22)
    ctx.fillText('EXHIBIT 03: UAT, 62 PRODUCTS', 0.88 * width - 210, 0.86 * height + 24)
    ctx.fillText('LAST SEEN: ADELAIDE, SA', 0.12 * width + 12, 0.84 * height + 22)
  }

  // Name, painted big
  const maxW = width * (portrait ? 0.9 : 0.86)
  const lines = portrait ? ['MOHAMMED', 'TAHER', 'ABDULLAH'] : [profile.firstLine, profile.secondLine]
  const sizes = lines.map((l, i) =>
    fitFont(ctx, l, serif, i === lines.length - 1 ? 'italic 400' : '400', maxW, height * (portrait ? 0.15 : 0.26))
  )
  const size = Math.min(...sizes)
  const lineH = size * 0.86
  const blockH = lineH * lines.length
  let y = height * (portrait ? 0.47 : 0.5) - blockH / 2 + size * 0.72

  ctx.fillStyle = AMBER
  ctx.font = `500 ${Math.max(10, size * 0.07)}px ${mono}`
  spaced(ctx, 'THE SUBJECT', cx, y - size * 0.9, Math.max(3, size * 0.03))

  lines.forEach((l, i) => {
    const last = i === lines.length - 1
    ctx.font = `${last ? 'italic ' : ''}400 ${size}px ${serif}`
    ctx.fillStyle = BONE
    ctx.textAlign = 'center'
    ctx.fillText(l, cx, y)
    y += lineH
  })

  // Hook line and roles
  const hookSize = Math.max(18, size * 0.2)
  ctx.font = `italic 400 ${hookSize}px ${serif}`
  ctx.fillStyle = BONE
  ctx.textAlign = 'center'
  ctx.fillText(profile.hook, cx, y - lineH + size * 0.28 + hookSize * 1.1)

  // Roles line, shrunk until it fits the wall
  const roles = profile.roles.join('   /   ').toUpperCase()
  let rs = Math.max(9, size * 0.06)
  let gap = Math.max(2, size * 0.02)
  ctx.font = `500 ${rs}px ${mono}`
  while (rs > 7 && ctx.measureText(roles).width + gap * roles.length > width * 0.9) {
    rs -= 0.5
    gap = Math.max(1, gap * 0.9)
    ctx.font = `500 ${rs}px ${mono}`
  }
  ctx.fillStyle = 'rgba(232,225,207,0.72)'
  spaced(ctx, roles, cx, y - lineH + size * 0.28 + hookSize * 2.6, gap)

  return canvas
}
