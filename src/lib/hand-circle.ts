/**
 * Trace un cercle « entouré à la main » : légèrement ovale, irrégulier,
 * dont la fin dépasse le début comme un trait de stylo.
 * Déterministe selon la graine, pour que chaque élément garde son propre tracé.
 */
export function handCirclePath(seed: number, size = 48): string {
  const rand = mulberry32(seed * 9301 + 49297)
  const c = size / 2
  const r = size * 0.4
  const start = -Math.PI * (0.35 + rand() * 0.2)
  const sweep = Math.PI * 2 * (1.08 + rand() * 0.06)
  const squash = 0.9 + rand() * 0.08
  const tilt = (rand() - 0.5) * 0.5
  const wobblePhase = rand() * Math.PI * 2
  const steps = 28
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = start + sweep * t
    const rr = r * (1 + 0.045 * Math.sin(a * 2 + wobblePhase) - 0.06 * t)
    const x = Math.cos(a) * rr
    const y = Math.sin(a) * rr * squash
    pts.push([c + x * Math.cos(tilt) - y * Math.sin(tilt), c + x * Math.sin(tilt) + y * Math.cos(tilt)])
  }
  // Courbe lissée (Catmull-Rom → Bézier)
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
