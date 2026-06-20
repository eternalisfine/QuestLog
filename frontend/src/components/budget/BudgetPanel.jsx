import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api.js'
import GlassPanel from '../ui/GlassPanel'

export default function BudgetPanel({ onLogout }) {
    const [budget, setBudget] = useState(null)
    const [elapsed, setElapsed] = useState(0)
    const [error, setError] = useState('')

    const fetchBudget = useCallback(async () => {
        try {
            const data = await api.getBudget()
            setBudget(data)
        } catch (e) {
            if (e.message === 'SESSION_EXPIRED') onLogout()
        }
    }, [onLogout])

    useEffect(() => { fetchBudget() }, [fetchBudget])

    useEffect(() => {
        if (!budget?.active_session_started_at) { setElapsed(0); return }
        const started = new Date(budget.active_session_started_at)
        const tick = () => setElapsed(Math.floor((Date.now() - started.getTime()) / 1000))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [budget?.active_session_started_at])

    const handleStart = async () => {
        setError('')
        try {
            await api.startSession()
            await fetBudget()
        } catch (e) { setError(e.message) }
    }

    const handleEnd = async () => {
        setError('')
        try {
            await api.endSession()
            await fetchBudget()
        } catch (e) { setError(e.message) }
    }

    const fmt = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0')
        const s = (secs % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    if (!budget) return <GlassPanel><p className="budget-panel-title">Loading Budget...</p></GlassPanel>

    const fillPct = budget.earned_minutes > 0
    ? Math.max(0, (budget.remaining_minutes / budget.earned_minutes) * 100)
    : 0

    return (
        <GlassPanel>
            <p className="budget-panel-title">Gaming Budget</p>
            <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{ width: `{fillPct}%` }} />
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
                        disable={!budget.can_play}
                        style={{ opacity: budget.can_play ? 1 : 0.3, cursor: budget.can_play ? 'pointer' : 'not-allowed' }}
                    >
                        {budget.can_play ? '  START GAMING  ' : '  COMPLETE QUESTS FIRST  '}
                    </button>
                </div>
            )}
        </GlassPanel>
    )
}