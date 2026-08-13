import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5002";

function App() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================
  // Create / Edit Form
  // ==========================

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    column_id: 1
  });

  // ==========================
  // Priority Filter
  // ==========================

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [filteredColumns, setFilteredColumns] =
    useState([]);

  // ==========================
  // Get Board
  // ==========================

  const getBoard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/boards/1`
      );

      setBoard(response.data);

    } catch (error) {
      console.error(
        "Error fetching board:",
        error
      );

      setError(
        "Unable to load TaskFlow board. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Get Tasks By Priority
  // ==========================

  const getTasksByPriority = async (
    priority
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/tasks?priority=${priority}`
      );

      return response.data;

    } catch (error) {
      console.error(
        "Error fetching filtered tasks:",
        error
      );

      throw error;
    }
  };

  // ==========================
  // Apply Priority Filter
  // ==========================

  useEffect(() => {
    const loadFilteredTasks = async () => {
      if (!board) {
        return;
      }

      // Show all tasks
      if (priorityFilter === "All") {
        setFilteredColumns(board.columns);
        return;
      }

      try {
        const filteredTasks =
          await getTasksByPriority(
            priorityFilter
          );

        const updatedColumns =
          board.columns.map((column) => ({
            ...column,

            tasks: filteredTasks.filter(
              (task) =>
                Number(task.column_id) ===
                Number(column.id)
            )
          }));

        setFilteredColumns(
          updatedColumns
        );

      } catch (error) {
        console.error(
          "Error applying priority filter:",
          error
        );

        setFilteredColumns(
          board.columns
        );
      }
    };

    loadFilteredTasks();

  }, [priorityFilter, board]);

  // ==========================
  // Handle Form Input
  // ==========================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        name === "column_id"
          ? Number(value)
          : value
    }));
  };

  // ==========================
  // Open Create Form
  // ==========================

  const openCreateForm = () => {
    setEditingTaskId(null);

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      column_id:
        board.columns[0]?.id || 1
    });

    setShowForm(true);
  };

  // ==========================
  // Open Edit Form
  // ==========================

  const openEditForm = (
    task,
    columnId
  ) => {
    setEditingTaskId(task.id);

    setFormData({
      title: task.title,
      description:
        task.description || "",
      priority: task.priority,
      column_id: columnId
    });

    setShowForm(true);
  };

  // ==========================
  // Create / Update Task
  // ==========================

  const saveTask = async (e) => {
    e.preventDefault();

    try {
      if (editingTaskId) {

        await axios.put(
          `${API_URL}/tasks/${editingTaskId}`,
          formData
        );

      } else {

        await axios.post(
          `${API_URL}/tasks`,
          formData
        );
      }

      // Reset form

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        column_id:
          board.columns[0]?.id || 1
      });

      setEditingTaskId(null);
      setShowForm(false);

      // Refresh board

      await getBoard();

    } catch (error) {
      console.error(
        "Error saving task:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to save task"
      );
    }
  };

  // ==========================
  // Delete Task
  // ==========================

  const deleteTask = async (
    taskId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/tasks/${taskId}`
      );

      await getBoard();

    } catch (error) {

      console.error(
        "Error deleting task:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete task"
      );
    }
  };

  // ==========================
  // Start Drag
  // ==========================

  const handleDragStart = (
    e,
    task,
    columnId
  ) => {

    const draggedTask = {
      id: task.id,
      title: task.title,
      description:
        task.description || "",
      priority: task.priority,
      column_id: columnId
    };

    e.dataTransfer.setData(
      "task",
      JSON.stringify(draggedTask)
    );

    e.dataTransfer.effectAllowed =
      "move";
  };

  // ==========================
  // Drop Task
  // ==========================

  const handleDrop = async (
    e,
    newColumnId
  ) => {

    e.preventDefault();

    const taskData =
      e.dataTransfer.getData(
        "task"
      );

    if (!taskData) {
      return;
    }

    const task =
      JSON.parse(taskData);

    // Same column
    if (
      Number(task.column_id) ===
      Number(newColumnId)
    ) {
      return;
    }

    try {

      await axios.put(
        `${API_URL}/tasks/${task.id}`,
        {
          title: task.title,
          description:
            task.description,
          priority:
            task.priority,
          column_id:
            Number(newColumnId)
        }
      );

      await getBoard();

    } catch (error) {

      console.error(
        "Error moving task:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to move task"
      );
    }
  };

  // ==========================
  // Close Form
  // ==========================

  const closeForm = () => {

    setShowForm(false);
    setEditingTaskId(null);

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      column_id:
        board.columns[0]?.id || 1
    });
  };

  // ==========================
  // Load Board
  // ==========================

  useEffect(() => {
    getBoard();
  }, []);

  // ==========================
  // Loading State
  // ==========================

  if (loading) {
    return (
      <div className="status-container">
        <h2 className="status">
          Loading TaskFlow...
        </h2>

        <p>
          Please wait while we load your board.
        </p>
      </div>
    );
  }

  // ==========================
  // Error State
  // ==========================

  if (error) {
    return (
      <div className="error-container">

        <h2>
          Something went wrong
        </h2>

        <p className="error">
          {error}
        </p>

        <button
          className="create-button"
          onClick={getBoard}
        >
          Try Again
        </button>

      </div>
    );
  }

  // ==========================
  // Main UI
  // ==========================

  return (
    <div className="app">

      {/* ==========================
          Header
      ========================== */}

      <header className="header">

        <div>
          <h1>
            TaskFlow
          </h1>

          <p>
            Task management dashboard
          </p>
        </div>

        <button
          className="create-button"
          onClick={openCreateForm}
        >
          + Create Task
        </button>

      </header>


      {/* ==========================
          Main Board
      ========================== */}

      <main className="board-container">

        <h2>
          {board.name}
        </h2>


        {/* ==========================
            Priority Filter
        ========================== */}

        <div className="filter-container">

          <label
            htmlFor="priorityFilter"
          >
            Filter by Priority
          </label>

          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Priorities
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>


        {/* ==========================
            Create / Edit Form
        ========================== */}

        {showForm && (

          <div className="form-container">

            <form onSubmit={saveTask}>

              <h2>
                {editingTaskId
                  ? "Edit Task"
                  : "Create New Task"}
              </h2>


              {/* Title */}

              <label>
                Title

                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter task title"
                  required
                />
              </label>


              {/* Description */}

              <label>
                Description

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter task description"
                />
              </label>


              {/* Priority */}

              <label>
                Priority

                <select
                  name="priority"
                  value={
                    formData.priority
                  }
                  onChange={
                    handleInputChange
                  }
                >

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </label>


              {/* Column */}

              <label>
                Column

                <select
                  name="column_id"
                  value={
                    formData.column_id
                  }
                  onChange={
                    handleInputChange
                  }
                >

                  {board.columns.map(
                    (column) => (

                      <option
                        key={column.id}
                        value={column.id}
                      >
                        {column.name}
                      </option>

                    )
                  )}

                </select>

              </label>


              {/* Form Buttons */}

              <div className="form-actions">

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingTaskId
                    ? "Update Task"
                    : "Create Task"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}


        {/* ==========================
            Board
        ========================== */}

        <div className="board">

          {filteredColumns.map(
            (column) => (

              <div
                className="column"
                key={column.id}

                onDragOver={(e) =>
                  e.preventDefault()
                }

                onDrop={(e) =>
                  handleDrop(
                    e,
                    column.id
                  )
                }
              >

                {/* Column Header */}

                <div className="column-header">

                  <h3>
                    {column.name}
                  </h3>

                  <span className="task-count">
                    {column.tasks.length}
                  </span>

                </div>


                {/* ==========================
                    Tasks
                ========================== */}

                <div className="tasks">

                  {column.tasks.length ===
                  0 ? (

                    <div className="empty-state">

                      <div className="empty-icon">
                        ✓
                      </div>

                      <p>
                        No tasks here
                      </p>

                      <span>
                        This column is currently empty.
                      </span>

                    </div>

                  ) : (

                    column.tasks.map(
                      (task) => (

                        <div
                          className="task-card"
                          key={task.id}

                          draggable

                          onDragStart={(e) =>
                            handleDragStart(
                              e,
                              task,
                              column.id
                            )
                          }
                        >

                          <h4>
                            {task.title}
                          </h4>


                          {task.description && (
                            <p>
                              {
                                task.description
                              }
                            </p>
                          )}


                          <span
                            className={`priority ${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>


                          {/* Task Actions */}

                          <div className="task-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                openEditForm(
                                  task,
                                  column.id
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteTask(
                                  task.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )
          )}

        </div>

      </main>

    </div>
  );
}

export default App;