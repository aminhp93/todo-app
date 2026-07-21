import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { corsHeaders } from '@/lib/cors';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const { title, completed } = await request.json();

    // Check if item exists
    const checkExist = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404, headers: corsHeaders });
    }

    const currentTodo = checkExist.rows[0];
    const newTitle = title !== undefined ? title : currentTodo.title;
    const newCompleted = completed !== undefined ? completed : currentTodo.completed;

    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [newTitle, newCompleted, id]
    );

    return NextResponse.json(result.rows[0], { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error updating todo in NextJS:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(
      { message: 'Todo deleted successfully', todo: result.rows[0] },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error deleting todo in NextJS:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
