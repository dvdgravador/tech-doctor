// Alcalinidad por test de pastillas (método de github.com/dvdgravador/alcalinity).
// Se añaden pastillas a la muestra hasta el viraje de color y se cuentan.

export type SampleMl = 50 | 100

export function alkalinityFromTablets(tablets: number, sampleMl: SampleMl): number {
  return sampleMl === 50 ? tablets * 40 - 20 : tablets * 20 - 10
}

// Dosis por defecto: 1,8 kg de bicarbonato de sodio suben 10 ppm en 100 m³
// (teórico para bicarbonato puro: ~1,68 kg; el resto es margen de pureza y pérdidas).
export const DEFAULT_KG_PER_10PPM_100M3 = 1.8
export const DEFAULT_TARGET_PPM = 125

export interface AlkalinityResult {
  alkalinity: number
  target: number
  difference: number // ppm a subir (0 si ya está en el objetivo o por encima)
  kilos: number
  aboveTarget: boolean
}

export function alkalinityDose(
  tablets: number,
  sampleMl: SampleMl,
  volumeM3: number,
  target = DEFAULT_TARGET_PPM,
  kgPer10ppm100m3 = DEFAULT_KG_PER_10PPM_100M3,
): AlkalinityResult {
  const alkalinity = Math.max(0, alkalinityFromTablets(tablets, sampleMl))
  const difference = Math.max(0, target - alkalinity)
  const kilos = (difference / 10) * (volumeM3 / 100) * kgPer10ppm100m3
  return { alkalinity, target, difference, kilos, aboveTarget: alkalinity > target }
}
