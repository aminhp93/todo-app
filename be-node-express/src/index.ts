import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

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

// GraphQL Setup (Level 1)
const typeDefs = `#graphql
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: String!
  }

  type DeleteTodoResult {
    message: String!
    todo: Todo!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!): Todo!
    updateTodo(id: ID!, title: String, completed: Boolean): Todo!
    deleteTodo(id: ID!): DeleteTodoResult!
  }
`;

function toGraphTodo(row: any) {
  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
  };
}

const resolvers = {
  Query: {
    todos: async () => {
      const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
      return result.rows.map(toGraphTodo);
    },
    todo: async (_: any, { id }: { id: string }) => {
      const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
      const row = result.rows[0];
      return row ? toGraphTodo(row) : null;
    },
  },
  Mutation: {
    createTodo: async (_: any, { title }: { title: string }) => {
      if (!title) {
        throw new Error('Title is required');
      }
      const result = await pool.query(
        'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
        [title, false]
      );
      return toGraphTodo(result.rows[0]);
    },
    updateTodo: async (
      _: any,
      { id, title, completed }: { id: string; title?: string; completed?: boolean }
    ) => {
      const checkExist = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
      if (checkExist.rows.length === 0) {
        throw new Error(`Todo with ID ${id} not found`);
      }
      const currentTodo = checkExist.rows[0];
      const newTitle = title !== undefined ? title : currentTodo.title;
      const newCompleted = completed !== undefined ? completed : currentTodo.completed;

      const result = await pool.query(
        'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
        [newTitle, newCompleted, id]
      );
      return toGraphTodo(result.rows[0]);
    },
    deleteTodo: async (_: any, { id }: { id: string }) => {
      const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        throw new Error(`Todo with ID ${id} not found`);
      }
      return {
        message: 'Todo deleted successfully',
        todo: toGraphTodo(result.rows[0]),
      };
    },
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use('/graphql', expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Node-Express server running on port ${port}`);
    console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
