import { describe, expect, it } from 'vitest'
import { convertHardness } from '../src/calc/hardness'
import { alkalinityDose, alkalinityFromTablets } from '../src/calc/alkalinity'
import { cableSection } from '../src/calc/cable'
import { booster, closedCircuit, expansionCoefficient, sanitary } from '../src/calc/expansion'

describe('dureza', () => {
  it('1 °dH = 1,7848 °fH = 17,848 mg/L', () => {
    const r = convertHardness(1, 'dH')
    expect(r.fH).toBeCloseTo(1.7848, 4)
    expect(r.mgl).toBeCloseTo(17.848, 3)
    expect(r.ppm).toBeCloseTo(17.848, 3)
  })
  it('1 gpg = 17,118 ppm', () => {
    expect(convertHardness(1, 'gpg').ppm).toBeCloseTo(17.118, 3)
  })
  it('ida y vuelta', () => {
    expect(convertHardness(convertHardness(25, 'fH').gpg, 'gpg').fH).toBeCloseTo(25, 9)
  })
})

describe('alcalinidad (mismas fórmulas que el repo alcalinity)', () => {
  it('pastillas', () => {
    expect(alkalinityFromTablets(3, 50)).toBe(100)
    expect(alkalinityFromTablets(6, 100)).toBe(110)
  })
  it('dosis: 1,8 kg por 10 ppm en 100 m³', () => {
    const r = alkalinityDose(3, 50, 100) // 100 ppm → faltan 25
    expect(r.difference).toBe(25)
    expect(r.kilos).toBeCloseTo(4.5, 9)
    // mismo resultado que (dif·vol·1,8)/1000 del repo original
    expect(alkalinityDose(2, 50, 60).kilos).toBeCloseTo((65 * 60 * 1.8) / 1000, 9)
  })
  it('por encima del objetivo no se dosifica', () => {
    const r = alkalinityDose(5, 50, 50)
    expect(r.kilos).toBe(0)
    expect(r.aboveTarget).toBe(true)
  })
})

describe('cable', () => {
  const base = { volts: 230, system: 'mono' as const, cosPhi: 1, dropPct: 3, material: 'cu' as const, insulation: 'pvc' as const, method: 'B1' as const }
  it('3680 W a 10 m: manda la intensidad (16 A → 1,5 mm², Iz 17 A)', () => {
    const r = cableSection({ ...base, watts: 3680, meters: 10 })
    expect(r.current).toBeCloseTo(16, 6)
    expect(r.section).toBe(1.5)
    expect(r.breaker).toBe(16)
  })
  it('3680 W a 60 m: manda la caída de tensión', () => {
    const r = cableSection({ ...base, watts: 3680, meters: 60 })
    // S = 2·3680·60 / (48·6,9·230) = 5,8 mm²
    expect(r.sectionByDrop).toBeCloseTo(5.8, 1)
    expect(r.section).toBe(6)
    expect(r.dropPctReal!).toBeLessThanOrEqual(3)
  })
  it('trifásico', () => {
    const r = cableSection({ ...base, system: 'tri', volts: 400, cosPhi: 0.85, watts: 15000, meters: 30, method: 'C' })
    expect(r.current).toBeCloseTo(25.47, 1)
    expect(r.section).toBe(6) // 4 mm² aguanta 31 A pero no cabe calibre entre 25,5 y 31 A → 6 mm² con PIA 32 A
    expect(r.breaker).toBe(32)
  })
})

describe('vasos de expansión', () => {
  it('dilatación 10→80 °C ≈ 2,87 %', () => {
    expect(expansionCoefficient(80)).toBeCloseTo(0.0287, 3)
  })
  it('primario: 10 m, 3 bar, 150 L, 80 °C', () => {
    const r = closedCircuit({ staticHeight: 10, margin: 0.3, safetyValve: 3, waterVolume: 150, tMax: 80 })
    expect(r.p0).toBeCloseTo(1.3, 9)
    expect(r.pf).toBeCloseTo(2.5, 9)
    // Ve = 4,31 L → Vn = 4,31·3,5/1,2 = 12,6 L
    expect(r.vn!).toBeCloseTo(12.57, 1)
    expect(r.size).toBe(18)
  })
  it('ACS sanitario precarga a presión de red', () => {
    const r = sanitary({ networkPressure: 3.5, safetyValve: 6, tankVolume: 200, tMax: 60 })
    expect(r.p0).toBeCloseTo(3.3, 9)
    expect(r.ok).toBe(true)
  })
  it('grupo de presión: 2,5/4 bar, 50 L/min, 20 arranques/h', () => {
    const r = booster({ pOn: 2.5, pOff: 4, flow: 50, startsPerHour: 20, margin: 0.2 })
    expect(r.p0).toBeCloseTo(2.3, 9)
    expect(r.drawdown).toBeCloseTo(37.5, 9)
    // V = 37,5 / (3,3·(1/3,5 − 1/5)) = 132,6 L
    expect(r.vn!).toBeCloseTo(132.6, 0)
    expect(r.size).toBe(150)
  })
})
