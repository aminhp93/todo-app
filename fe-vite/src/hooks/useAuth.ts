import { useCallback, useEffect, useState } from 'react';
import { ApiError, login as apiLogin, logout as apiLogout, refreshAccessToken, registerAccount } from '../lib/api';
import { AuthUser, BackendOption } from '../types';

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function storageKey(backendId: string): string {
  return `todoapp:auth:${backendId}`;
}

// Level 2 trade-off, intentional: tokens live in localStorage so a page
// refresh doesn't force re-login. Any script on the page can read
// localStorage (XSS risk) — Level 3 goal is moving the refresh token to an
// httpOnly cookie and keeping only the access token in memory.
function loadStoredAuth(backendId: string): StoredAuth | null {
  try {
    const raw = localStorage.getItem(storageKey(backendId));
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function useAuth(backend: BackendOption) {
  const [auth, setAuth] = useState<StoredAuth | null>(() =>
    backend.requiresAuth ? loadStoredAuth(backend.id) : null,
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switching backend (vd: node-express -> nestjs -> node-express) should
  // re-read whatever session that backend had, not keep the previous one.
  useEffect(() => {
    setAuth(backend.requiresAuth ? loadStoredAuth(backend.id) : null);
    setAuthError(null);
  }, [backend.id, backend.requiresAuth]);

  const persist = useCallback(
    (next: StoredAuth | null) => {
      setAuth(next);
      if (next) {
        localStorage.setItem(storageKey(backend.id), JSON.stringify(next));
      } else {
        localStorage.removeItem(storageKey(backend.id));
      }
    },
    [backend.id],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      setAuthError(null);
      try {
        const result = await apiLogin(backend, email, password);
        persist({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
      } catch (err) {
        setAuthError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [backend, persist],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsSubmitting(true);
      setAuthError(null);
      try {
        await registerAccount(backend, email, password, name);
        const result = await apiLogin(backend, email, password);
        persist({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
      } catch (err) {
        setAuthError(err instanceof ApiError ? err.message : 'Đăng ký thất bại');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [backend, persist],
  );

  const logout = useCallback(async () => {
    if (auth?.refreshToken) {
      await apiLogout(backend, auth.refreshToken).catch(() => undefined);
    }
    persist(null);
  }, [auth, backend, persist]);

  // Used by useTodos when a request comes back 401: try to mint a new
  // access token from the refresh token. Returns null (and clears the
  // session) if the refresh token is gone/expired/revoked.
  const refresh = useCallback(async (): Promise<string | null> => {
    if (!auth?.refreshToken) return null;
    try {
      const tokens = await refreshAccessToken(backend, auth.refreshToken);
      persist({ user: auth.user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      return tokens.accessToken;
    } catch {
      persist(null);
      return null;
    }
  }, [auth, backend, persist]);

  return {
    user: auth?.user ?? null,
    accessToken: auth?.accessToken ?? null,
    isAuthenticated: auth != null,
    authError,
    isSubmitting,
    login,
    register,
    logout,
    refresh,
  };
}
