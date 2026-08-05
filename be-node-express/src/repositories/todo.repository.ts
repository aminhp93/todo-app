import { pool } from '../config/db';
import { Todo, TodoWithCategory } from '../types/domain';

export interface ListTodosParams {
  userId: number;
  completed?: boolean;
  categoryId?: number;
  page: number;
  limit: number;
  sortBy: 'created_at' | 'title' | 'completed';
  sortDir: 'ASC' | 'DESC';
}

export interface ListTodosResult {
  rows: TodoWithCategory[];
  total: number;
}

export async function listTodos(params: ListTodosParams): Promise<ListTodosResult> {
  const { userId, completed, categoryId, page, limit, sortBy, sortDir } = params;

  const conditions: string[] = ['t.user_id = $1'];
  const values: unknown[] = [userId];

  if (completed !== undefined) {
    values.push(completed);
    conditions.push(`t.completed = $${values.length}`);
  }
  if (categoryId !== undefined) {
    values.push(categoryId);
    conditions.push(`t.category_id = $${values.length}`);
  }

  const whereClause = conditions.join(' AND ');
  // sortBy/sortDir are validated against a whitelist before reaching here
  // (see todo.service.ts) — safe to interpolate directly.
  const orderClause = `t.${sortBy} ${sortDir}`;

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM todos t WHERE ${whereClause}`,
    values,
  );

  values.push(limit);
  const limitPlaceholder = `$${values.length}`;
  values.push((page - 1) * limit);
  const offsetPlaceholder = `$${values.length}`;

  const rowsResult = await pool.query<TodoWithCategory>(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
     FROM todos t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     ORDER BY ${orderClause}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values,
  );

  return { rows: rowsResult.rows, total: Number(countResult.rows[0].count) };
}

export async function findTodoById(id: number, userId: number): Promise<Todo | null> {
  const result = await pool.query<Todo>('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rows[0] ?? null;
}

// Unpaginated fetch used by the GraphQL `todos` query, which has no
// pagination args in its schema.
export async function listAllTodosForUser(userId: number): Promise<Todo[]> {
  const result = await pool.query<Todo>(
    'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return result.rows;
}

export async function createTodo(userId: number, title: string, categoryId: number | null): Promise<Todo> {
  const result = await pool.query<Todo>(
    'INSERT INTO todos (user_id, title, category_id, completed) VALUES ($1, $2, $3, false) RETURNING *',
    [userId, title, categoryId],
  );
  return result.rows[0];
}

export interface UpdateTodoFields {
  title?: string;
  completed?: boolean;
  categoryId?: number | null;
}

export async function updateTodo(id: number, userId: number, fields: UpdateTodoFields): Promise<Todo | null> {
  const current = await findTodoById(id, userId);
  if (!current) return null;

  const title = fields.title !== undefined ? fields.title : current.title;
  const completed = fields.completed !== undefined ? fields.completed : current.completed;
  const categoryId = fields.categoryId !== undefined ? fields.categoryId : current.category_id;

  const result = await pool.query<Todo>(
    'UPDATE todos SET title = $1, completed = $2, category_id = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
    [title, completed, categoryId, id, userId],
  );
  return result.rows[0];
}

export async function deleteTodo(id: number, userId: number): Promise<Todo | null> {
  const result = await pool.query<Todo>(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export interface CategoryStat {
  category_id: number | null;
  category_name: string | null;
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

// Analytical query: per-category totals/completion via LEFT JOIN + GROUP BY,
// with the completion rate computed in SQL rather than in application code.
export async function getTodoStatsByCategory(userId: number): Promise<CategoryStat[]> {
  const result = await pool.query<CategoryStat>(
    `SELECT
       c.id AS category_id,
       COALESCE(c.name, 'Uncategorized') AS category_name,
       COUNT(t.id)::int AS total,
       COUNT(t.id) FILTER (WHERE t.completed)::int AS completed,
       COUNT(t.id) FILTER (WHERE NOT t.completed)::int AS pending,
       ROUND(
         100.0 * COUNT(t.id) FILTER (WHERE t.completed) / NULLIF(COUNT(t.id), 0),
         1
       ) AS completion_rate
     FROM todos t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     GROUP BY c.id, c.name
     ORDER BY total DESC`,
    [userId],
  );
  return result.rows;
}
