import * as todoRepo from '../repositories/todo.repository';
import * as categoryRepo from '../repositories/category.repository';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { Todo, TodoWithCategory } from '../types/domain';
import { CategoryStat, ListTodosResult, UpdateTodoFields } from '../repositories/todo.repository';

const SORTABLE_COLUMNS = ['created_at', 'title', 'completed'] as const;
type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export interface ListTodosQuery {
  completed?: string;
  categoryId?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortDir?: string;
}

function parseListParams(userId: number, query: ListTodosQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const sortBy = SORTABLE_COLUMNS.includes(query.sortBy as SortableColumn)
    ? (query.sortBy as SortableColumn)
    : 'created_at';
  const sortDir = query.sortDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const completed =
    query.completed === 'true' ? true : query.completed === 'false' ? false : undefined;

  const categoryId = query.categoryId !== undefined ? Number(query.categoryId) : undefined;
  if (categoryId !== undefined && Number.isNaN(categoryId)) {
    throw new BadRequestError('categoryId must be a number');
  }

  return { userId, completed, categoryId, page, limit, sortBy, sortDir } as const;
}

export async function listTodos(
  userId: number,
  query: ListTodosQuery,
): Promise<{ result: ListTodosResult; page: number; limit: number }> {
  const params = parseListParams(userId, query);
  const result = await todoRepo.listTodos(params);
  return { result, page: params.page, limit: params.limit };
}

async function assertCategoryOwnership(categoryId: number | null, userId: number): Promise<void> {
  if (categoryId === null) return;
  const category = await categoryRepo.findCategoryById(categoryId, userId);
  if (!category) {
    throw new BadRequestError(`Category ${categoryId} does not exist for this user`);
  }
}

export async function createTodo(userId: number, title: string, categoryId?: number | null): Promise<Todo> {
  const resolvedCategoryId = categoryId ?? null;
  await assertCategoryOwnership(resolvedCategoryId, userId);
  return todoRepo.createTodo(userId, title, resolvedCategoryId);
}

export async function updateTodo(id: number, userId: number, fields: UpdateTodoFields): Promise<Todo> {
  if (fields.categoryId !== undefined) {
    await assertCategoryOwnership(fields.categoryId, userId);
  }
  const updated = await todoRepo.updateTodo(id, userId, fields);
  if (!updated) {
    throw new NotFoundError('Todo not found');
  }
  return updated;
}

export async function deleteTodo(id: number, userId: number): Promise<Todo> {
  const deleted = await todoRepo.deleteTodo(id, userId);
  if (!deleted) {
    throw new NotFoundError('Todo not found');
  }
  return deleted;
}

export async function getStats(userId: number): Promise<CategoryStat[]> {
  return todoRepo.getTodoStatsByCategory(userId);
}

export type { TodoWithCategory };
