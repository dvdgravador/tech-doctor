import { convertHardness, hardnessClass, HARDNESS_UNITS, type HardnessUnit } from '../calc/hardness'
import { Card, fmt, Info, parseNum, useStored } from '../ui'

export default function Hardness() {
  const [s, setS] = useStored<{ unit: HardnessUnit; text: string }>('hardness', { unit: 'fH', text: '30' })
  const v = parseNum(s.text)
  const all = Number.isFinite(v) ? convertHardness(v, s.unit) : null

  return (
    <>
      <Card title="Conversión de dureza">
        <p className="lead">Escribe en cualquier casilla y se convierten las demás.</p>
        <div className="hard-list">
          {HARDNESS_UNITS.map(u => (
            <label key={u.id} className={`hard-row${u.id === s.unit ? ' active' : ''}`}>
              <span className="hard-name">
                <strong>{u.label}</strong>
                <small>{u.hint}</small>
              </span>
              <input
                inputMode="decimal"
                value={u.id === s.unit ? s.text : all ? fmt(all[u.id], u.id === 'mmol' ? 3 : 2) : ''}
                onFocus={e => {
                  if (u.id !== s.unit && all) setS({ unit: u.id, text: String(round(all[u.id])) })
                  requestAnimationFrame(() => e.target.select())
                }}
                onChange={e => setS({ unit: u.id, text: e.target.value })}
              />
            </label>
          ))}
        </div>
        {all && <p className="badge">{hardnessClass(all.fH)}</p>}
      </Card>
      <Info title="Equivalencias">
        <ul>
          <li>1 °dH = 17,848 mg/L CaCO₃ = 1,785 °fH</li>
          <li>1 °fH = 10 mg/L CaCO₃ = 0,56 °dH</li>
          <li>1 gpg (grano/galón EE. UU.) = 17,118 mg/L CaCO₃</li>
          <li>1 °e (inglés, Clark) = 14,254 mg/L CaCO₃</li>
          <li>1 mmol/L = 100,09 mg/L CaCO₃</li>
          <li>ppm y mg/L coinciden en agua (expresados como CaCO₃).</li>
        </ul>
        <p>Escala orientativa en °fH: &lt;7 muy blanda · 7–14 blanda · 14–22 semidura · 22–32 dura · &gt;32 muy dura.</p>
      </Info>
    </>
  )
}

function round(n: number) {
  return Math.round(n * 1000) / 1000
}
