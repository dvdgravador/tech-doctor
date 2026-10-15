import { cableSection, METHODS, type Insulation, type Material, type Method, type System } from '../calc/cable'
import { Big, Card, fmt, Info, NumField, parseNum, Row, Segmented, useStored } from '../ui'

const DEFAULT_VOLTS: Record<System, string> = { mono: '230', tri: '400', dc: '24' }

export default function Cable() {
  const [s, setS] = useStored('cable', {
    watts: '',
    meters: '',
    system: 'mono' as System,
    volts: '230',
    cosPhi: '1',
    dropPct: '3',
    material: 'cu' as Material,
    insulation: 'pvc' as Insulation,
    method: 'B1' as Method,
    minSection: 1.5,
  })
  const set = (k: keyof typeof s) => (v: string) => setS({ ...s, [k]: v })

  const watts = parseNum(s.watts)
  const meters = parseNum(s.meters)
  const volts = parseNum(s.volts)
  const cosPhi = parseNum(s.cosPhi)
  const dropPct = parseNum(s.dropPct)
  const ready = watts > 0 && meters > 0 && volts > 0 && dropPct > 0 && (s.system === 'dc' || (cosPhi > 0 && cosPhi <= 1))
  const r = ready
    ? cableSection({ watts, meters, volts, system: s.system, cosPhi, dropPct, material: s.material, insulation: s.insulation, method: s.method, minSection: s.minSection })
    : null
  const methodHint = METHODS.find(m => m.id === s.method)!.hint

  return (
    <>
      <Card title="Sección de cable">
        <div className="grid2">
          <NumField label="Potencia" unit="W" value={s.watts} onChange={set('watts')} />
          <NumField label="Longitud" unit="m" value={s.meters} onChange={set('meters')} hint="distancia de ida" />
        </div>
        <Segmented
          label="Suministro"
          value={s.system}
          options={[{ value: 'mono', label: 'Monofásico' }, { value: 'tri', label: 'Trifásico' }, { value: 'dc', label: 'Continua' }]}
          onChange={v => setS({ ...s, system: v, volts: DEFAULT_VOLTS[v] })}
        />
        <div className="grid3">
          <NumField label="Tensión" unit="V" value={s.volts} onChange={set('volts')} />
          {s.system !== 'dc' && <NumField label="cos φ" value={s.cosPhi} onChange={set('cosPhi')} />}
          <NumField label="Caída máx." unit="%" value={s.dropPct} onChange={set('dropPct')} />
        </div>
        <Segmented
          label="Instalación"
          value={s.method}
          options={METHODS.map(m => ({ value: m.id, label: m.label }))}
          onChange={v => setS({ ...s, method: v })}
        />
        <p className="field-hint">{methodHint}</p>
        <div className="grid2">
          <Segmented label="Conductor" value={s.material} options={[{ value: 'cu', label: 'Cobre' }, { value: 'al', label: 'Aluminio' }]} onChange={v => setS({ ...s, material: v })} />
          <Segmented label="Aislamiento" value={s.insulation} options={[{ value: 'pvc', label: 'PVC 70°' }, { value: 'xlpe', label: 'XLPE 90°' }]} onChange={v => setS({ ...s, insulation: v })} />
        </div>
        <Segmented
          label="Sección mínima del circuito"
          value={s.minSection}
          options={[{ value: 1.5, label: '1,5 mm²' }, { value: 2.5, label: '2,5 mm²' }, { value: 4, label: '4 mm²' }, { value: 6, label: '6 mm²' }]}
          onChange={v => setS({ ...s, minSection: v })}
        />
        <p className="field-hint">Viviendas (ITC-BT-25): 1,5 alumbrado · 2,5 tomas · 4 lavadora/termo · 6 cocina/horno</p>
      </Card>

      {r && (
        <Card tone={r.section === null ? 'warn' : 'result'} title="Resultado">
          {r.section === null ? (
            <p className="note">Hace falta más de 240 mm². Revisa la tensión o divide en varios circuitos/conductores en paralelo.</p>
          ) : (
            <>
              <Big label="Sección recomendada" value={fmt(r.section, 1)} unit="mm²" />
              <Row label="Intensidad (Ib)" value={`${fmt(r.current, 1)} A`} />
              <Row label="Por caída de tensión" value={`${fmt(r.sectionByDrop, 2)} mm² → ${r.sectionByDropStd ? fmt(r.sectionByDropStd, 1) : '>240'}`} />
              <Row label="Por intensidad admisible" value={r.sectionByHeat ? `${fmt(r.sectionByHeat, 1)} mm²` : '>240'} />
              <Row label="Iz de la sección elegida" value={`${fmt(r.iz!, 1)} A`} />
              <Row label="Caída real" value={`${fmt(r.dropVReal!, 2)} V (${fmt(r.dropPctReal!, 2)} %)`} />
              <Row label="Magnetotérmico" value={r.breaker ? `${r.breaker} A` : '—'} />
            </>
          )}
        </Card>
      )}

      <Info title="Cómo se calcula">
        <ul>
          <li>Monofásica / continua: S = 2·P·L / (γ·e·U)</li>
          <li>Trifásica: S = P·L / (γ·e·U)</li>
          <li>e = caída admisible en voltios; γ = 48 (Cu PVC), 44 (Cu XLPE), 30 (Al PVC), 28 (Al XLPE) m/Ω·mm², a temperatura de servicio.</li>
          <li>Ib = P / (U·cos φ) en monofásica; P / (√3·U·cos φ) en trifásica.</li>
          <li>Se elige la sección normalizada mayor de ambos criterios, de forma que quepa un magnetotérmico con Ib ≤ In ≤ Iz.</li>
        </ul>
        <p>Caídas máximas habituales (REBT, ITC-BT-19): 3 % alumbrado y 5 % otros usos en interiores; en viviendas 3 % desde el cuadro. Derivación individual 1–1,5 %. En fotovoltaica de continua se suele trabajar con 1,5 %.</p>
        <p>Intensidades admisibles de IEC/UNE-HD 60364-5-52 a 30 °C en aire o 20 °C enterrado, para un solo circuito. Con varios circuitos agrupados, temperaturas altas o cables en terrenos secos hay que aplicar factores de corrección: el resultado es orientativo y no sustituye al cálculo del proyecto.</p>
      </Info>
    </>
  )
}
