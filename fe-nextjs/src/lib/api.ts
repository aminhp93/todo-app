import { AuthUser, BackendOption, Todo } from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function authHeaders(accessToken: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// node-express wraps the list in { data, pagination }; be-nestjs/be-fastapi
// still return a raw array (they weren't touched in this pass).
export async function fetchTodos(backend: BackendOption, accessToken: string | null): Promise<Todo[]> {
  const json = await request<Todo[] | { data: Todo[] }>(`${backend.url}/api/todos`, {
    headers: authHeaders(accessToken),
  });
  return Array.isArray(json) ? json : json.data;
}

export async function createTodo(backend: BackendOption, accessToken: string | null, title: string): Promise<Todo> {
  return request<Todo>(`${backend.url}/api/todos`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ title }),
  });
}

export async function updateTodoCompleted(
  backend: BackendOption,
  accessToken: string | null,
  id: number,
  completed: boolean,
): Promise<Todo> {
  return request<Todo>(`${backend.url}/api/todos/${id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ completed }),
  });
}

export async function deleteTodoById(backend: BackendOption, accessToken: string | null, id: number): Promise<void> {
  await request<unknown>(`${backend.url}/api/todos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function registerAccount(
  backend: BackendOption,
  email: string,
  password: string,
  name: string,
): Promise<AuthUser> {
  return request<AuthUser>(`${backend.url}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(
  backend: BackendOption,
  email: string,
  password: string,
): Promise<{ user: AuthUser } & AuthTokens> {
  return request(`${backend.url}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshAccessToken(backend: BackendOption, refreshToken: string): Promise<AuthTokens> {
  return request(`${backend.url}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(backend: BackendOption, refreshToken: string): Promise<void> {
  await request<unknown>(`${backend.url}/api/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
