import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';

@Module({
  controllers: [TodoController],
  providers: [TodoService, TodoResolver],
})
export class TodoModule {}
