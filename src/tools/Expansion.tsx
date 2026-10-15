import { booster, closedCircuit, sanitary } from '../calc/expansion'
import { Big, Card, fmt, Info, NumField, parseNum, Row, Segmented, useStored } from '../ui'

type Mode = 'closed' | 'sanitary' | 'booster'

export default function Expansion() {
  const [mode, setMode] = useStored<{ m: Mode }>('expansion-mode', { m: 'closed' })
  return (
    <>
      <Segmented
        value={mode.m}
        options={[
          { value: 'closed', label: 'Primario' },
          { value: 'sanitary', label: 'ACS' },
          { value: 'booster', label: 'Grupo presión' },
        ]}
        onChange={m => setMode({ m })}
      />
      {mode.m === 'closed' && <Closed />}
      {mode.m === 'sanitary' && <Sanitary />}
      {mode.m === 'booster' && <Booster />}
      <WhyDifferent />
    </>
  )
}

function Closed() {
  const [s, setS] = useStored('exp-closed', { height: '', margin: '0,3', valve: '3', volume: '', tMax: '80' })
  const set = (k: keyof typeof s) => (v: string) => setS({ ...s, [k]: v })
  const height = parseNum(s.height)
  const margin = parseNum(s.margin)
  const valve = parseNum(s.valve)
  const volume = parseNum(s.volume)
  const tMax = parseNum(s.tMax)
  const ready = height >= 0 && margin >= 0 && valve > 0
  const r = ready ? closedCircuit({ staticHeight: height, margin, safetyValve: valve, waterVolume: volume > 0 ? volume : 0, tMax: tMax > 0 ? tMax : 80 }) : null

  return (
    <>
      <Card title="Circuito primario cerrado">
        <p className="lead">Calefacción, caldera, aerotermia, solar o primario de interacumulador.</p>
        <NumField label="Altura estática" unit="m" value={s.height} onChange={set('height')} hint="desde el vaso hasta el punto más alto de la instalación" />
        <div className="grid2">
          <NumField label="Margen" unit="bar" value={s.margin} onChange={set('margin')} hint="0,2–0,3 bar" />
          <NumField label="Válvula seguridad" unit="bar" value={s.valve} onChange={set('valve')} />
        </div>
        <div className="grid2">
          <NumField label="Agua instalación" unit="L" value={s.volume} onChange={set('volume')} hint="opcional, para el volumen" />
          <NumField label="Temp. máxima" unit="°C" value={s.tMax} onChange={set('tMax')} />
        </div>
      </Card>
      {r && (
        <Card tone={r.ok ? 'result' : 'warn'} title="Resultado">
          <Big label="Precarga de aire (con el vaso sin agua)" value={fmt(r.p0)} unit="bar" />
          <Row label="Presión estática" value={`${fmt(r.pStatic)} bar`} />
          <Row label="Presión de llenado en frío" value={`${fmt(r.fill)} bar`} />
          <Row label="Presión máxima de trabajo" value={`${fmt(r.pf)} bar`} />
          {!r.ok && <p className="note">La presión de llenado no deja margen hasta la válvula de seguridad. Sube el tarado de la válvula o revisa la altura.</p>}
          {r.ok && volume > 0 && r.vn !== null && (
            <>
              <Row label={`Dilatación del agua a ${fmt(tMax > 0 ? tMax : 80, 0)} °C`} value={`${fmt(r.n * 100)} % → ${fmt(r.ve, 1)} L`} />
              <Row label="Volumen mínimo del vaso" value={`${fmt(r.vn, 1)} L`} />
              <Row label="Vaso comercial" value={r.size ? `${r.size} L` : 'más de 1000 L'} />
            </>
          )}
        </Card>
      )}
      <Info title="Cómo se calcula">
        <ul>
          <li>Precarga P₀ = altura estática / 10 + margen (0,2–0,3 bar)</li>
          <li>Llenado en frío = P₀ + 0,3 bar, para que haya una reserva de agua en el vaso</li>
          <li>Presión final Pf = válvula − 0,5 bar (hasta 5 bar) o 90 % del tarado</li>
          <li>Ve = agua × dilatación desde 10 °C (por densidades reales del agua)</li>
          <li>Vaso = Ve · (Pf + 1) / (Pf − P₀) (ley de Boyle con presiones absolutas)</li>
        </ul>
        <p>Comprueba y ajusta la precarga con el circuito sin presión (vaso aislado y vaciado de agua). Mide en la válvula del vaso con un manómetro de neumáticos.</p>
      </Info>
    </>
  )
}

