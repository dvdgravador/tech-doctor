import { useEffect, useState, type ReactNode } from 'react'

// Acepta coma o punto decimal (teclado español)
export function parseNum(s: string): number {
  if (s.trim() === '') return NaN
  return Number(s.replace(',', '.'))
}

export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('es-ES', { maximumFractionDigits: digits, minimumFractionDigits: 0, useGrouping: false })
}

// Estado que se recuerda entre aperturas de la app (solo comodidad)
export function useStored<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : { ...initial, ...JSON.parse(raw) }
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }, [key, v])
  return [v, setV]
}

export function NumField(props: {
  label: string
  unit?: string
  value: string
  onChange: (v: string) => void
  hint?: string
  invalid?: boolean
}) {
  return (
    <label className={`field${props.invalid ? ' invalid' : ''}`}>
      <span className="field-label">{props.label}</span>
      <span className="field-box">
        <input
          inputMode="decimal"
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
          onFocus={e => e.target.select()}
        />
        {props.unit && <span className="field-unit">{props.unit}</span>}
      </span>
      {props.hint && <span className="field-hint">{props.hint}</span>}
    </label>
  )
}

export function Segmented<T extends string | number>(props: {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="field">
      {props.label && <span className="field-label">{props.label}</span>}
      <div className="seg" role="radiogroup">
        {props.options.map(o => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === props.value}
            className={o.value === props.value ? 'on' : ''}
            onClick={() => props.onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Card(props: { title?: string; children: ReactNode; tone?: 'result' | 'warn' }) {
  return (
    <section className={`card${props.tone ? ' ' + props.tone : ''}`}>
      {props.title && <h2>{props.title}</h2>}
      {props.children}
    </section>
  )
}

export function Big(props: { label: string; value: string; unit?: string }) {
  return (
    <div className="big">
      <span className="big-label">{props.label}</span>
      <span className="big-value">
        {props.value}
        {props.unit && <small> {props.unit}</small>}
      </span>
    </div>
  )
}

export function Row(props: { label: string; value: string }) {
  return (
    <div className="row">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  )
}

export function Info(props: { title: string; children: ReactNode }) {
  return (
    <details className="info">
      <summary>{props.title}</summary>
      <div className="info-body">{props.children}</div>
    </details>
  )
}
