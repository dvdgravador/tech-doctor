// Sección de cable: el mayor de dos criterios
//  1) caída de tensión admisible
//  2) intensidad admisible (calentamiento), IEC 60364-5-52 / UNE-HD 60364-5-52
// Tablas: aire 30 °C (tabla C.52.1, simplificada de la Electrical Installation Guide),
// enterrado 20 °C, 2,5 K·m/W (tabla B.52-1). Sin factores de agrupamiento ni temperatura.

export type System = 'mono' | 'tri' | 'dc'
export type Material = 'cu' | 'al'
export type Insulation = 'pvc' | 'xlpe'
export type Method = 'B1' | 'C' | 'E' | 'D'

export const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const

export const METHODS: { id: Method; label: string; hint: string }[] = [
  { id: 'B1', label: 'B1', hint: 'Unipolares en tubo (empotrado o en superficie)' },
  { id: 'C', label: 'C', hint: 'Manguera grapeada directamente a la pared' },
  { id: 'E', label: 'E', hint: 'Manguera al aire / bandeja perforada' },
  { id: 'D', label: 'D', hint: 'Enterrado (en tubo o directo)' },
]

// Columnas 2..13 de la tabla C.52.1 (índice 0 = columna 2). null = no aplica.
const N = null
const AIR_CU: (number | null)[][] = [
  [13, 13.5, 14.5, 15.5, 17, 18.5, 19.5, 22, 23, 24, 26, N],
  [17.5, 18, 19.5, 21, 23, 25, 27, 30, 31, 33, 36, N],
  [23, 24, 26, 28, 31, 34, 36, 40, 42, 45, 49, N],
  [29, 31, 34, 36, 40, 43, 46, 51, 54, 58, 63, N],
  [39, 42, 46, 50, 54, 60, 63, 70, 75, 80, 86, N],
  [52, 56, 61, 68, 73, 80, 85, 94, 100, 107, 115, N],
  [68, 73, 80, 89, 95, 101, 110, 119, 127, 135, 149, 161],
  [N, N, N, 110, 117, 126, 137, 147, 158, 169, 185, 200],
  [N, N, N, 134, 141, 153, 167, 179, 192, 207, 225, 242],
  [N, N, N, 171, 179, 196, 213, 229, 246, 268, 289, 310],
  [N, N, N, 207, 216, 238, 258, 278, 298, 328, 352, 377],
  [N, N, N, 239, 249, 276, 299, 322, 346, 382, 410, 437],
  [N, N, N, N, 285, 318, 344, 371, 395, 441, 473, 504],
  [N, N, N, N, 324, 362, 392, 424, 450, 506, 542, 575],
  [N, N, N, N, 380, 424, 461, 500, 538, 599, 641, 679],
]
// Aluminio empieza en 2,5 mm²
const AIR_AL: (number | null)[][] = [
  [N, N, N, N, N, N, N, N, N, N, N, N],
  [13.5, 14, 15, 16.5, 18.5, 19.5, 21, 23, 24, 26, 28, N],
  [17.5, 18.5, 20, 22, 25, 26, 28, 31, 32, 35, 38, N],
  [23, 24, 26, 28, 32, 33, 36, 39, 42, 45, 49, N],
  [31, 32, 36, 39, 44, 46, 49, 54, 58, 62, 67, N],
  [41, 43, 48, 53, 58, 61, 66, 73, 77, 84, 91, N],
  [53, 57, 63, 70, 73, 78, 83, 90, 97, 101, 108, 121],
  [N, N, N, 86, 90, 96, 103, 112, 120, 126, 135, 150],
  [N, N, N, 104, 110, 117, 125, 136, 146, 154, 164, 184],
  [N, N, N, 133, 140, 150, 160, 174, 187, 198, 211, 237],
  [N, N, N, 161, 170, 183, 195, 211, 227, 241, 257, 289],
  [N, N, N, 186, 197, 212, 226, 245, 263, 280, 300, 337],
  [N, N, N, N, 226, 245, 261, 283, 304, 324, 346, 389],
  [N, N, N, N, 256, 280, 298, 323, 347, 371, 397, 447],
  [N, N, N, N, 300, 330, 352, 382, 409, 439, 470, 530],
]
// Columna de la tabla según método, aislamiento y nº de conductores cargados
const AIR_COL: Record<Exclude<Method, 'D'>, Record<string, number>> = {
  B1: { pvc3: 3, pvc2: 4, xlpe3: 6, xlpe2: 8 },
  C: { pvc3: 4, pvc2: 6, xlpe3: 7, xlpe2: 9 },
  E: { pvc3: 5, pvc2: 7, xlpe3: 8, xlpe2: 10 },
}
// Enterrado: [PVC2, PVC3, XLPE2, XLPE3]
const BURIED_CU = [
  [22, 18, 26, 22], [29, 24, 34, 29], [38, 31, 44, 37], [47, 39, 56, 46], [63, 52, 73, 61],
  [81, 67, 95, 79], [104, 86, 121, 101], [125, 103, 146, 122], [148, 122, 173, 144],
  [183, 151, 213, 178], [216, 179, 252, 211], [246, 203, 287, 240], [278, 230, 324, 271],
  [312, 258, 363, 304], [361, 297, 419, 351],
]
const BURIED_AL = [
  [N, N, N, N], [22, 18.5, 26, 22], [29, 24, 34, 29], [36, 30, 42, 36], [48, 40, 56, 47],
  [62, 52, 73, 61], [80, 66, 93, 78], [96, 80, 112, 94], [113, 94, 132, 112],
  [140, 117, 163, 138], [166, 138, 193, 164], [189, 157, 220, 186], [213, 178, 249, 210],
  [240, 200, 279, 236], [277, 230, 322, 272],
]

