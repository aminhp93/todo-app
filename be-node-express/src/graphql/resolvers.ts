import { GraphQLError } from 'graphql';
import * as todoRepo from '../repositories/todo.repository';
import * as todoService from '../services/todo.service';
import { Todo } from '../types/domain';
import { GraphQLContext, requireUserId } from './context';
import { AppError } from '../utils/AppError';

function toGraphTodo(todo: Todo) {
  return {
    id: String(todo.id),
    title: todo.title,
    completed: todo.completed,
    categoryId: todo.category_id !== null ? String(todo.category_id) : null,
    createdAt: todo.created_at.toISOString(),
  };
}

function toGraphQLError(err: unknown): never {
  if (err instanceof AppError) {
    throw new GraphQLError(err.message, { extensions: { code: err.statusCode } });
  }
  throw err;
}

export const resolvers = {
  Query: {
    todos: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const userId = requireUserId(ctx);
      const rows = await todoRepo.listAllTodosForUser(userId);
      return rows.map(toGraphTodo);
    },
    todo: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const userId = requireUserId(ctx);
      const row = await todoRepo.findTodoById(Number(id), userId);
      return row ? toGraphTodo(row) : null;
    },
  },
  Mutation: {
    createTodo: async (
      _: unknown,
      { title, categoryId }: { title: string; categoryId?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = requireUserId(ctx);
      try {
        const todo = await todoService.createTodo(userId, title, categoryId ? Number(categoryId) : null);
        return toGraphTodo(todo);
      } catch (err) {
        toGraphQLError(err);
      }
    },
    updateTodo: async (
      _: unknown,
      { id, title, completed }: { id: string; title?: string; completed?: boolean },
      ctx: GraphQLContext,
    ) => {
      const userId = requireUserId(ctx);
      try {
        const todo = await todoService.updateTodo(Number(id), userId, { title, completed });
        return toGraphTodo(todo);
      } catch (err) {
        toGraphQLError(err);
      }
    },
    deleteTodo: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const userId = requireUserId(ctx);
      try {
        const todo = await todoService.deleteTodo(Number(id), userId);
        return { message: 'Todo deleted successfully', todo: toGraphTodo(todo) };
      } catch (err) {
        toGraphQLError(err);
      }
    },
  },
};
