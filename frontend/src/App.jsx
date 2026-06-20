import { useState, useEffect, useCallback } from 'react'
import SceneBackground from './components/scene/SceneBackground'
import FloatingHourglass from './components/scene/FloatingHourglass'
import LiquidLogoTitle from './components/ui/LiquidLogoTitle'
import GlassButton        from './components/ui/GlassButton'
import GlassContainer     from './components/ui/GlassContainer'
import GlassPanel         from './components/ui/GlassPanel'
import AuthPanel          from './components/auth/AuthPanel'
import QuestBoard         from './components/quests/QuestBoard'
import BudgetPanel        from './components/budget/BudgetPanel'
import SessionTimer       from './components/timer/SessionTimer'
import './App.css'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('ql_token'))

  const handleLogin = () => {
    setToken(localStorage.getItem('ql_token'))
  }

  const handleLogout = () => {
    localStorage.removeItem('ql_token')
    setToken(null)
  }

  return (
    <>
      <SceneBackground />
      <FloatingHourglass />

      <div className="app-shell">
        <header className="app-header">
          <LiquidLogoTitle />
          {token && <GlassButton label="Sign Out" type="pill" size={14} onClick={handleLogout} />}
        </header>

        <main className="app-main">
          {!token ? (
            <GlassContainer borderRadius={28} tintOpacity={0.22} style={{ maxWidth:420, margin:'0 auto', width:'100%' }}>
              <AuthPanel onLogin={handleLogin} />
            </GlassContainer>
          ) : (
            <div className="dashboard-grid">
              <GlassPanel className="glass-panel--accent quest-board-panel">
                <QuestBoard onLogout={handleLogout} />
              </GlassPanel>
              <GlassPanel className="timer-panel">
                <SessionTimer onLogout={handleLogout} />
              </GlassPanel>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
