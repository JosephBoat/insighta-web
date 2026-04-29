const BASE = 'https://hng-stage1-profiles.fly.dev';
const API_HEADERS = { 'X-API-Version': '1' };

async function apiFetch(path, options = {}) {
    const token = await getValidToken();
    if (!token) {
        window.location.href = '/insighta-web/index.html';
        return null;
    }

    const headers = {
        ...API_HEADERS,
        'Content-Type': 'application/json',
        ...csrfHeaders(),
        ...(options.headers || {}),
    };
    if (token !== 'cookie') {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers,
    });
    if (response.status === 401) {
        window.location.href = '/insighta-web/index.html';
        return null;
    }
    return response;
}

async function getProfiles(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiFetch(`/api/profiles?${query}`);
    return response ? response.json() : null;
}

async function getProfile(id) {
    const response = await apiFetch(`/api/profiles/${id}`);
    return response ? response.json() : null;
}

async function searchProfiles(q, params = {}) {
    const query = new URLSearchParams({ q, ...params }).toString();
    const response = await apiFetch(`/api/profiles/search?${query}`);
    return response ? response.json() : null;
}

async function getWhoami() {
    const token = await getValidToken();
    if (!token) return null;
    const headers = token === 'cookie' ? {} : { 'Authorization': `Bearer ${token}` };
    const response = await fetch(`${BASE}/auth/whoami`, {
        credentials: 'include',
        headers,
    });
    return response.ok ? response.json() : null;
}
