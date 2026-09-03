/**
 * Minimal fetch wrapper for the Urban Engage API.
 *
 * Base URL resolution order:
 *   1. REACT_APP_API_URL (build-time env var — set this on Netlify/Render)
 *   2. http://localhost:5050 when running locally
 *   3. '' (same-origin) with a console warning
 */

function resolveBaseUrl() {
    const fromEnv = process.env.REACT_APP_API_URL;
    if (fromEnv) return fromEnv.replace(/\/+$/, '');

    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5050';
    }

    // eslint-disable-next-line no-console
    console.warn(
        '[UrbanEngage] REACT_APP_API_URL is not set — API calls will use the current origin. ' +
        'Configure it in your hosting provider (Netlify → Site settings → Environment variables).'
    );
    return '';
}

export const API_BASE_URL = resolveBaseUrl();

const STORAGE_KEY = 'ue_auth';

export function getStoredAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function storeAuth(auth) {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
}

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    if (auth) {
        const stored = getStoredAuth();
        if (stored?.token) headers.Authorization = `Bearer ${stored.token}`;
    }

    let res;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
    }

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        const message =
            (data && typeof data === 'object' && data.message) ||
            (typeof data === 'string' && data) ||
            `Request failed (${res.status})`;
        throw new ApiError(res.status, message);
    }

    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    del: (path) => request(path, { method: 'DELETE' }),
};
