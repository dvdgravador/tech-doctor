// Dureza del agua. Todo se pasa por mg/L de CaCO3 equivalente (= ppm).

export type HardnessUnit = 'dH' | 'fH' | 'mgl' | 'ppm' | 'gpg' | 'eH' | 'mmol'

export const HARDNESS_UNITS: { id: HardnessUnit; label: string; hint: string; mgPerUnit: number }[] = [
  { id: 'dH', label: '°dH', hint: 'Grados alemanes', mgPerUnit: 17.848 },
  { id: 'fH', label: '°fH', hint: 'Grados franceses', mgPerUnit: 10 },
  { id: 'mgl', label: 'mg/L', hint: 'mg/L CaCO₃', mgPerUnit: 1 },
  { id: 'ppm', label: 'ppm', hint: 'ppm CaCO₃', mgPerUnit: 1 },
  { id: 'gpg', label: 'gpg', hint: 'Granos por galón (EE. UU.)', mgPerUnit: 17.118 },
  { id: 'eH', label: '°e', hint: 'Grados ingleses (Clark)', mgPerUnit: 14.254 },
  { id: 'mmol', label: 'mmol/L', hint: 'mmol/L de Ca²⁺ + Mg²⁺', mgPerUnit: 100.09 },
]

export function convertHardness(value: number, from: HardnessUnit): Record<HardnessUnit, number> {
  const mg = value * unit(from).mgPerUnit
  const out = {} as Record<HardnessUnit, number>
  for (const u of HARDNESS_UNITS) out[u.id] = mg / u.mgPerUnit
  return out
}

function unit(id: HardnessUnit) {
  return HARDNESS_UNITS.find(u => u.id === id)!
}

// Clasificación orientativa (escala habitual en España, en °fH)
export function hardnessClass(fH: number): string {
  if (fH < 7) return 'Muy blanda'
  if (fH < 14) return 'Blanda'
  if (fH < 22) return 'Semidura'
  if (fH < 32) return 'Dura'
  return 'Muy dura'
}
