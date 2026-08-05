import * as categoryRepo from '../repositories/category.repository';
import { Category } from '../types/domain';
import { NotFoundError } from '../utils/AppError';

export function listCategories(userId: number): Promise<Category[]> {
  return categoryRepo.listCategoriesForUser(userId);
}

export function createCategory(userId: number, name: string, color: string): Promise<Category> {
  return categoryRepo.createCategory(userId, name, color);
}

export async function deleteCategory(id: number, userId: number): Promise<Category> {
  const deleted = await categoryRepo.deleteCategory(id, userId);
  if (!deleted) {
    throw new NotFoundError('Category not found');
  }
  return deleted;
}
