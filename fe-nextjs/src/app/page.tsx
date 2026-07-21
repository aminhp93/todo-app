'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Trash2, Plus, RefreshCw, Layers, Database, Sparkles, Terminal } from 'lucide-react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

interface BackendOption {
  id: string;
  name: string;
  url: string;
  framework: string;
  port: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const BACKENDS: BackendOption[] = [
  {
    id: 'node-express',
    name: 'Node + Express',
    url: 'http://localhost:5001',
    framework: 'Node.js (TypeScript)',
    port: 5001,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'nextjs-api',
    name: 'Next.js Routes',
    url: 'http://localhost:5002',
    framework: 'Next.js App Router (TS)',
    port: 5002,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    url: 'http://localhost:5003',
    framework: 'NestJS (TypeScript)',
    port: 5003,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  {
    id: 'fastapi',
    name: 'FastAPI Python',
    url: 'http://localhost:5004',
    framework: 'FastAPI (Python 3.9)',
    port: 5004,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
];

export default function Home() {
  const [selectedBackend, setSelectedBackend] = useState<BackendOption>(BACKENDS[0]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'loading'; text: string } | null>(null);

  const fetchTodos = useCallback(async (backend = selectedBackend) => {
    setIsLoading(true);
    setStatusMsg({ type: 'loading', text: `Connecting to ${backend.name}...` });
    try {
      const res = await fetch(`${backend.url}/api/todos`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTodos(data);
      setStatusMsg({ type: 'success', text: `Connected successfully to Port ${backend.port}` });
    } catch (err: any) {
      console.error(err);
      setTodos([]);
      setStatusMsg({ type: 'error', text: `Failed to connect to ${backend.name} at ${backend.url}` });
    } finally {
      setIsLoading(false);
    }
  }, [selectedBackend]);

  useEffect(() => {
    fetchTodos();
  }, [selectedBackend, fetchTodos]);

  const handleBackendChange = (backend: BackendOption) => {
    setSelectedBackend(backend);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${selectedBackend.url}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setNewTitle('');
    } catch (err) {
      alert('Error creating todo. Is the server running?');
    }
  };

  const handleToggle = async (id: number, currentCompleted: boolean) => {
    try {
      const res = await fetch(`${selectedBackend.url}/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      alert('Error updating todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${selectedBackend.url}/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Error deleting todo');
    }
  };

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
          Xây dựng ứng dụng Todo với mục đích so sánh trực quan cấu trúc và cách hoạt động của nhiều backend framework kết nối chung cơ sở dữ liệu Postgres.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Backend Switcher */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm">
              <Layers className="w-4 h-4 text-violet-500" />
              CHỌN BACKEND API
            </div>
            <button 
              onClick={() => fetchTodos()} 
              className="text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-zinc-800 rounded-lg"
              title="Refresh connection"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BACKENDS.map((b) => {
              const isSelected = selectedBackend.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBackendChange(b)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected 
                      ? `${b.bgColor} ${b.borderColor} border-opacity-100 shadow-lg ring-1 ring-violet-500/20` 
                      : 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-800/40 hover:border-zinc-700'
                  }`}
                >
                  <span className={`text-xs font-semibold ${isSelected ? b.color : 'text-zinc-400'}`}>
                    {b.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                    Port {b.port}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Connection Status Indicator */}
          {statusMsg && (
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${
                statusMsg.type === 'success' ? 'bg-emerald-500 animate-pulse' :
                statusMsg.type === 'error' ? 'bg-red-500' : 'bg-orange-500 animate-bounce'
              }`} />
              <span className="text-zinc-400 font-mono">
                {statusMsg.text}
              </span>
            </div>
          )}
        </div>

        {/* Todo Core card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Create Todo Form */}
          <form onSubmit={handleCreate} className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex gap-2">
            <input
              type="text"
              placeholder="Thêm công việc cần làm..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all text-sm"
            />
            <button
              type="submit"
              className="bg-violet-500 hover:bg-violet-600 active:scale-95 text-white font-bold px-4 rounded-xl transition-all flex items-center justify-center shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Todos List */}
          <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
            {todos.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <Database className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 text-sm">Không tìm thấy dữ liệu todos nào.</p>
                <p className="text-xs text-zinc-600 font-mono">Kiểm tra kết nối backend hoặc thêm todo mới.</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className="flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggle(todo.id, todo.completed)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        todo.completed
                          ? 'bg-violet-500 border-violet-600 text-white'
                          : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950'
                      }`}
                    >
                      {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className={`text-sm truncate pr-4 transition-all ${
                      todo.completed 
                        ? 'text-zinc-500 line-through decoration-zinc-700' 
                        : 'text-zinc-200'
                    }`}>
                      {todo.title}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa công việc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/80 px-5 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Target: {selectedBackend.framework}</span>
            </div>
            <span>{todos.length} items</span>
          </div>

        </div>

      </div>
    </div>
  );
}
