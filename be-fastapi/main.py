import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="FastAPI Todo Service")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/todo_db"
)

def get_db_connection():
    # Use RealDictCursor to get results as dictionaries instead of tuples
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

# Pydantic schemas
class TodoSchema(BaseModel):
    id: int
    title: str
    completed: bool
    created_at: str

class TodoCreate(BaseModel):
    title: str

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

@app.get("/api/todos")
def read_todos():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM todos ORDER BY created_at DESC;")
                todos = cur.fetchall()
                # Convert timestamps to string to avoid serialization issues
                for todo in todos:
                    todo["created_at"] = todo["created_at"].isoformat()
                return todos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/todos", status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate):
    if not payload.title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required"
        )
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO todos (title, completed) VALUES (%s, %s) RETURNING *;",
                    (payload.title, False)
                )
                todo = cur.fetchone()
                conn.commit()
                todo["created_at"] = todo["created_at"].isoformat()
                return todo
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.patch("/api/todos/{todo_id}")
def update_todo(todo_id: int, payload: TodoUpdate):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check exist
                cur.execute("SELECT * FROM todos WHERE id = %s;", (todo_id,))
                current_todo = cur.fetchone()
                if not current_todo:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Todo not found"
                    )
                
                title = payload.title if payload.title is not None else current_todo["title"]
                completed = payload.completed if payload.completed is not None else current_todo["completed"]

                cur.execute(
                    "UPDATE todos SET title = %s, completed = %s WHERE id = %s RETURNING *;",
                    (title, completed, todo_id)
                )
                todo = cur.fetchone()
                conn.commit()
                todo["created_at"] = todo["created_at"].isoformat()
                return todo
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM todos WHERE id = %s RETURNING *;", (todo_id,))
                todo = cur.fetchone()
                if not todo:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Todo not found"
                    )
                conn.commit()
                todo["created_at"] = todo["created_at"].isoformat()
                return {"message": "Todo deleted successfully", "todo": todo}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5004))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
