import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TodoService } from './todo.service';

function toGraphTodo(row: any) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

@Resolver('Todo')
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query('todos')
  async todos() {
    const rows = await this.todoService.findAll();
    return rows.map(toGraphTodo);
  }

  @Query('todo')
  async todo(@Args('id') id: string) {
    const row = await this.todoService.findOne(id);
    return row ? toGraphTodo(row) : null;
  }

  @Mutation('createTodo')
  async createTodo(@Args('title') title: string) {
    const row = await this.todoService.create(title);
    return toGraphTodo(row);
  }

  @Mutation('updateTodo')
  async updateTodo(
    @Args('id') id: string,
    @Args('title') title?: string,
    @Args('completed') completed?: boolean,
  ) {
    const row = await this.todoService.update(id, title, completed);
    return toGraphTodo(row);
  }

  @Mutation('deleteTodo')
  async deleteTodo(@Args('id', { type: () => ID }) id: string) {
    const { message, todo } = await this.todoService.remove(id);
    return { message, todo: toGraphTodo(todo) };
  }
}
