import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, BadRequestError } from '../utils/AppError';

function requireUserId(req: Request): number {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.listCategories(requireUserId(req));
  res.json(categories);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, color } = req.body;
  const category = await categoryService.createCategory(requireUserId(req), name, color);
  res.status(201).json(category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new BadRequestError('Invalid category id');
  const category = await categoryService.deleteCategory(id, requireUserId(req));
  res.json({ message: 'Category deleted successfully', category });
});
