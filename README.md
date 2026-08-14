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
```

---

## Before You Start (Things You Need Installed)

You only need to install these once on your computer. If you already have them, skip ahead.

1. **Node.js** (this lets you run JavaScript on your computer)
   - Download from: https://nodejs.org (choose the LTS version)
   - To check if it's installed, open a terminal/command prompt and type:
```bash
     node -v
```
     If it shows a version number (like `v20.11.0`), you're good.

2. **PostgreSQL** (this is the database that stores the tasks)
   - Download from: https://www.postgresql.org/download/
   - During installation, it will ask you to set a **password** for the default `postgres` user — remember this password, you'll need it later.
   - To check if it's installed, type:
```bash
     psql --version
```

3. **Git** (optional, only needed if you're cloning from GitHub)
   - Download from: https://git-scm.com/downloads

4. A code editor like **VS Code** (optional but helpful) — https://code.visualstudio.com

---

## Step-by-Step Setup

### Step 1: Get the project on your computer

If you have the project as a ZIP file, extract it anywhere on your computer.

If you're cloning from GitHub:
```bash
git clone https://github.com/Nabila5009/TaskFlow-Assignment.git
cd TaskFlow-Assignment
```

### Step 2: Open two terminals

You will need **two terminal windows** open at the same time — one for the backend, one for the frontend. Keep both open throughout.

---

### Step 3: Set up the database

1. Open a terminal and log into PostgreSQL:
```bash
   psql -U postgres
```
   Enter the password you set during installation.

2. Create a new database for this project:
```sql
   CREATE DATABASE taskflow;
```

3. Exit psql:
```sql
   \q
```

4. Now load the table structure into your new database. From the project's `backend` folder, run:
```bash
   psql -U postgres -d taskflow -f schema.sql
```

5. (Optional) If you want some sample tasks already filled in, run:
```bash
   psql -U postgres -d taskflow -f seed.sql
```

---

### Step 4: Set up the Backend

1. In your **first terminal**, go into the backend folder:
```bash
   cd backend
```

2. Install all required packages:
```bash
   npm install
```

3. Create a file named `.env` inside the `backend` folder, and add your database details. Example:
```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=taskflow
```
   Replace `your_postgres_password` with the password you set earlier.

4. Start the backend server:
```bash
   npm start
```
   If everything works, you should see something like:

Server running on port 5000

   Keep this terminal running — don't close it.

---

### Step 5: Set up the Frontend

1. In your **second terminal**, go into the frontend folder:
```bash
   cd frontend
```

2. Install all required packages:
```bash
   npm install
```

3. Start the frontend:
```bash
   npm run dev
```

4. It will show a local link in the terminal, usually:

http://localhost:5173

   Open this link in your browser (Chrome/Edge/Firefox) to see the TaskFlow board.

---

### Step 6: You're done! 🎉

You should now see the TaskFlow Kanban board in your browser, and you can:
- Add a new task
- Edit or delete a task
- Drag tasks between columns
- Filter tasks by priority

---

## Running Backend Tests

To run the automated backend tests, go to the `backend` folder in a terminal and run:
```bash
npm test
```

---

## Troubleshooting

| Problem | Likely Fix |
|---|---|
| `npm install` fails | Make sure Node.js is installed correctly (`node -v` should work) |
| Backend crashes / can't connect to DB | Double-check your `.env` file — especially password, port, and database name |
| Frontend loads but shows no tasks | Make sure the backend server is running in the other terminal |
| `psql` command not found | PostgreSQL isn't added to your system PATH — reinstall and check "Add to PATH" option, or search "add psql to path" for your OS |
| Port already in use | Change the `PORT` value in `.env` to something else, like `5001` |

---

## Notes

- Both the backend (`npm start`) and frontend (`npm run dev`) need to be running **at the same time** for the app to work.
- Never share your `.env` file publicly — it contains your database password.
