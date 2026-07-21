import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { corsHeaders } from '@/lib/cors';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    return NextResponse.json(result.rows, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching todos in NextJS:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400, headers: corsHeaders });
    }
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false]
    );
    return NextResponse.json(result.rows[0], { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error('Error creating todo in NextJS:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
