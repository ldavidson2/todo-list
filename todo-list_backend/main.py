from fastapi import FastAPI
from pydantic import BaseModel, TypeAdapter
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json

app = FastAPI()

conn = sqlite3.connect("todo_list.sqlite")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    task_name: str
    description: str | None = None
    date_completed: datetime | None = None
    completed: bool

conn.execute("""CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY,
                    task_name TEXT NOT NULL,
                    description TEXT,
                    date_added DATETIME NOT NULL,
                    date_completed DATETIME,
                    completed BOOLEAN)""")

@app.get("/tasks")
async def get_tasks():
    tasks = []
    cursor = conn.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()
    for row in rows:
        tasks.append({"id": row[0], "task_name": row[1], "description": row[2], "date_added": row[3], "date_completed": row[4], "completed": row[5]})
    return tasks

@app.post("/newTask")
async def new_task(task: Task):
    #return message if task with this name already exists
    cursor = conn.execute("INSERT INTO tasks (task_name, description, date_added, date_completed, completed) VALUES (?, ?, ?, ?, ?)",
                          (task.task_name, task.description, datetime.today().strftime('%Y-%m-%d'), task.date_completed, task.completed))
    conn.commit()
    return {"message": f"{task.task_name} added to list."}

@app.post("/updateTask/{task_id}/{task_name}/{description}")
async def update_task(task_id, task_name, description):
    #add special message if name is changed
    cursor = conn.execute("UPDATE tasks SET task_name = ?, description = ? WHERE id = ?",
                          (task_name, description, task_id))
    conn.commit()
    return {"message": f"{task_name} updated successfully."}

@app.post("/deleteTask/{task_id}")
async def delete_task(task_id):
    cursor = conn.execute("SELECT task_name FROM tasks WHERE id = ?", (task_id))
    task_name = cursor.fetchone()
    cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    return {"message": f"{task_name} removed from list."}

@app.post("/completeTask/{task_id}")
async def complete_task(task_id):
    print(task_id)
    cursor = conn.execute("SELECT completed FROM tasks WHERE id = ?", (task_id))
    completed = cursor.fetchone()
    print(completed)

    if 0 in completed:
        cursor = conn.execute("UPDATE tasks SET date_completed = ?, completed = ? WHERE id = ?",
                            (datetime.today().strftime('%Y-%m-%d'), True, task_id))
        
    else:
        cursor = conn.execute("UPDATE tasks SET date_completed = ?, completed = ? WHERE id = ?",
                            (None, False, task_id))

    conn.commit()
    return {"message": "Task completed."}