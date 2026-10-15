import { useEffect, useRef } from 'react'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Hardness from './tools/Hardness'
import Alkalinity from './tools/Alkalinity'
import Cable from './tools/Cable'
import Expansion from './tools/Expansion'
import { useStored } from './ui'
import logo from './assets/logo.webp'

type Tab = 'hardness' | 'alkalinity' | 'cable' | 'expansion'

const TABS: { id: Tab; label: string; title: string; icon: string }[] = [
  { id: 'hardness', label: 'Dureza', title: 'Dureza del agua', icon: 'M12 2.7c-3.3 4.2-6 7.6-6 11.1a6 6 0 0 0 12 0c0-3.5-2.7-6.9-6-11.1z' },
  { id: 'alkalinity', label: 'Piscina', title: 'Alcalinidad de piscina', icon: 'M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 13c2 0 2-1.5 4-1.5S8 13 10 13s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 9V4a2 2 0 0 1 4 0M16 9V4a2 2 0 0 0-4 0' },
  { id: 'cable', label: 'Cable', title: 'Sección de cable', icon: 'M13 2 4 14h7l-1 8 9-12h-7z' },
  { id: 'expansion', label: 'Vasos', title: 'Vasos de expansión', icon: 'M7 3h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM4 12h16M12 3v3' },
]

export default function App() {
  const [state, setState] = useStored<{ tab: Tab }>('tab', { tab: 'hardness' })
  const tab = state.tab
  const mainRef = useRef<HTMLElement>(null)

  // Botón atrás de Android: vuelve a la primera pestaña y, desde ahí, sale
  const tabRef = useRef(tab)
  tabRef.current = tab
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const h = CapApp.addListener('backButton', () => {
      if (tabRef.current !== 'hardness') setState({ tab: 'hardness' })
      else CapApp.exitApp()
    })
    return () => {
      h.then(l => l.remove())
    }
  }, [setState])

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [tab])

  return (
    <div className="app">
      <header className="top">
        <img className="logo" src={logo} alt="" />
        <div className="brand">
          <h1>Tech Doctor</h1>
          <span>{TABS.find(t => t.id === tab)!.title}</span>
        </div>
      </header>
      <main ref={mainRef}>
        {tab === 'hardness' && <Hardness />}
        {tab === 'alkalinity' && <Alkalinity />}
        {tab === 'cable' && <Cable />}
        {tab === 'expansion' && <Expansion />}
        <p className="disclaimer">Resultados orientativos. Comprueba siempre con la normativa vigente y las instrucciones del fabricante.</p>
      </main>
      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={t.id === tab ? 'on' : ''} onClick={() => setState({ tab: t.id })}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
