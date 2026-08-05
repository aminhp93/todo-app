import { pool } from '../config/db';
import { Category } from '../types/domain';

export async function listCategoriesForUser(userId: number): Promise<Category[]> {
  const result = await pool.query<Category>(
    'SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC',
    [userId],
  );
  return result.rows;
}

export async function createCategory(userId: number, name: string, color: string): Promise<Category> {
  const result = await pool.query<Category>(
    'INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, color],
  );
  return result.rows[0];
}

export async function findCategoryById(id: number, userId: number): Promise<Category | null> {
  const result = await pool.query<Category>(
    'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function deleteCategory(id: number, userId: number): Promise<Category | null> {
  const result = await pool.query<Category>(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId],
  );
  return result.rows[0] ?? null;
}
