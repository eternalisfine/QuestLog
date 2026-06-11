import { useState, useEffect } from 'react'
import { api } from '../../api.js'

export default function QuestBoard({ onLogout }) {
    const [quests, setQuests] = useState([])
    const [title, setTitle] = useState('')
    const [duration, setDuration] = useState(45)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getQuests()
            .then(setQuests)
            .catch(e => { if (e.message==='SESSION_EXPIRED') onLogout() })
            .finally(() => setLoading(false))
    }, [onLogout])

    const addQuest = async () => {
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
            setQuests(prev => prev.map(q => q.id===id ? updated : q))
        } catch (e) { setError(e.message) }
    }

    const pending = quests.filter(q => !q.completed)
    const done = quests.filter(q => q.completed)

    if (loading) return <p style={{ color:'var(--clr-text-muted)' }}>Loading quests...</p>

    return (
        <div>
            <h2 style={{ fontFamily:'var(--font-display)', margin:'0 0 1.5rem' }}>Quest Log</h2>

            {/* NEW QUEST */}
            <div className="card" style={{ marginBottom:'1rem' }}>
                <input
                    className="input-field"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Quest title..." style={{ marginBottom:'0.5rem' }}
                />
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <input
                        type="number"
                        className="duration-input"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                    />
                    <span style={{ color:'var(--clr-text-muted)' }}>min</span>
                    <button className="btn-primary push-right" onClick={addQuest}>+ Add Quest</button>
                </div>
                {error && <p style={{ color:'#ff4444', fontSize:'0.85rem', margin:'0.5rem 0 0' }}>{error}</p>}
            </div>

            {/* PENDING QUEST */}
            {pending.map(q => (
                <div key={q.id} className="card flex-row quest-row" style={{ marginBottom:'0.5rem' }}>
                    <div>
                        <div>{q.title}</div>
                        <div className="quest-meta">{q.duration_minutes} min</div>
                    </div>
                    <button className="btn-primary" onClick={() => completeQuest(q.id)}>Complete</button>
                </div>
            ))}

            {/* COMPLETED QUEST */}
            {done.length > 0 && (
                <>
                    <p className="completed-section">Completed - {done.length} quest {done.length>1?'s':''}</p>
                    {done.map(q => (
                        <div key={q.id} className="card quest-done">
                            <span>{q.title}</span>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}