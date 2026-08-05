'use client';

import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';

const MAX_TITLE_LENGTH = 255;

interface Props {
  onAdd: (title: string) => Promise<void>;
  disabled?: boolean;
}

export default function AddTodoForm({ onAdd, disabled }: Props) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = title.trim();
  const isTooLong = title.length > MAX_TITLE_LENGTH;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || isTooLong || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setTitle('');
    } catch {
      setError('Không thêm được công việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border-b border-zinc-800 bg-zinc-900/60">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Thêm công việc cần làm..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || isSubmitting}
          maxLength={MAX_TITLE_LENGTH + 1}
          className="flex-1 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!trimmed || isTooLong || disabled || isSubmitting}
          className="bg-violet-500 hover:bg-violet-600 active:scale-95 disabled:opacity-40 disabled:active:scale-100 text-white font-bold px-4 rounded-xl transition-all flex items-center justify-center shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {isTooLong && (
        <p className="text-red-400 text-xs mt-2">Tối đa {MAX_TITLE_LENGTH} ký tự ({title.length}).</p>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  );
}
