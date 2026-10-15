import { alkalinityDose, DEFAULT_KG_PER_10PPM_100M3, DEFAULT_TARGET_PPM, type SampleMl } from '../calc/alkalinity'
import { Big, Card, fmt, Info, NumField, parseNum, Row, Segmented, useStored } from '../ui'

export default function Alkalinity() {
  const [s, setS] = useStored('alkalinity', {
    tablets: '',
    sample: 50 as SampleMl,
    volume: '',
    target: String(DEFAULT_TARGET_PPM),
    dose: fmt(DEFAULT_KG_PER_10PPM_100M3),
  })
  const set = (k: keyof typeof s) => (v: string) => setS({ ...s, [k]: v })

  const tablets = parseNum(s.tablets)
  const volume = parseNum(s.volume)
  const target = parseNum(s.target)
  const dose = parseNum(s.dose)
  const ready = tablets >= 0 && volume > 0 && target > 0 && dose > 0
  const r = ready ? alkalinityDose(tablets, s.sample, volume, target, dose) : null

  return (
    <>
      <Card title="Bicarbonato para piscina">
        <p className="lead">Test de alcalinidad por pastillas: añade pastillas a la muestra hasta el cambio de color y cuéntalas.</p>
        <NumField label="Pastillas usadas" value={s.tablets} onChange={set('tablets')} />
        <Segmented
          label="Volumen de la muestra"
          value={s.sample}
          options={[{ value: 50, label: '50 ml' }, { value: 100, label: '100 ml' }]}
          onChange={v => setS({ ...s, sample: v })}
        />
        <NumField label="Volumen de la piscina" unit="m³" value={s.volume} onChange={set('volume')} />
        <div className="grid2">
          <NumField label="Objetivo" unit="ppm" value={s.target} onChange={set('target')} />
          <NumField label="Dosis bicarbonato" unit="kg" value={s.dose} onChange={set('dose')} hint="por 10 ppm en 100 m³" />
        </div>
      </Card>

      {r && (
        <Card tone={r.aboveTarget ? 'warn' : 'result'} title="Resultado">
          <Big label="Añadir bicarbonato de sodio" value={fmt(r.kilos)} unit="kg" />
          <Row label="Alcalinidad medida" value={`${fmt(r.alkalinity, 0)} ppm`} />
          <Row label="Objetivo" value={`${fmt(r.target, 0)} ppm`} />
          <Row label="Falta por subir" value={`${fmt(r.difference, 0)} ppm`} />
          {r.difference === 0 && !r.aboveTarget && <p className="note">Alcalinidad en el objetivo. No hace falta añadir.</p>}
          {r.aboveTarget && (
            <p className="note">Alcalinidad por encima del objetivo: no añadas bicarbonato. Para bajarla se usa minorador de pH (ácido) con aireación.</p>
          )}
          {r.kilos > 0 && (
            <>
              <p className="note">Repártelo en varias tandas si son más de 2–3 kg, con la depuradora en marcha. Vuelve a medir a las 4–6 h.</p>
              <p className="note">
                <strong>Ojo con el pH:</strong> después de añadir el bicarbonato es normal que el pH suba. Mídelo pasadas unas horas y
                corrígelo con minorador de pH hasta 7,2–7,6 para dejar el agua equilibrada.
              </p>
            </>
          )}
        </Card>
      )}

      <Info title="Cómo se calcula">
        <ul>
          <li>Muestra 50 ml: alcalinidad = pastillas × 40 − 20 ppm</li>
          <li>Muestra 100 ml: alcalinidad = pastillas × 20 − 10 ppm</li>
          <li>Kilos = (ppm que faltan / 10) × (m³ / 100) × dosis</li>
          <li>Dosis por defecto: 1,8 kg de bicarbonato de sodio suben 10 ppm en 100 m³ (el valor teórico para bicarbonato puro es 1,68 kg; la diferencia es margen por pureza y pérdidas).</li>
        </ul>
        <p>Rango recomendado: 80–120 ppm; objetivo habitual 125 ppm.</p>
        <p>El bicarbonato de sodio sube la alcalinidad y también, en menor medida, el pH. Tras el tratamiento es normal que el pH suba: hay que medirlo y regularlo después (7,2–7,6) para equilibrar el agua.</p>
      </Info>
    </>
  )
}
