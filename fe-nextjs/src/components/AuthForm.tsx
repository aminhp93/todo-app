'use client';

import { FormEvent, useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface Props {
  isSubmitting: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
}

export default function AuthForm({ isSubmitting, error, onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!EMAIL_RE.test(email)) return 'Email không hợp lệ.';
    if (password.length < MIN_PASSWORD_LENGTH) return `Mật khẩu cần tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`;
    if (mode === 'register' && name.trim().length === 0) return 'Vui lòng nhập tên.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name.trim());
      }
    } catch {
      // `error` prop already carries the server-side message; nothing else to do here.
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 space-y-5">
      <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
        {mode === 'login' ? <LogIn className="w-4 h-4 text-violet-500" /> : <UserPlus className="w-4 h-4 text-violet-500" />}
        {mode === 'login' ? 'Đăng nhập vào Node + Express' : 'Tạo tài khoản mới'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Tên hiển thị"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all text-sm"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all text-sm"
        />
        <input
          type="password"
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all text-sm"
        />

        {(formError || error) && <p className="text-red-400 text-xs">{formError ?? error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-violet-500 hover:bg-violet-600 active:scale-95 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          {isSubmitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setFormError(null);
        }}
        className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
      >
        {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </div>
  );
}
