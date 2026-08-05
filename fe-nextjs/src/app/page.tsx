'use client';

import { useState } from 'react';
import { LogOut, Sparkles, Terminal } from 'lucide-react';
import { BACKENDS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import BackendSwitcher from '../components/BackendSwitcher';
import AuthForm from '../components/AuthForm';
import AddTodoForm from '../components/AddTodoForm';
import TodoList from '../components/TodoList';

export default function Home() {
  const [selectedBackend, setSelectedBackend] = useState(BACKENDS[0]);

  const auth = useAuth(selectedBackend);
  const isAuthReady = !selectedBackend.requiresAuth || auth.isAuthenticated;

  const { todos, isLoading, status, reload, add, toggle, remove } = useTodos({
    backend: selectedBackend,
    accessToken: auth.accessToken,
    isAuthReady,
    onAuthExpired: auth.refresh,
    onAuthFailed: auth.logout,
  });

  const needsLogin = selectedBackend.requiresAuth && !auth.isAuthenticated;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-12 px-4 selection:bg-violet-500/30">
      {/* Header */}
      <div className="w-full max-w-2xl mb-10 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-3.5 py-1.5 rounded-full border border-violet-500/20 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Next.js App Router (Client)
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Todo <span className="text-violet-500">Cross-Compile</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
          Xây dựng ứng dụng Todo với mục đích so sánh trực quan cấu trúc và cách hoạt động của nhiều backend
          framework kết nối chung cơ sở dữ liệu Postgres.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <BackendSwitcher
          backends={BACKENDS}
          selected={selectedBackend}
          onChange={setSelectedBackend}
          onRefresh={reload}
          isLoading={isLoading}
          status={status}
        />

        {needsLogin ? (
          <AuthForm
            isSubmitting={auth.isSubmitting}
            error={auth.authError}
            onLogin={auth.login}
            onRegister={auth.register}
          />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            {selectedBackend.requiresAuth && auth.user && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 text-xs">
                <span className="text-zinc-400">
                  Xin chào, <span className="text-zinc-200 font-semibold">{auth.user.name}</span>
                </span>
                <button
                  onClick={() => void auth.logout()}
                  className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            )}

            <AddTodoForm onAdd={add} />
            <TodoList todos={todos} onToggle={toggle} onDelete={remove} />

            <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/80 px-5 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Target: {selectedBackend.framework}</span>
              </div>
              <span>{todos.length} items</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
