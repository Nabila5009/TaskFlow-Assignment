-- =========================================
-- TaskFlow Database Schema
-- =========================================

-- 1. Boards
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 2. Columns
CREATE TABLE columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,

    CONSTRAINT fk_columns_board
        FOREIGN KEY (board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE
);


-- 3. Tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_column
        FOREIGN KEY (column_id)
        REFERENCES columns(id)
        ON DELETE CASCADE,

    CONSTRAINT check_task_priority
        CHECK (priority IN ('Low', 'Medium', 'High'))
);