'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, createTodo, deleteTodoById, fetchTodos, updateTodoCompleted } from '../lib/api';
import { BackendOption, StatusMessage, Todo } from '../types';

interface UseTodosArgs {
  backend: BackendOption;
  accessToken: string | null;
  /** true once it's safe to call /api/todos: backend has no auth, or the user is logged in. */
  isAuthReady: boolean;
  /** try to mint a fresh access token; returns null if the session is dead. */
  onAuthExpired: () => Promise<string | null>;
  onAuthFailed: () => void;
}

export function useTodos({ backend, accessToken, isAuthReady, onAuthExpired, onAuthFailed }: UseTodosArgs) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  // Runs `fn` with the current access token; on a 401 it tries once to
  // refresh and retry before giving up (and clearing the session). Every
  // call site (load/add/toggle/remove) goes through this so none of them
  // has to duplicate the retry dance — or forget it and leak an unhandled
  // rejection when a request happens to land after the access token expired.
  const callWithAuthRetry = useCallback(
    async <T,>(fn: (token: string | null) => Promise<T>): Promise<T> => {
      try {
        return await fn(accessToken);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && backend.requiresAuth) {
          const freshToken = await onAuthExpired();
          if (freshToken) {
            return await fn(freshToken);
          }
          onAuthFailed();
        }
        throw err;
      }
    },
    [accessToken, backend, onAuthExpired, onAuthFailed],
  );

  const load = useCallback(async () => {
    if (!isAuthReady) {
      // e.g. right after logout — clear whatever the last session showed
      // instead of leaving a stale "Connected successfully" banner up.
      setTodos([]);
      setStatus(null);
      return;
    }
    setIsLoading(true);
    setStatus({ type: 'loading', text: `Connecting to ${backend.name}...` });
    try {
      const data = await callWithAuthRetry((token) => fetchTodos(backend, token));
      setTodos(data);
      setStatus({ type: 'success', text: `Connected successfully to Port ${backend.port}` });
    } catch (err) {
      setTodos([]);
      setStatus({
        type: 'error',
        text:
          err instanceof ApiError && err.status === 401
            ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.'
            : `Failed to connect to ${backend.name} at ${backend.url}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [backend, isAuthReady, callWithAuthRetry]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (title: string) => {
      const newTodo = await callWithAuthRetry((token) => createTodo(backend, token, title));
      setTodos((prev) => [newTodo, ...prev]);
    },
    [backend, callWithAuthRetry],
  );

  const toggle = useCallback(
    async (id: number, completed: boolean) => {
      try {
        const updated = await callWithAuthRetry((token) => updateTodoCompleted(backend, token, id, completed));
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch {
        setStatus({ type: 'error', text: 'Không cập nhật được công việc, thử lại nhé.' });
      }
    },
    [backend, callWithAuthRetry],
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await callWithAuthRetry((token) => deleteTodoById(backend, token, id));
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setStatus({ type: 'error', text: 'Không xoá được công việc, thử lại nhé.' });
      }
    },
    [backend, callWithAuthRetry],
  );

  return { todos, isLoading, status, reload: load, add, toggle, remove };
}
