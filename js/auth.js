const API_URL = 'https://hng-stage1-profiles.fly.dev';

// Store tokens in memory (not localStorage — security)
// HTTP-only cookies are set by the backend
let accessToken = sessionStorage.getItem('access_token');
let refreshToken = sessionStorage.getItem('refresh_token');

function saveTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    sessionStorage.setItem('access_token', access);
    sessionStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
    if (!refreshToken) return false;
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
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
    if (!accessToken) return null;

    // Test if current token works
    const response = await fetch(`${API_URL}/auth/whoami`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) return accessToken;

    // Try refresh
    const refreshed = await refreshAccessToken();
    return refreshed ? accessToken : null;
}

async function requireAuth() {
    const token = await getValidToken();
    if (!token) {
        window.location.href = '/insighta-web/index.html';
        return null;
    }
    return token;
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
    } catch {}
    clearTokens();
    window.location.href = '/insighta-web/index.html';
}

// Handle OAuth callback — extract tokens from URL
function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access_token');
    const refresh = params.get('refresh_token');
    if (access && refresh) {
        saveTokens(access, refresh);
        // Clean URL then redirect to dashboard
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = 'dashboard.html';
    }
}