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

async function refreshAccessToken() {
    const refresh = getStoredRefresh();
    if (!refresh) return false;
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!response.ok) return false;
        const data = await response.json();
        saveTokens(data.access_token, data.refresh_token);
        return true;
    } catch {
        return false;
    }
}

async function getValidToken() {
    const token = getStoredToken();
    if (!token) return null;

    // Try to use it directly — if it fails, refresh
    try {
        const response = await fetch(`${API_URL}/auth/whoami`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return token;
    } catch {}

    // Try refresh
    const refreshed = await refreshAccessToken();
    return refreshed ? getStoredToken() : null;
}

async function requireAuth() {
    // If no tokens at all, go to login immediately
    if (!getStoredToken() && !getStoredRefresh()) {
        window.location.href = '/insighta-web/index.html';
        return null;
    }

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
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
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