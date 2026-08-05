'use client';

import { Layers, RefreshCw } from 'lucide-react';
import { BackendOption, StatusMessage } from '../types';

interface Props {
  backends: BackendOption[];
  selected: BackendOption;
  onChange: (backend: BackendOption) => void;
  onRefresh: () => void;
  isLoading: boolean;
  status: StatusMessage | null;
}

export default function BackendSwitcher({ backends, selected, onChange, onRefresh, isLoading, status }: Props) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm">
          <Layers className="w-4 h-4 text-violet-500" />
          CHỌN BACKEND API
        </div>
        <button
          onClick={onRefresh}
          className="text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-zinc-800 rounded-lg"
          title="Refresh connection"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {backends.map((b) => {
          const isSelected = selected.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onChange(b)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? `${b.bgColor} ${b.borderColor} border-opacity-100 shadow-lg ring-1 ring-violet-500/20`
                  : 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-800/40 hover:border-zinc-700'
              }`}
            >
              <span className={`text-xs font-semibold ${isSelected ? b.color : 'text-zinc-400'}`}>{b.name}</span>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                Port {b.port}
                {b.requiresAuth ? ' · Auth' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {status && (
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              status.type === 'success'
                ? 'bg-emerald-500 animate-pulse'
                : status.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-orange-500 animate-bounce'
            }`}
          />
          <span className="text-zinc-400 font-mono">{status.text}</span>
        </div>
      )}
    </div>
  );
}
