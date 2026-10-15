// Vasos de expansión de membrana. Presiones en bar relativos (manométricos);
// la ley de Boyle se aplica con absolutos (+1 bar).

export const COMMERCIAL_SIZES = [2, 5, 8, 12, 18, 24, 35, 50, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000]

export function commercialSize(liters: number): number | null {
  return COMMERCIAL_SIZES.find(s => s >= liters) ?? null
}

// Densidad del agua (kg/m³) para calcular la dilatación desde 10 °C de llenado
const DENSITY: [number, number][] = [
  [10, 999.7], [20, 998.21], [30, 995.65], [40, 992.22], [50, 988.04], [60, 983.2],
  [70, 977.76], [80, 971.79], [90, 965.31], [100, 958.35], [110, 950.95],
]

function density(t: number): number {
  const c = Math.min(110, Math.max(10, t))
  for (let i = 1; i < DENSITY.length; i++) {
    const [t1, d1] = DENSITY[i]
    const [t0, d0] = DENSITY[i - 1]
    if (c <= t1) return d0 + ((c - t0) / (t1 - t0)) * (d1 - d0)
  }
  return DENSITY[DENSITY.length - 1][1]
}

// Coeficiente de dilatación entre 10 °C y tMax (fracción, 0,0287 a 80 °C)
export function expansionCoefficient(tMax: number): number {
  return density(10) / density(tMax) - 1
}

// Presión máxima de trabajo del vaso: margen hasta el disparo de la válvula de seguridad
export function finalPressure(safetyValve: number): number {
  return safetyValve <= 5 ? safetyValve - 0.5 : safetyValve * 0.9
}

// Volumen nominal por Boyle: Vn = Ve · (Pf+1) / (Pf − P0)
export function vesselVolume(ve: number, p0: number, pf: number): number {
  return (ve * (pf + 1)) / (pf - p0)
}

// ---------- Circuito cerrado (primario de calefacción / caldera / ACS primario) ----------
export interface ClosedInput {
  staticHeight: number // m de columna sobre el vaso hasta el punto más alto
  margin: number // bar sobre la presión estática (0,2–0,3)
  safetyValve: number // bar
  waterVolume: number // L de agua en la instalación
  tMax: number // °C
}

export function closedCircuit(inp: ClosedInput) {
  const pStatic = inp.staticHeight / 10
  const p0 = pStatic + inp.margin
  const fill = p0 + 0.3 // presión de llenado en frío
  const pf = finalPressure(inp.safetyValve)
  const n = expansionCoefficient(inp.tMax)
  const ve = inp.waterVolume * n
  const ok = pf > fill
  const vn = ok ? vesselVolume(ve, p0, pf) : null
  return { pStatic, p0, fill, pf, n, ve, vn, size: vn === null ? null : commercialSize(vn), ok }
}

// ---------- ACS sanitario (vaso en la entrada de agua fría del acumulador) ----------
export interface SanitaryInput {
  networkPressure: number // bar, aguas abajo del reductor
  safetyValve: number // bar (6 u 8 típicamente)
  tankVolume: number // L del acumulador
  tMax: number
}

export function sanitary(inp: SanitaryInput) {
  // El vaso está en contacto permanente con la red: se precarga a su presión
  // (unas décimas menos para que la membrana quede ligeramente apoyada)
  const p0 = Math.max(0, inp.networkPressure - 0.2)
  const pf = finalPressure(inp.safetyValve)
  const n = expansionCoefficient(inp.tMax)
  const ve = inp.tankVolume * n
  const ok = pf > inp.networkPressure
  const vn = ok ? vesselVolume(ve, p0, pf) : null
  return { p0, pf, n, ve, vn, size: vn === null ? null : commercialSize(vn), ok }
}

// ---------- Grupo de presión (calderín hidroneumático) ----------
export interface BoosterInput {
  pOn: number // bar, presión de arranque
  pOff: number // bar, presión de paro
  flow: number // L/min de la bomba a presión media
  startsPerHour: number
  margin: number // bar por debajo del arranque (0,2–0,3)
}

export function booster(inp: BoosterInput) {
  const p0 = Math.max(0, inp.pOn - inp.margin)
  const ok = inp.pOff > inp.pOn
  // Peor caso de ciclos: consumo = mitad del caudal de la bomba → ciclo = 4·ΔV/Q.
  // Para no superar Z arranques/hora: ΔV ≥ Q/(4·Z)
  const qh = inp.flow * 60 // L/h
  const drawdown = qh / (4 * inp.startsPerHour) // L útiles entre paro y arranque
  // ΔV = V·(P0+1)·(1/(Pon+1) − 1/(Poff+1))
  const factor = (p0 + 1) * (1 / (inp.pOn + 1) - 1 / (inp.pOff + 1))
  const vn = ok ? drawdown / factor : null
  return { p0, drawdown, factor, vn, size: vn === null ? null : commercialSize(vn), ok }
}
