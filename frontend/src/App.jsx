import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1 className="title">QuestLog</h1>

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
          <span style={{ color: 'var(--text-muted)'}}>min</span>
          <button onClick={addQuest} className="push-right">+ Add Quest</button>
        </div>
      </div>

      {pending.map(quest => (
        <div key={quest.id} className="card flex-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div>{quest.title}</div>
            <div className="quest-meta">{quest.duration_minutes} min</div>
          </div>
          <button onClick={() => completeQuest(quest.id)}>Complete</button>
          </div>
      ))}

      {done.length > 0 && (
        <>
          <p className="completed-section">
            Completed - {done.length} quest{done.length > 1 ? 's' : ''}
          </p>
          {done.map(quest => (
            <div key={quest.id} className="card quest-done">
              <span>{quest.title}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default App