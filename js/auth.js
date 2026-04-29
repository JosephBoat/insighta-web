const API_URL = 'https://hng-stage1-profiles.fly.dev';

function saveTokens(access, refresh) {
    sessionStorage.setItem('access_token', access);
    sessionStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
}

function getStoredToken() {
    return sessionStorage.getItem('access_token');
}

function getStoredRefresh() {
    return sessionStorage.getItem('refresh_token');
}

function getCookie(name) {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1] || null;
}

function csrfHeaders() {
    const csrf = getCookie('csrf_token');
    return csrf ? { 'X-CSRF-Token': csrf } : {};
}

async function refreshAccessToken() {
    const refresh = getStoredRefresh();
    try {
        const options = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        };
        if (refresh) {
            options.body = JSON.stringify({ refresh_token: refresh });
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
            ...options,
        });
        if (!response.ok) return false;
        const data = await response.json();
        if (refresh && data.access_token && data.refresh_token) {
            saveTokens(data.access_token, data.refresh_token);
        }
        return true;
    } catch {
        return false;
    }
}

async function getValidToken() {
    const token = getStoredToken();
    // Try to use it directly — if it fails, refresh
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/whoami`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) return token;
        } catch {}
    }

    try {
        const response = await fetch(`${API_URL}/auth/whoami`, {
            credentials: 'include',
        });
        if (response.ok) return 'cookie';
    } catch {}

    // Try refresh
    if (!getStoredRefresh() && !getCookie('csrf_token')) return null;
    const refreshed = await refreshAccessToken();
    return refreshed ? (getStoredToken() || 'cookie') : null;
}

async function requireAuth() {
    const token = await getValidToken();
    if (!token) {
        clearTokens();
        window.location.href = '/insighta-web/index.html';
        return null;
    }
    return token;
}

async function logout() {
    const refresh = getStoredRefresh();
    try {
        const options = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        };
        if (refresh) {
            options.body = JSON.stringify({ refresh_token: refresh });
        }
        await fetch(`${API_URL}/auth/logout`, {
            ...options,
        });
    } catch {}
    clearTokens();
    window.location.href = '/insighta-web/index.html';
}

function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access_token');
    const refresh = params.get('refresh_token');
    if (access && refresh) {
        saveTokens(access, refresh);
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = '/insighta-web/dashboard.html';
    }
}
