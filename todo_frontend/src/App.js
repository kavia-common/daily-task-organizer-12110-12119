import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * Color theme and styles for a minimalistic, modern todo app.
 * Uses: primary (#1976d2), secondary (#424242), accent (#ff9800).
 */

/**
 * Task data structure:
 * {
 *    id: string;
 *    text: string;
 *    completed: boolean;
 * }
 */

const COLOR_PRIMARY = "#1976d2";
const COLOR_SECONDARY = "#424242";
const COLOR_ACCENT = "#ff9800";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" }
];

// PUBLIC_INTERFACE
function App() {
  // Application state for tasks and UI
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);

  // Focus new task input after editing
  useEffect(() => {
    if (!editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  // PUBLIC_INTERFACE
  function filteredTasks() {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      case "all":
      default:
        return tasks;
    }
  }

  // PUBLIC_INTERFACE
  function handleInputChange(e) {
    setInputValue(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleAddTask(e) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    setTasks([
      {
        id: Date.now().toString(),
        text,
        completed: false
      },
      ...tasks
    ]);
    setInputValue("");
  }

  // PUBLIC_INTERFACE
  function handleEditTask(id, text) {
    setEditingId(id);
    setEditingValue(text);
  }

  // PUBLIC_INTERFACE
  function handleEditingChange(e) {
    setEditingValue(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleEditingSubmit(e, id) {
    e.preventDefault();
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, text: editingValue.trim() || task.text }
        : task
    ));
    setEditingId(null);
    setEditingValue("");
  }

  // PUBLIC_INTERFACE
  function handleTaskComplete(id) {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  }

  // PUBLIC_INTERFACE
  function handleDeleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingValue("");
    }
  }

  // PUBLIC_INTERFACE
  function handleClearCompleted() {
    setTasks(tasks.filter(task => !task.completed));
  }

  // PUBLIC_INTERFACE
  function handleFilterChange(key) {
    setFilter(key);
  }

  // For future backend integration, use these stubs:
  // - fetchTasks, addTask, updateTask, deleteTask, etc.

  return (
    <div className="todo-root">
      <Header />
      <main className="todo-main">
        <TaskInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleAddTask}
          inputRef={inputRef}
        />
        <TaskList
          tasks={filteredTasks()}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggle={handleTaskComplete}
          editingId={editingId}
          editingValue={editingValue}
          onEditingChange={handleEditingChange}
          onEditingSubmit={handleEditingSubmit}
        />
      </main>
      <Footer
        filter={filter}
        onFilterChange={handleFilterChange}
        activeCount={tasks.filter(t => !t.completed).length}
        completedCount={tasks.filter(t => t.completed).length}
        onClearCompleted={handleClearCompleted}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function Header() {
  return (
    <header className="todo-header" role="banner">
      <h1 className="todo-title">Todo List</h1>
    </header>
  );
}

// PUBLIC_INTERFACE
function TaskInput({ value, onChange, onSubmit, inputRef }) {
  return (
    <form className="todo-input-form" onSubmit={onSubmit} autoComplete="off">
      <input
        type="text"
        placeholder="What's next?"
        className="todo-input"
        value={value}
        onChange={onChange}
        ref={inputRef}
        aria-label="Add new task"
        maxLength={80}
      />
      <button
        type="submit"
        className="todo-btn"
        style={{ backgroundColor: COLOR_PRIMARY }}
        disabled={!value.trim()}
        aria-label="Add task"
      >
        Add
      </button>
    </form>
  );
}

// PUBLIC_INTERFACE
function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggle,
  editingId,
  editingValue,
  onEditingChange,
  onEditingSubmit
}) {
  if (tasks.length === 0) {
    return <div className="todo-empty">No tasks</div>;
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`todo-item${task.completed ? " completed" : ""}`}
        >
          <span className="todo-checkbox">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              aria-label={
                task.completed ? "Mark as active" : "Mark as completed"
              }
            />
          </span>
          {editingId === task.id ? (
            <form
              className="todo-edit-form"
              onSubmit={e => onEditingSubmit(e, task.id)}
            >
              <input
                className="todo-edit-input"
                type="text"
                value={editingValue}
                onChange={onEditingChange}
                maxLength={80}
                autoFocus
                onBlur={e => onEditingSubmit(e, task.id)}
                aria-label="Edit task"
              />
            </form>
          ) : (
            <>
              <span
                className="todo-text"
                onDoubleClick={() => onEdit(task.id, task.text)}
                tabIndex={0}
                aria-label={`Task: ${task.text}`}
              >
                {task.text}
              </span>
              <div className="todo-actions">
                <button
                  className="todo-act-btn"
                  style={{ color: COLOR_ACCENT }}
                  onClick={() => onEdit(task.id, task.text)}
                  aria-label="Edit"
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  className="todo-act-btn"
                  style={{ color: COLOR_SECONDARY }}
                  onClick={() => onDelete(task.id)}
                  aria-label="Delete"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

// PUBLIC_INTERFACE
function Footer({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted
}) {
  return (
    <footer className="todo-footer">
      <div className="todo-filter-group" role="group" aria-label="Task filter">
        {FILTERS.map((f) => (
          <button
            className={`todo-filter-btn${filter === f.key ? " active" : ""}`}
            key={f.key}
            style={{
              color: filter === f.key ? COLOR_PRIMARY : "#444",
              borderColor: filter === f.key ? COLOR_PRIMARY : "#ddd"
            }}
            onClick={() => onFilterChange(f.key)}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="todo-counts">
        <span>
          {activeCount} active | {completedCount} completed
        </span>
        {completedCount > 0 && (
          <button
            className="todo-clear-btn"
            onClick={onClearCompleted}
            style={{
              color: "#fff",
              backgroundColor: COLOR_ACCENT,
              marginLeft: "1em"
            }}
          >
            Clear completed
          </button>
        )}
      </div>
    </footer>
  );
}

export default App;
