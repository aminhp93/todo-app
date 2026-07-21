import { Controller, Get, Post, Patch, Delete, Param, Body, BadRequestException } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('api/todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll() {
    return this.todoService.findAll();
  }

  @Post()
  async create(@Body('title') title: string) {
    if (!title) {
      throw new BadRequestException('Title is required');
    }
    return this.todoService.create(title);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('completed') completed?: boolean,
  ) {
    return this.todoService.update(id, title, completed);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }
}
