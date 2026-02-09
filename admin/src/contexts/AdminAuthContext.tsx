import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

interface AdminAuthContextType {
  token: string | null;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'bsg-admin-token';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    try {
      if (!API_BASE?.trim()) {
        setIsLoading(false);
        return;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await res.text();
      if (res.ok && text.trim()) {
        try {
          const data = JSON.parse(text) as { email?: string };
          setEmail(data.email ?? null);
        } catch {
          setToken(null);
          setEmail(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setToken(null);
        setEmail(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      setToken(null);
      setEmail(null);
      localStorage.removeItem(STORAGE_KEY);
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Auth check timed out – is the API server running?');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setEmail(null);
      setIsLoading(false);
      return;
    }
    fetchMe(token);
  }, [token, fetchMe]);

  const login = useCallback(async (emailInput: string, password: string) => {
    if (!API_BASE?.trim()) {
      throw new Error('API URL not configured. Set VITE_API_BASE_URL in admin/.env (e.g. http://localhost:3001)');
    }
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password }),
    });
    const text = await res.text();
    let data: { token?: string; email?: string; error?: string } = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid response. Is the API running at ' + API_BASE + '?');
      }
    }
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (!data.token) throw new Error('Server did not return a token. Check API and run server db:seed.');
    setToken(data.token);
    setEmail(data.email ?? emailInput);
    localStorage.setItem(STORAGE_KEY, data.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        email,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (ctx === undefined) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
