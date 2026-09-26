const TOKEN_KEY = 'token';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(auth) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem('user', JSON.stringify({
        id: auth.id,
        login: auth.login,
        role: auth.role,
        displayName: auth.displayName || null,
    }))
}

export function getStoredUser() {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
}

export function patchStoredUser(partial) {
    const current = getStoredUser() || {}
    localStorage.setItem('user', JSON.stringify({ ...current, ...partial }))
}
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
}

export async function api(path, { method = 'GET', body, auth = true }= {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (auth) {
        const token = getToken()
        if (token) headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`)
    }
    return data
}