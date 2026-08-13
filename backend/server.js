const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 5002;

// ==========================
// Middleware
// ==========================

app.use(cors());
app.use(express.json());

// ==========================
// Test Route
// ==========================

app.get("/", (req, res) => {
    res.send("TaskFlow backend is running!");
});

// ==========================
// Database Test Route
// ==========================

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// ==========================
// Get All Tasks
// ==========================

// ==========================
// Get Tasks
// Optional Priority Filter
// ==========================

app.get("/tasks", async (req, res) => {
    try {
        const { priority } = req.query;

        const allowedPriorities = ["Low", "Medium", "High"];

        // Validate priority if provided
        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Priority must be Low, Medium, or High"
            });
        }

        let query = `
            SELECT
                tasks.id,
                tasks.title,
                tasks.description,
                tasks.priority,
                tasks.created_at,
                columns.id AS column_id,
                columns.name AS column_name
            FROM tasks
            JOIN columns
                ON tasks.column_id = columns.id
        `;

        const values = [];

        // Add priority filter
        if (priority) {
            query += ` WHERE tasks.priority = $1`;
            values.push(priority);
        }

        query += ` ORDER BY tasks.created_at DESC`;

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching tasks:", error);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// ==========================
// Get Board with Columns
// and Tasks
// ==========================

app.get("/boards/:id", async (req, res) => {
    try {
        const boardId = req.params.id;

        // Get board
        const boardResult = await pool.query(
            `
            SELECT id, name, created_at
            FROM boards
            WHERE id = $1
            `,
            [boardId]
        );

        // Check if board exists
        if (boardResult.rows.length === 0) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        // Get columns and tasks
        const columnsResult = await pool.query(
            `
            SELECT
                c.id AS column_id,
                c.name AS column_name,
                c.position,
                t.id AS task_id,
                t.title,
                t.description,
                t.priority,
                t.created_at
            FROM columns c
            LEFT JOIN tasks t
                ON c.id = t.column_id
            WHERE c.board_id = $1
            ORDER BY c.position, t.created_at DESC
            `,
            [boardId]
        );

        const board = boardResult.rows[0];

        const columns = [];

        for (const row of columnsResult.rows) {
            let column = columns.find(
                (item) => item.id === row.column_id
            );

            if (!column) {
                column = {
                    id: row.column_id,
                    name: row.column_name,
                    position: row.position,
                    tasks: []
                };

                columns.push(column);
            }

            if (row.task_id !== null) {
                column.tasks.push({
                    id: row.task_id,
                    title: row.title,
                    description: row.description,
                    priority: row.priority,
                    created_at: row.created_at
                });
            }
        }

        res.json({
            id: board.id,
            name: board.name,
            created_at: board.created_at,
            columns: columns
        });

    } catch (error) {
        console.error("Error fetching board:", error);

        res.status(500).json({
            message: "Failed to fetch board"
        });
    }
});

// ==========================
// Create New Task
// ==========================

app.post("/tasks", async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            column_id
        } = req.body;

        // Validate title
        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // Validate column
        if (!column_id) {
            return res.status(400).json({
                message: "Column is required"
            });
        }

        // Validate priority
        const allowedPriorities = ["Low", "Medium", "High"];

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Priority must be Low, Medium, or High"
            });
        }

        // Check whether column exists
        const columnResult = await pool.query(
            `
            SELECT id
            FROM columns
            WHERE id = $1
            `,
            [column_id]
        );

        if (columnResult.rows.length === 0) {
            return res.status(404).json({
                message: "Column not found"
            });
        }

        // Insert task
        const result = await pool.query(
            `
            INSERT INTO tasks
                (column_id, title, description, priority)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                column_id,
                title,
                description,
                priority,
                created_at
            `,
            [
                column_id,
                title.trim(),
                description || null,
                priority || "Medium"
            ]
        );

        res.status(201).json({
            message: "Task created successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating task:", error);

        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

// ==========================
// Update Task
// ==========================

app.put("/tasks/:id", async (req, res) => {
    try {
        const taskId = req.params.id;

        const {
            title,
            description,
            priority,
            column_id
        } = req.body;

        // Validate title
        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // Validate priority
        const allowedPriorities = ["Low", "Medium", "High"];

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Priority must be Low, Medium, or High"
            });
        }

        // Check column
        if (!column_id) {
            return res.status(400).json({
                message: "Column is required"
            });
        }

        const columnResult = await pool.query(
            `
            SELECT id
            FROM columns
            WHERE id = $1
            `,
            [column_id]
        );

        if (columnResult.rows.length === 0) {
            return res.status(404).json({
                message: "Column not found"
            });
        }

        // Update task
        const result = await pool.query(
            `
            UPDATE tasks
            SET
                title = $1,
                description = $2,
                priority = $3,
                column_id = $4
            WHERE id = $5
            RETURNING
                id,
                column_id,
                title,
                description,
                priority,
                created_at
            `,
            [
                title.trim(),
                description || null,
                priority || "Medium",
                column_id,
                taskId
            ]
        );

        // Check task exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating task:", error);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
});
// ==========================
// Delete Task
// ==========================

app.delete("/tasks/:id", async (req, res) => {
    try {
        const taskId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING id, title
            `,
            [taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting task:", error);

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

// ==========================
// Task Count Per Column
// ==========================

app.get("/boards/:id/task-count", async (req, res) => {
    try {
        const boardId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                c.id AS column_id,
                c.name AS column_name,
                COUNT(t.id) AS task_count
            FROM columns c
            LEFT JOIN tasks t
                ON c.id = t.column_id
            WHERE c.board_id = $1
            GROUP BY
                c.id,
                c.name
            ORDER BY c.position
            `,
            [boardId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error getting task counts:", error);

        res.status(500).json({
            message: "Failed to get task counts"
        });
    }
});
// ==========================
// Get Tasks by Priority
// Newest First
// ==========================

app.get("/tasks/priority/:priority", async (req, res) => {
    try {
        const priority = req.params.priority;

        const allowedPriorities = ["Low", "Medium", "High"];

        if (!allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Priority must be Low, Medium, or High"
            });
        }

        const result = await pool.query(
            `
            SELECT
                tasks.id,
                tasks.title,
                tasks.description,
                tasks.priority,
                tasks.created_at,
                columns.id AS column_id,
                columns.name AS column_name
            FROM tasks
            JOIN columns
                ON tasks.column_id = columns.id
            WHERE tasks.priority = $1
            ORDER BY tasks.created_at DESC
            `,
            [priority]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching priority tasks:", error);

        res.status(500).json({
            message: "Failed to fetch priority tasks"
        });
    }
});

// ==========================
// Start Server
// ==========================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;