function Sanitary() {
  const [s, setS] = useStored('exp-sanitary', { network: '3', valve: '6', tank: '', tMax: '60' })
  const set = (k: keyof typeof s) => (v: string) => setS({ ...s, [k]: v })
  const network = parseNum(s.network)
  const valve = parseNum(s.valve)
  const tank = parseNum(s.tank)
  const tMax = parseNum(s.tMax)
  const ready = network > 0 && valve > 0
  const r = ready ? sanitary({ networkPressure: network, safetyValve: valve, tankVolume: tank > 0 ? tank : 0, tMax: tMax > 0 ? tMax : 60 }) : null

  return (
    <>
      <Card title="ACS sanitaria (acumulador)">
        <p className="lead">Vaso en la entrada de agua fría del acumulador o termo, después del reductor y la antirretorno.</p>
        <div className="grid2">
          <NumField label="Presión de red" unit="bar" value={s.network} onChange={set('network')} hint="tras el reductor" />
          <NumField label="Válvula seguridad" unit="bar" value={s.valve} onChange={set('valve')} />
        </div>
        <div className="grid2">
          <NumField label="Acumulador" unit="L" value={s.tank} onChange={set('tank')} hint="opcional, para el volumen" />
          <NumField label="Temp. máxima" unit="°C" value={s.tMax} onChange={set('tMax')} hint="70 °C si hay antilegionela" />
        </div>
      </Card>
      {r && (
        <Card tone={r.ok ? 'result' : 'warn'} title="Resultado">
          <Big label="Precarga de aire" value={fmt(r.p0)} unit="bar" />
          <Row label="Presión máxima de trabajo" value={`${fmt(r.pf)} bar`} />
          {!r.ok && <p className="note">La presión de red es igual o mayor que la de trabajo máxima: instala o ajusta un reductor de presión.</p>}
          {r.ok && tank > 0 && r.vn !== null && (
            <>
              <Row label="Dilatación" value={`${fmt(r.n * 100)} % → ${fmt(r.ve, 1)} L`} />
              <Row label="Volumen mínimo del vaso" value={`${fmt(r.vn, 1)} L`} />
              <Row label="Vaso comercial (apto ACS)" value={r.size ? `${r.size} L` : 'más de 1000 L'} />
            </>
          )}
        </Card>
      )}
      <Info title="Cómo se calcula">
        <p>Aquí el vaso está siempre conectado a la red, así que su precarga se iguala a la presión de red (0,2 bar menos). Si la precarga fuera menor, la membrana se llenaría de agua fría sin calentar y no quedaría hueco para la dilatación. Usa vasos aptos para agua potable (membrana alimentaria, normalmente blancos).</p>
      </Info>
    </>
  )
}

