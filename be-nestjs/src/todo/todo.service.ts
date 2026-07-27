import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TodoService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/todo_db';
    this.pool = new Pool({
      connectionString: databaseUrl,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    return result.rows;
  }

  async findOne(id: string) {
    const result = await this.pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  async create(title: string) {
    const result = await this.pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false],
    );
    return result.rows[0];
  }

  async update(id: string, title?: string, completed?: boolean) {
    const checkExist = await this.pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    const currentTodo = checkExist.rows[0];
    const newTitle = title !== undefined ? title : currentTodo.title;
    const newCompleted = completed !== undefined ? completed : currentTodo.completed;

    const result = await this.pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [newTitle, newCompleted, id],
    );
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return { message: 'Todo deleted successfully', todo: result.rows[0] };
  }
}
