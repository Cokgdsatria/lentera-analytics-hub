const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAuthToken() {
    return localStorage.getItem('adminToken');
}

async function request(path, options = {}) {
    const { auth = false, body, headers = {}, ...rest } = options;
    const requestHeaders = { ...headers };

    if (!(body instanceof FormData) && body !== undefined) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = getAuthToken();
        if (token) {
            requestHeaders.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
        headers: requestHeaders,
    });

    if (!response.ok) {
        let message = 'Request failed';
        try {
            const payload = await response.json();
            message = Array.isArray(payload.detail)
                ? payload.detail.map((item) => item.msg).join(', ')
                : payload.detail || message;
        } catch {
            message = response.statusText || message;
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

function toQueryString(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, value);
        }
    });
    const value = query.toString();
    return value ? `?${value}` : '';
}

export const authApi = {
    login: (email, password) => request('/auth/login', {
        method: 'POST',
        body: { email, password },
    }),
};

export const complaintApi = {
    create: (formData) => request('/complaints', {
        method: 'POST',
        body: formData,
    }),
    list: ({ search, urgency, status, skip = 0, limit = 10 } = {}) => request(
        `/complaints${toQueryString({ search, urgency, status, skip, limit })}`,
        { auth: true },
    ),
    get: (id) => request(`/complaints/${id}`, { auth: true }),
    update: (id, payload) => request(`/complaints/${id}`, {
        method: 'PATCH',
        auth: true,
        body: payload,
    }),
    exportCsv: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/complaints/export.csv`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(response.statusText || 'Export failed');
        }

        return response.blob();
    },
};

export const analyticsApi = {
    summary: () => request('/analytics/summary', { auth: true }),
};

export const inferenceApi = {
    predict: (payload) => request('/inference/predict', {
        method: 'POST',
        body: payload,
    }),
};
