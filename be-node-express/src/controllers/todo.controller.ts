import { Request, Response } from 'express';
import * as todoService from '../services/todo.service';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, BadRequestError } from '../utils/AppError';

function requireUserId(req: Request): number {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { result, page, limit } = await todoService.listTodos(userId, req.query);
  res.json({
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { title, categoryId } = req.body;
  const todo = await todoService.createTodo(userId, title, categoryId);
  res.status(201).json(todo);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new BadRequestError('Invalid todo id');
  const todo = await todoService.updateTodo(id, userId, req.body);
  res.json(todo);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new BadRequestError('Invalid todo id');
  const todo = await todoService.deleteTodo(id, userId);
  res.json({ message: 'Todo deleted successfully', todo });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const data = await todoService.getStats(userId);
  res.json(data);
});
