# TaskFlow

TaskFlow is a full-stack task management application built as an assignment project.

It provides a Kanban-style board where users can create, edit, delete, filter, and move tasks between different workflow columns.

---

## Features

- View TaskFlow board
- View tasks grouped by columns
- Create new tasks
- Edit existing tasks
- Delete tasks
- Drag and drop tasks between columns
- Filter tasks by priority
- Persistent data using PostgreSQL
- Backend REST APIs
- Server-side validation
- Error handling
- Automated backend tests
- Responsive frontend layout

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- CORS

### Testing

- Jest
- Supertest

---

## Project Structure

```text
TaskFlow Assignment/
│
├── backend/
│   ├── tests/
│   │   └── server.test.js
│   │
│   ├── db.js
│   ├── server.js
│   ├── schema.sql
│   ├── seed.sql
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
└── README.md