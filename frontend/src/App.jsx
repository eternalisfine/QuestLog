import { useState, useEffect, useCallback } from 'react'
import { api } from './api'
import './App.css'


// Budget Panel
function BudgetPanel({ onBudgetChange, onLogout }) {
  const [budget,setBudget] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')

  const fetchBudget = useCallback(async () => {
    try {
      const data = await api.getBudget()
      setBudget(data)
    } catch (e) {
      if (e.message === 'SESSION_EXPIRED') onLogout?.()
    }
  }, [onLogout])

  useEffect(() => { fetchBudget() }, [fetchBudget])

  // Timer
  useEffect(() => {
    if (!budget?.active_session_started_at) { setElapsed(0); return }
    const started = new Date(budget.active_session_started_at)
    const tick = () => setElapsed(Math.floor((Date.now() - started.getTime())/ 1000))
    tick()
    const id = setInterval(tick, 1000)
    return() => clearInterval(id)
  }, [budget?.active_session_started_at])

  const handleStart = async () => {
    setError('')
    try {
      await api.startSession()
      await fetchBudget()
      onBudgetChange?.()
    } catch (e) { setError(e.message) }
  }

  const handleEnd = async () => {
    setError('')
    try {
      await api.endSession()
      await fetchBudget()
      onBudgetChange?.()
    } catch (e) { setError(e.message) }
  }

  const fmt = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:{s}`
  }

  if (!budget) return <div className="card"><p className="budget-panel-title">Loading budget...</p></div>

  const fillPct = budget.earned_minutes > 0
    ? Math.max(0, (budget.remaining_minutes / budget.earned_minutes)) * 100
    : 0

  return (
    <div className="card">
      <p className="budget-panel-title">Gaming Budget</p>
      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${fillPct}%` }} />  
      </div>
      <p className="budget-numbers" style={{ margin: '0 0 0.75rem' }}>
        <span>{budget.remaining_minutes}min</span> remaining of <span>{budget.earned_minutes}min</span> earned
      </p>

      {budget.active_session_id ? (
        <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="timer-display">{fmt(elapsed)}</div>
            <div className="timer-label">Session running</div>
          </div>
          <button onClick={handleEnd}>End Session</button>
        </div>
      ) : (
        <div className="flex-row quest-row">
          {error && <span style={{ color: '#ff4444', fontSize: '0.8rem' }}>{error}</span>}
          <button
            onClick={handleStart}
            disabled={!budget.can_play}
            style={{ opacity: budget.can_play ? 1 : 0.3, cursor: budget.can_play ? 'pointer' : 'not-allowed' }}
          >
            {budget.can_play ? '  START GAMING  ' : '  COMPLETE QUESTS FIRST  '}
          </button>
        </div>
      )}
    </div>
  )
}


// AUTH FORM

function AuthForm({ mode, onSuccess, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    
    if(mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try{
      if (mode === 'register') {
        await api.register(email, password)
        onSuccess()
      } else {
        await api.login(email, password)
        onSuccess()
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="container">
      <h1 className="title">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <div className="card">
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {error && <p style={{ color: '#ff4444', fontSize: '0.85rem', margin:'0 0 0.5rem' }}>{error}</p>}
        <div className="flex-row">
          <button onClick={submit}>{mode === 'login' ? 'Login' : 'Create Account'}</button>
          <button onClick={onSwitch} className="push-right" style={{ opacity: 0.5, fontSize: '0.8rem', border: 'none' }}>
            {mode === 'login' ? 'No account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}


// MAIN APP


function QuestBoard({ onLogout }) {
  const [quests, setQuests] = useState([])
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(45)
  const [error, setError] = useState('')
  
  const [budgetKey, setBudgetKey] = useState(0)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getQuests()
      .then(setQuests)
      .catch(e => { if (e.message === 'SESSION_EXPIRED') onLogout() })
      .finally(() => setLoading(false))
  }, [])

  const addQuest = async() => {
    if (!title.trim()) return
    setError('')
    try {
      const quest = await api.createQuest(title, Number(duration))
      setQuests(prev => [...prev, quest])
      setTitle('')
    } catch (e) { setError(e.message) }
  }

  const completeQuest = async (id) => {
    try {
      const updated = await api.completeQuest(id)
      setQuests(prev => prev.map(q => q.id === id ? updated : q))
      setBudgetKey(k => k + 1)
    } catch (e) { setError(e.message) }
  }

  const pending = quests.filter(q => !q.completed)
  const done = quests.filter(q => q.completed)

  if (loading) return <div className="container"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>

  return (
    <div className="container">
      <div className="flex-row" style={{ marginBottom: '1.5rem' }}>
        <h1 className="title" style={{ margin: 0 }}>QuestLog</h1>
        <button onClick={onLogout} className="push-right" style={{ opacity: 0.4, fontSize: '0.75rem' }}>Logout</button>
      </div>

      <BudgetPanel key={budgetKey} onBudgetChange={() => setBudgetKey(k => k + 1)} onLogout={onLogout} />
      
      <div className="card">
        <input
          className="input-field"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addQuest()}
          placeholder="Quest title..."
        />
        <div className="flex-row">
          <input
            type="number"
            className="duration-input"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)' }}>min</span>
          <button onClick={addQuest} className="push-right">+ Add Quest</button>
        </div>
        {error && <p style={{ color: '#ff4444', fontSize: '0.85rem', margin:'0.5rem 0 0'}}>{error}</p>}
      </div>

      {pending.map(quest => (
        <div key={quest.id} className="card flex-row quest-row">
          <div>
            <div>{quest.title}</div>
            <div className="quest-meta">{quest.duration_minutes} min</div>
          </div>
          <button onClick={() => completeQuest(quest.id)}>Complete</button>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <p className="completed-section">Completed - {done.length} quest{done.length > 1 ? 's' : ''}</p>
          {done.map(quest => (
            <div key={quest.id} className="card quest-done"><span>{quest.title}</span></div>
          ))}
        </>
      )}
    </div>
  )
}


// ROOT ( controls which screen shows up )


export default function App() {
  const [view,setView] = useState(api.isLoggedIn() ? 'app' : 'login')

  if (view === 'app')       return <QuestBoard onLogout={() => {api.logout(); setView('login') }} />
  if (view === 'register')  return <AuthForm mode="register" onSuccess={() => setView('login')} onSwitch={() => setView('login')} />
  return <AuthForm mode="login" onSuccess={() => setView('app')} onSwitch={() => setView('register')} />
}