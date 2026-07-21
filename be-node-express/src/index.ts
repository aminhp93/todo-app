import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/todo_db';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: databaseUrl,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL');
    release();
  }
});

// GET /api/todos
app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/todos
app.post('/api/todos', async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/todos/:id
app.patch('/api/todos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  try {
    // Check if item exists
    const checkExist = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const currentTodo = checkExist.rows[0];
    const newTitle = title !== undefined ? title : currentTodo.title;
    const newCompleted = completed !== undefined ? completed : currentTodo.completed;

    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [newTitle, newCompleted, id]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully', todo: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Node-Express server running on port ${port}`);
});
