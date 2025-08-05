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
 *    description?: string;
 *    categories?: string[]; // tags/categories for organization
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
// Default categories. In a full app, these could be user-editable.
const DEFAULT_CATEGORIES = [
  "Work", "Personal", "Errands", "Shopping", "Urgent"
];

// PUBLIC_INTERFACE
function App() {
  // Application state for tasks and UI
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(""); // For filtering by selected category/tag
  const [inputValue, setInputValue] = useState("");
  const [inputDescription, setInputDescription] = useState(""); // Description for new task
  const [inputCategories, setInputCategories] = useState([]); // Categories for new task
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingDescription, setEditingDescription] = useState(""); // Description when editing
  const [editingCategories, setEditingCategories] = useState([]); // Categories when editing
  const inputRef = useRef(null);

  // Focus new task input after editing
  useEffect(() => {
    if (!editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  // PUBLIC_INTERFACE
  function filteredTasks() {
    let list = tasks;
    // Filter by status (active/completed/all)
    switch (filter) {
      case "active":
        list = list.filter((t) => !t.completed);
        break;
      case "completed":
        list = list.filter((t) => t.completed);
        break;
      case "all":
      default:
        // no filtering
        break;
    }
    // If category/tag filter is set, further filter by that tag
    if (categoryFilter) {
      list = list.filter(
        t => Array.isArray(t.categories) && t.categories.includes(categoryFilter)
      );
    }
    return list;
  }

  // PUBLIC_INTERFACE
  function handleInputChange(e) {
    setInputValue(e.target.value);
  }
  function handleInputDescriptionChange(e) {
    setInputDescription(e.target.value);
  }
  function handleInputCategoriesChange(e) {
    const value = e.target.value;
    if (inputCategories.includes(value)) {
      setInputCategories(inputCategories.filter(cat => cat !== value));
    } else {
      setInputCategories([...inputCategories, value]);
    }
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
        completed: false,
        description: inputDescription.trim(),
        categories: [...inputCategories]
      },
      ...tasks
    ]);
    setInputValue("");
    setInputDescription("");
    setInputCategories([]);
  }

  // PUBLIC_INTERFACE
  function handleEditTask(id, text) {
    const task = tasks.find(t => t.id === id);
    setEditingId(id);
    setEditingValue(text);
    setEditingDescription(task?.description || "");
    setEditingCategories(task?.categories ? [...task.categories] : []);
  }

  // PUBLIC_INTERFACE
  function handleEditingChange(e) {
    setEditingValue(e.target.value);
  }
  function handleEditingDescriptionChange(e) {
    setEditingDescription(e.target.value);
  }
  function handleEditingCategoriesChange(e) {
    const value = e.target.value;
    if (editingCategories.includes(value)) {
      setEditingCategories(editingCategories.filter(cat => cat !== value));
    } else {
      setEditingCategories([...editingCategories, value]);
    }
  }
  // PUBLIC_INTERFACE
  function handleEditingSubmit(e, id) {
    e.preventDefault();
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            text: editingValue.trim() || task.text,
            description: editingDescription,
            categories: [...editingCategories]
          }
        : task
    ));
    setEditingId(null);
    setEditingValue("");
    setEditingDescription("");
    setEditingCategories([]);
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
      setEditingDescription("");
      setEditingCategories([]);
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
  function handleCategoryFilterChange(cat) {
    setCategoryFilter(c => c === cat ? "" : cat);
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
          description={inputDescription}
          onDescriptionChange={handleInputDescriptionChange}
          categories={inputCategories}
          onCategoriesChange={handleInputCategoriesChange}
          categoryOptions={DEFAULT_CATEGORIES}
        />
        <CategoryFilters
          categories={DEFAULT_CATEGORIES}
          current={categoryFilter}
          onChange={handleCategoryFilterChange}
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
          editingDescription={editingDescription}
          onEditingDescriptionChange={handleEditingDescriptionChange}
          editingCategories={editingCategories}
          onEditingCategoriesChange={handleEditingCategoriesChange}
          categoryOptions={DEFAULT_CATEGORIES}
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

/**
 * PUBLIC_INTERFACE
 * Filter bar for selecting a category/tag for task filtering.
 */
function CategoryFilters({ categories, current, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.97rem', paddingRight: 7 }}>Tags:</span>
      {categories.map(cat => (
        <button
          key={cat}
          className="todo-filter-btn"
          type="button"
          onClick={() => onChange(cat)}
          style={{
            background: current === cat ? "rgba(25, 118, 210, 0.08)" : "transparent",
            color: current === cat ? "var(--primary)" : "#444",
            borderColor: current === cat ? "var(--primary)" : "#ddd",
            fontWeight: 500
          }}
          aria-pressed={current === cat}
        >
          {cat}
        </button>
      ))}
      {current && (
        <button type="button" onClick={() => onChange(current)} className="todo-filter-btn" style={{ color: '#fff', background: 'var(--accent)' }}>
          Clear tag
        </button>
      )}
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

/**
 * PUBLIC_INTERFACE
 * Task input bar: text, description, categories selection, and submit.
 */
function TaskInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  description,
  onDescriptionChange,
  categories,
  onCategoriesChange,
  categoryOptions
}) {
  return (
    <form className="todo-input-form" onSubmit={onSubmit} autoComplete="off" style={{ flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="What's next?"
          className="todo-input"
          value={value}
          onChange={onChange}
          ref={inputRef}
          aria-label="Add new task"
          maxLength={80}
          style={{ minWidth: 0, flex: 2 }}
        />
        <button
          type="submit"
          className="todo-btn"
          style={{ backgroundColor: COLOR_PRIMARY, marginTop: 0 }}
          disabled={!value.trim()}
          aria-label="Add task"
        >
          Add
        </button>
      </div>
      <input
        type="text"
        placeholder="Add detailed description (optional)"
        className="todo-input"
        value={description}
        onChange={onDescriptionChange}
        maxLength={180}
        aria-label="Task description"
        style={{ marginTop: 4, minWidth: 0 }}
      />
      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.96em" }}>Tags:</span>
        {categoryOptions.map(cat => (
          <label key={cat} style={{ fontSize: "0.97em", userSelect: "none" }}>
            <input
              type="checkbox"
              value={cat}
              checked={categories.includes(cat)}
              onChange={onCategoriesChange}
              style={{ marginRight: 3 }}
            />
            {cat}
          </label>
        ))}
      </div>
    </form>
  );
}

/**
 * PUBLIC_INTERFACE
 * Task list component supporting description/tag display and edit.
 */
function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggle,
  editingId,
  editingValue,
  onEditingChange,
  onEditingSubmit,
  editingDescription,
  onEditingDescriptionChange,
  editingCategories,
  onEditingCategoriesChange,
  categoryOptions,
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
              style={{ flexDirection: "column", gap: 6, flex: 1 }}
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
                style={{ marginBottom: 3 }}
                placeholder="Edit task"
              />
              <input
                className="todo-edit-input"
                type="text"
                value={editingDescription}
                onChange={onEditingDescriptionChange}
                maxLength={180}
                aria-label="Edit description"
                placeholder="Edit description"
                style={{ marginBottom: 3 }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: "0.97em" }}>
                <span style={{ color: "var(--text-secondary)" }}>Tags:</span>
                {categoryOptions.map(cat => (
                  <label key={cat}>
                    <input
                      type="checkbox"
                      value={cat}
                      checked={editingCategories.includes(cat)}
                      onChange={onEditingCategoriesChange}
                      style={{ marginRight: 3 }}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </form>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span
                className="todo-text"
                onDoubleClick={() => onEdit(task.id, task.text)}
                tabIndex={0}
                aria-label={`Task: ${task.text}`}
                style={{ fontWeight: 500, marginBottom: 2, minWidth: 0, wordBreak: 'break-word' }}
              >
                {task.text}
              </span>
              {task.description && (
                <span
                  style={{
                    fontSize: "1em",
                    color: "var(--text-secondary)",
                    paddingLeft: 1,
                    paddingBottom: 1,
                  }}
                  aria-label={`Description: ${task.description}`}
                >
                  {task.description}
                </span>
              )}
              {!!(Array.isArray(task.categories) && task.categories.length) && (
                <div style={{ fontSize: "0.95em", color: "var(--primary)", display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                  {task.categories.map(cat => (
                    <span key={cat} style={{
                      background: "rgba(25,118,210,0.08)",
                      color: "var(--primary)",
                      borderRadius: 5,
                      padding: "1px 9px",
                      border: "1px solid var(--primary)",
                      fontSize: "0.9em",
                      marginRight: 3
                    }}>{cat}</span>
                  ))}
                </div>
              )}
            </div>
          )}
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
