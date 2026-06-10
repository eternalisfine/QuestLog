const BASE = import.meta.env.VITE_API_URL || ''

const getToken = () => localStorage.getItem('ql_token')

async function request(path, options = {}) {
    const token = getToken()
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    if (res.status === 401) {
        localStorage.removeItem('ql_token')
        throw new Error('SESSION_EXPIRED')
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail)
    }
    return res.json()
}

export const api = {
    register: (email, password) =>
        request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

    login: async (email, password) => {
        // need form-encoded not JSON
        const res = await fetch(`${BASE}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username: email, password }),
        })
        if (!res.ok) throw new Error('Incorrect email or password')
        const data = await res.json()
        localStorage.setItem('ql_token', data.access_token)
    },

    logout: () => localStorage.removeItem('ql_token'),

    isLoggedIn: () => !!getToken(),

    getQuests:      ()              => request(`/quests/`),
    createQuest:   (title,mins)    => request(`/quests/`, { method: 'POST', body: JSON.stringify({ title, duration_minutes: mins }) }),
    completeQuest:  (id)            => request(`/quests/${id}/complete`, { method: 'PATCH' }),

    getBudget:      ()  => request(`/budget/today`),
    startSession:   ()  => request(`/sessions/start`, { method: 'POST' }),
    endSession:     ()  => request(`/sessions/end`, { method: 'POST' }),
}