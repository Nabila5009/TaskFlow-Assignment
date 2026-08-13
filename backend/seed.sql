INSERT INTO boards (name)
VALUES ('TaskFlow Board');

INSERT INTO columns (board_id, name, position)
VALUES
    (1, 'To Do', 1),
    (1, 'In Progress', 2),
    (1, 'Done', 3);

INSERT INTO tasks (column_id, title, description, priority)
VALUES
    (
        1,
        'Create Login Page',
        'Build the login page using React',
        'High'
    ),
    (
        1,
        'Design Navbar',
        'Create a responsive navigation bar',
        'Medium'
    ),
    (
        2,
        'Build Backend API',
        'Create REST APIs using Node.js and Express',
        'High'
    ),
    (
        2,
        'Create Dashboard',
        'Build the main task dashboard',
        'Medium'
    ),
    (
        3,
        'Database Setup',
        'Create PostgreSQL database and tables',
        'Low'
    );