'use client';

import { Check, Trash2 } from 'lucide-react';
import { Todo } from '../types';

interface Props {
  todo: Todo;
  /** `completed` is the NEW value to set, not the current one. */
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-all group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
            todo.completed
              ? 'bg-violet-500 border-violet-600 text-white'
              : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950'
          }`}
        >
          {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
        <span
          className={`text-sm truncate pr-4 transition-all ${
            todo.completed ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200'
          }`}
        >
          {todo.title}
        </span>
        {todo.category_name && (
          <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
            {todo.category_name}
          </span>
        )}
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Xóa công việc"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