export function ampacity(i: number, material: Material, ins: Insulation, method: Method, loaded: 2 | 3): number | null {
  const key = `${ins}${loaded}`
  if (method === 'D') {
    const col = ['pvc2', 'pvc3', 'xlpe2', 'xlpe3'].indexOf(key)
    return (material === 'cu' ? BURIED_CU : BURIED_AL)[i][col]
  }
  return (material === 'cu' ? AIR_CU : AIR_AL)[i][AIR_COL[method][key]]
}

// Conductividad a la temperatura máxima de servicio del aislamiento (m/Ω·mm²)
export function conductivity(material: Material, ins: Insulation): number {
  if (material === 'cu') return ins === 'pvc' ? 48 : 44
  return ins === 'pvc' ? 30 : 28
}

// Calibres normalizados de magnetotérmico
const BREAKERS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400]

export interface CableInput {
  watts: number
  meters: number
  volts: number
  system: System
  cosPhi: number
  dropPct: number
  material: Material
  insulation: Insulation
  method: Method
  minSection?: number // mínimo reglamentario del circuito (p. ej. 2,5 mm² en tomas)
}

export interface CableResult {
  current: number
  sectionByDrop: number // mm² teóricos, sin redondear
  sectionByDropStd: number | null
  sectionByHeat: number | null
  section: number | null // recomendada (null: más de 240 mm²)
  iz: number | null // intensidad admisible de la sección recomendada
  dropPctReal: number | null
  dropVReal: number | null
  breaker: number | null // In con Ib ≤ In ≤ Iz
}

export function cableSection(inp: CableInput): CableResult {
  const { watts: P, meters: L, volts: U, system, material, insulation, method } = inp
  const cos = system === 'dc' ? 1 : inp.cosPhi
  const gamma = conductivity(material, insulation)
  const e = (inp.dropPct / 100) * U

  const current = system === 'tri' ? P / (Math.sqrt(3) * U * cos) : P / (U * cos)
  // Fórmulas resistivas habituales (REBT / guía técnica): monofásica y continua 2·L ida y vuelta
  const sectionByDrop = system === 'tri' ? (P * L) / (gamma * e * U) : (2 * P * L) / (gamma * e * U)
  const loaded = system === 'tri' ? 3 : 2

  const valid = SECTIONS.map((_, i) => ampacity(i, material, insulation, method, loaded) !== null)
  const iDrop = SECTIONS.findIndex((s, i) => valid[i] && s >= sectionByDrop)
  const iHeat = SECTIONS.findIndex((_, i) => {
    const iz = ampacity(i, material, insulation, method, loaded)
    return iz !== null && iz >= current
  })
  const sectionByDropStd = iDrop >= 0 ? SECTIONS[iDrop] : null
  const sectionByHeat = iHeat >= 0 ? SECTIONS[iHeat] : null

  if (iDrop < 0 || iHeat < 0) {
    return { current, sectionByDrop, sectionByDropStd, sectionByHeat, section: null, iz: null, dropPctReal: null, dropVReal: null, breaker: null }
  }
  // Si no cabe un calibre normalizado entre Ib e Iz, se sube una sección más
  const iMin = SECTIONS.findIndex((s, i) => valid[i] && s >= (inp.minSection ?? 0))
  let idx = Math.max(iDrop, iHeat, iMin)
  const fits = (i: number) => {
    const iz = ampacity(i, material, insulation, method, loaded)!
    return BREAKERS.find(b => b >= current && b <= iz) ?? null
  }
  while (fits(idx) === null && idx < SECTIONS.length - 1) idx++
  const section = SECTIONS[idx]
  const iz = ampacity(idx, material, insulation, method, loaded)!
  const dropVReal = system === 'tri' ? (P * L) / (gamma * section * U) : (2 * P * L) / (gamma * section * U)
  const breaker = fits(idx)
  return {
    current, sectionByDrop, sectionByDropStd, sectionByHeat, section, iz,
    dropVReal, dropPctReal: (dropVReal / U) * 100, breaker,
  }
}
