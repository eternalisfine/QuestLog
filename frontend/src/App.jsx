import { useState } from 'react'
import { api } from './api'


// AUTH FORM

function AuthForm({ mode, onSuccess, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    try{
      if (mode === 'register') {
        await api.register(email, password)
        onSuccess()
      } else {
        await api.register(email, password)
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
          value="email"
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

  useEffect(() => {
    api.getQuests().then(setQuests).catch(() => { api.logout(); onLogout() })
  }, [])

  const addQuest = async() => {
    if (!title.trim()) return
    try {
      const quest = await api.createQuest(title, Number(duration))
      setQuests(prev => [...prev, quest])
      setTitle('')
    } catch (e) { setError(e.message) }
  }

  const completeQuest = async (id) => {
    const updated = await api.completeQuest(id)
    setQuests(prev => prev.map(q => q.id === id ? updated : q))
  }

  const pending = quests.filter(q => !q.completed)
  const done = quests.filter(q => q.completed)

  return (
    <div className="container">
      <div className="flex-row" style={{ marginBottom: '1.5rem' }}>
        <h1 className="title" style={{ margin: 0 }}>QuestLog</h1>
        <button onClick={onLogout} className="push-right" style={{ opacity: 0.4, fontSize: '0.75rem' }}>Logout</button>
      </div>

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