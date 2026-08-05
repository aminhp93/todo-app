import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
  categoryId: z.number().int().positive().nullable().optional(),
});

export const updateTodoSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    completed: z.boolean().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'color must be a hex value like #3b82f6')
    .default('#6b7280'),
});