function Booster() {
  const [s, setS] = useStored('exp-booster', { pOn: '', pOff: '', flow: '', starts: '20', margin: '0,2' })
  const set = (k: keyof typeof s) => (v: string) => setS({ ...s, [k]: v })
  const pOn = parseNum(s.pOn)
  const pOff = parseNum(s.pOff)
  const flow = parseNum(s.flow)
  const starts = parseNum(s.starts)
  const margin = parseNum(s.margin)
  const ready = pOn > 0 && margin >= 0
  const r = ready ? booster({ pOn, pOff: pOff > 0 ? pOff : pOn, flow: flow > 0 ? flow : 0, startsPerHour: starts > 0 ? starts : 20, margin }) : null
  const sized = r && r.ok && flow > 0 && starts > 0

  return (
    <>
      <Card title="Grupo de presión (calderín)">
        <div className="grid2">
          <NumField label="Presión arranque" unit="bar" value={s.pOn} onChange={set('pOn')} />
          <NumField label="Presión paro" unit="bar" value={s.pOff} onChange={set('pOff')} />
        </div>
        <NumField label="Margen bajo el arranque" unit="bar" value={s.margin} onChange={set('margin')} hint="0,2–0,3 bar" />
        <div className="grid2">
          <NumField label="Caudal bomba" unit="L/min" value={s.flow} onChange={set('flow')} hint="opcional, para el volumen" />
          <NumField label="Arranques/hora" value={s.starts} onChange={set('starts')} hint="según fabricante (15–30)" />
        </div>
      </Card>
      {r && (
        <Card tone="result" title="Resultado">
          <Big label="Precarga de aire (calderín vacío de agua)" value={fmt(r.p0)} unit="bar" />
          {pOff > 0 && !r.ok && <p className="note">La presión de paro tiene que ser mayor que la de arranque.</p>}
          {sized && r.vn !== null && (
            <>
              <Row label="Agua útil entre paro y arranque" value={`${fmt(r.drawdown, 1)} L`} />
              <Row label="Aprovechamiento del calderín" value={`${fmt(r.factor * 100, 1)} %`} />
              <Row label="Volumen mínimo del calderín" value={`${fmt(r.vn, 0)} L`} />
              <Row label="Calderín comercial" value={r.size ? `${r.size} L` : 'más de 1000 L'} />
            </>
          )}
        </Card>
      )}
      <Info title="Cómo se calcula">
        <ul>
          <li>Precarga P₀ = presión de arranque − margen (0,2–0,3 bar)</li>
          <li>El peor caso de ciclos se da cuando el consumo es la mitad del caudal de la bomba: cada ciclo dura 4·ΔV/Q.</li>
          <li>Agua útil ΔV = Q / (4 · arranques por hora)</li>
          <li>Volumen = ΔV / [(P₀+1) · (1/(Parr+1) − 1/(Pparo+1))]</li>
        </ul>
        <p>La precarga se mide y se ajusta con la bomba parada y el calderín vacío de agua (grifo abierto hasta que no salga).</p>
      </Info>
    </>
  )
}

function WhyDifferent() {
  return (
    <Info title="¿Por qué cambia la precarga entre calefacción y grupo de presión?">
      <p>
        <strong>En un circuito cerrado</strong> el vaso no aporta agua: solo absorbe la dilatación al calentar. La columna de agua de la
        instalación ya empuja sobre la membrana; si el aire estuviera por debajo de esa presión estática, el vaso se llenaría de agua
        fría al llenar la instalación y no le quedaría hueco para la dilatación (la válvula de seguridad acabaría disparando). Por eso
        la precarga se calcula a partir de la <em>altura estática</em>: altura/10 + 0,2–0,3 bar.
      </p>
      <p>
        <strong>En un grupo de presión</strong> el calderín es un depósito de agua a presión: lo que importa es cuánta agua entrega
        entre la presión de paro y la de arranque, para que la bomba no arranque con cada grifo. La referencia es la{' '}
        <em>presión de arranque</em> del presostato o variador: precargando justo por debajo (−0,2/−0,3 bar) el calderín se vacía casi por
        completo antes de que arranque la bomba, se aprovecha el máximo volumen y la membrana no llega a pegarse contra la boca.
        Si la precarga es demasiado baja, el calderín apenas almacena agua útil y la bomba arranca y para continuamente. Si es más alta
        que la de arranque, el calderín se queda vacío antes de que la bomba arranque: hay un golpe de presión y no hace de colchón.
      </p>
      <p>
        <strong>Volumen:</strong> en calefacción se dimensiona por la dilatación térmica del agua (volumen y temperatura); en el grupo
        de presión por el caudal de la bomba y los arranques por hora que admite el motor.
      </p>
    </Info>
  )
}
