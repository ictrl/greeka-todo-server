# Greeka Todo API Server

## Features

- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Create Task**: (Name, Due Date, Status, Priority, Date of Creation, Is_Active)
- **Update Task**: (Change Status, Change Priority, Change Details)
- **Delete Task**: Delete task by id
- **List of Task**: (Including Pagination & Filter)
- **Fetch One Task**: Fetch one task by id
- **Filtering**: Pagination, status, priority, and search filters
- **Database**: Postgres
- **Swagger URL**:swagger URL to test APIs
- **Statuses(Options)**: Pending, Done, In Progress, Paused
- **Priorities(Options)**: Red (High), Yellow (Medium), Blue (Normal)
- **Export Functionality**: JSON export option


## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up PostgreSQL,
- Create a `.env` file with:
- can create a free postgres on supabase https://supabase.com
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=todo_db
DB_PASSWORD=db_password
DB_PORT=5432
```

### 3. Run Development Server
```bash
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check and database connection
- `GET /docs` - Swagger UI
- `GET /api/tasks` - List tasks with pagination & filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/tasks/export` - Export tasks
- `GET /api/swagger.json` - OpenAPI Specification