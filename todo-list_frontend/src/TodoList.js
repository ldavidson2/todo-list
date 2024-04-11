import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListStyles.css";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState();
  const [newTaskDescription, setNewTaskDescription] = useState();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState();
  const [updatedTaskName, setUpdatedTaskName] = useState();
  const [updatedTaskDescription, setUpdatedTaskDescription] = useState();

  useEffect(() => {
    getTasks();
  }, []);

  async function getTasks() {
    setAddingTask(false);
    const todoList = await axios.get("http://localhost:8000/tasks");
    setTasks(todoList.data);
  }

  async function newTask(e) {
    try {
      e.preventDefault();
      const response = await axios.post("http://localhost:8000/newTask", {
        task_name: newTaskName,
        description: newTaskDescription,
        completed: false,
      });
    } catch (e) {
      console.log(e);
    }
    getTasks();
  }

  async function completeTask(taskId) {
    console.log(taskId);
    const response = await axios.post(`http://localhost:8000/completeTask/${taskId}`);
    getTasks();
  }

  async function editTask(task) {
    await setTaskToEdit(task.id);
    await setUpdatedTaskName(task.task_name);
    await setUpdatedTaskDescription(task.description);
    setEditingTask(true);
    setAddingTask(false);
  }

  async function updateTask() {
    const response = await axios.post(
      `http://localhost:8000/updateTask/${taskToEdit}/${updatedTaskName}/${updatedTaskDescription}`
    );
    getTasks();
  }

  async function deleteTask(taskId) {
    const response = await axios.post(`http://localhost:8000/deleteTask/${taskId}`);
    getTasks();
  }

  return (
    <div className="container">
      <h1>To Do:</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Task</th>
              <th>Description</th>
              <th>Date Added</th>
              <th>Date Completed</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              return (
                <tr key={task.id}>
                  <td>
                    <input type="checkbox" checked={task.completed} onChange={(e) => completeTask(task.id)} />
                  </td>
                  <td>{task.task_name}</td>
                  <td>{task.description}</td>
                  <td>{task.date_added}</td>
                  <td>{task.date_completed}</td>
                  <td>
                    <button onClick={() => editTask(task)}>Edit</button>
                  </td>
                  <td>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingTask ? (
        <form onSubmit={updateTask}>
            <input type="text" defaultValue={updatedTaskName} onChange={(e) => setUpdatedTaskName(e.target.value)} />
            <input
              type="text"
              defaultValue={updatedTaskDescription}
              onChange={(e) => setUpdatedTaskDescription(e.target.value)}
            />
          <button type="submit">Save Task</button>
          <button onClick={() => setEditingTask(false)}>Cancel</button>
        </form>
      ) : (
        <></>
      )}
      {addingTask ? (
        <form onSubmit={newTask}>
            <input type="text" placeHolder="Task Name" onChange={(e) => setNewTaskName(e.target.value)} />
            <input type="text" placeHolder="Description" onChange={(e) => setNewTaskDescription(e.target.value)} />
          <button type="submit">Add Task</button>
          <button onClick={() => setAddingTask(false)}>Cancel</button>
        </form>
      ) : (
        <div className="button-group">
          <button
            className="new-task-button"
            onClick={() => {
              setAddingTask(true);
              setEditingTask(false);
            }}
          >
            New Task
          </button>
        </div>
      )}
    </div>
  );
}
