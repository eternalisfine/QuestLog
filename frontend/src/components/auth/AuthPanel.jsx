import { useState } from 'react'
import { api } from '../../api.js'

export default function AuthPanel({ onLogin }) {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const submit = async () => {
        setError('')
        try {
            if (mode === 'register') {
                await api.register(email, password)
                setMode('login')
                setError('Registration successful. Please login.')
            } else {
                await api.login(email, password)
                onLogin()
            }
        } catch (e) {
            setError(e.message)
        }
    }

    return (
        <div>
            <h2 style={{ fontFamily:'var(--font-display)', margin:'0 0 1.5rem' }}>
                {mode === 'login' ? 'Login' : 'Register'}
            </h2>
            <input
                className="input-field"
                type="email" placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)}
            />
            <input
                className="input-field"
                type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key==='Enter' && submit()}
            />
            {error && <p style={{ color:'#ff4444', fontSize:'0.85rem' }}>{error}</p>}
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
                <button className="btn-primary" onClick={submit}>
                    {mode === 'login' ? 'Login' : 'Create Account'}
                </button>
                <button
                    style={{
                        background:'transparent',
                        border:'none',
                        color:'rgba(255,255,255,0.6)',
                        cursor:'pointer',
                        marginLeft:'auto'
                    }}
                    onClick={() => setMode(m => m==='login'?'register':'login')}
                >
                    {mode === 'login' ? 'No account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    )
}