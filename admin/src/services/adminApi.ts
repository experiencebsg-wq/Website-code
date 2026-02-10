const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function getToken(): string | null {
  return localStorage.getItem('bsg-admin-token');
}

async function request<T>(
  path: string,
  options: RequestInit & { method?: string } = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: { error?: string } = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      if (!res.ok) throw new Error(res.statusText || 'Request failed');
      throw new Error('Server returned invalid JSON. Is the API running at ' + API_BASE + '?');
    }
  }
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

export const adminApi = {
  products: {
    list: () => request<unknown[]>('/admin/products'),
    create: (body: unknown) =>
      request<unknown>('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: unknown) =>
      request<unknown>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/admin/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: (status?: string) =>
      request<unknown[]>(status ? `/admin/orders?status=${encodeURIComponent(status)}` : '/admin/orders'),
    get: (id: string) => request<unknown>(`/admin/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      request<unknown>(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  contacts: {
    list: () => request<unknown[]>('/admin/contacts'),
    markRead: (id: string) =>
      request<unknown>(`/admin/contacts/${id}/read`, { method: 'PATCH' }),
  },
  newsletter: {
    list: () => request<unknown[]>('/admin/newsletter'),
  },
  upload: async (file: File): Promise<{ url: string }> => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const text = await res.text();
    let data: { url?: string; error?: string } = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text) as { url?: string; error?: string };
      } catch {
        throw new Error('Upload failed');
      }
    }
    if (!res.ok) throw new Error(data.error || res.statusText || 'Upload failed');
    if (!data.url) throw new Error('No URL returned');
    return { url: data.url };
  },
};
