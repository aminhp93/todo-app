import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import strawberry
from strawberry.fastapi import GraphQLRouter

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

# Pydantic schemas for REST API
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

# REST Endpoints
@app.get("/api/todos")
def read_todos():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM todos ORDER BY created_at DESC;")
                todos = cur.fetchall()
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


# GraphQL Setup (Level 1)
@strawberry.type
class Todo:
    id: strawberry.ID
    title: str
    completed: bool
    createdAt: str

@strawberry.type
class DeleteTodoResult:
    message: str
    todo: Todo

def to_graph_todo(row: dict) -> Todo:
    created_at_val = row["created_at"]
    created_at_str = created_at_val.isoformat() if hasattr(created_at_val, "isoformat") else str(created_at_val)

    return Todo(
        id=strawberry.ID(str(row["id"])),
        title=row["title"],
        completed=row["completed"],
        createdAt=created_at_str
    )

@strawberry.type
class Query:
    @strawberry.field
    def todos(self) -> List[Todo]:
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT * FROM todos ORDER BY created_at DESC;")
                    rows = cur.fetchall()
                    return [to_graph_todo(row) for row in rows]
        except Exception as e:
            raise Exception(str(e))

    @strawberry.field
    def todo(self, id: strawberry.ID) -> Optional[Todo]:
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT * FROM todos WHERE id = %s;", (int(id),))
                    row = cur.fetchone()
                    return to_graph_todo(row) if row else None
        except Exception as e:
            raise Exception(str(e))

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_todo(self, title: str) -> Todo:
        if not title:
            raise Exception("Title is required")
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO todos (title, completed) VALUES (%s, %s) RETURNING *;",
                        (title, False)
                    )
                    row = cur.fetchone()
                    conn.commit()
                    return to_graph_todo(row)
        except Exception as e:
            raise Exception(str(e))

    @strawberry.mutation
    def update_todo(self, id: strawberry.ID, title: Optional[str] = None, completed: Optional[bool] = None) -> Todo:
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    todo_id = int(id)
                    cur.execute("SELECT * FROM todos WHERE id = %s;", (todo_id,))
                    current_todo = cur.fetchone()
                    if not current_todo:
                        raise Exception(f"Todo with ID {id} not found")
                    
                    new_title = title if title is not None else current_todo["title"]
                    new_completed = completed if completed is not None else current_todo["completed"]

                    cur.execute(
                        "UPDATE todos SET title = %s, completed = %s WHERE id = %s RETURNING *;",
                        (new_title, new_completed, todo_id)
                    )
                    row = cur.fetchone()
                    conn.commit()
                    return to_graph_todo(row)
        except Exception as e:
            raise Exception(str(e))

    @strawberry.mutation
    def delete_todo(self, id: strawberry.ID) -> DeleteTodoResult:
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    todo_id = int(id)
                    cur.execute("DELETE FROM todos WHERE id = %s RETURNING *;", (todo_id,))
                    row = cur.fetchone()
                    if not row:
                        raise Exception(f"Todo with ID {id} not found")
                    conn.commit()
                    return DeleteTodoResult(
                        message="Todo deleted successfully",
                        todo=to_graph_todo(row)
                    )
        except Exception as e:
            raise Exception(str(e))

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5004))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
