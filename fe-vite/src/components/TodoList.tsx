import { Database } from 'lucide-react';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface Props {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <div className="py-12 px-4 text-center space-y-2">
        <Database className="w-8 h-8 text-zinc-700 mx-auto" />
        <p className="text-zinc-500 text-sm">Không tìm thấy dữ liệu todos nào.</p>
        <p className="text-xs text-zinc-600 font-mono">Kiểm tra kết nối backend hoặc thêm todo mới.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
