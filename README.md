# 📚 LibraryHub — 3-Tier Book Library Application

A full-stack book library management application built with a **3-tier architecture**, fully containerized using Docker.

---

## 📖 Project Overview

LibraryHub is a **3-tier containerized web application** that lets users manage their personal book collection. The application follows industry-standard architecture patterns with clear separation of concerns across three independent services — a React frontend, a Node.js backend API, and a PostgreSQL database — all orchestrated with Docker Compose.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, Tailwind CSS | Interactive UI for managing books |
| Web Server | Nginx (Alpine) | Serves the production-built React app |
| Backend | Node.js 22, Express.js | REST API with CRUD operations |
| Database | PostgreSQL 17 (Alpine) | Persistent relational data storage |
| Containerization | Docker, Docker Compose | Multi-container orchestration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network (mynet)                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │  │   Database   │   │
│  │              │  │              │  │              │   │
│  │  React +     │  │  Express +   │  │  PostgreSQL  │   │
│  │  Nginx       │──│  Node.js     │──│  17-alpine   │   │
│  │              │  │              │  │              │   │
│  │  Port: 8080  │  │  Port: 5000  │  │  Port: 5432  │   │
│  └──────────────┘  └──────────────┘  └──────┬───────┘   │
│                                             │           │
│                                      ┌──────┴───────┐   │
│                                      │   dbdata     │   │
│                                      │   (Volume)   │   │
│                                      └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Flow:** Browser → `localhost:8080` (Nginx/React) → `localhost:5000` (Express API) → `db:5432` (PostgreSQL)

---

## 📂 Project Structure

```
3_tier_app/
├── docker-compose.yaml          # Orchestrates all 3 services
├── README.md
├── frontend/
│   ├── Dockerfile               # Multi-stage build: React → Nginx
│   ├── .dockerignore
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Neobrutalist styles (Tailwind)
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── Dockerfile               # Node.js Alpine build
│   ├── .dockerignore
│   ├── src/
│   │   ├── index.js             # Express server + API routes
│   │   └── db.js                # PostgreSQL connection pool
│   └── package.json
└── database/
    └── init.sql                 # Table creation + seed data
```

---

## 🐳 Docker Images

| Service | Image | Link |
|---------|-------|------|
| Frontend | `hrishav798/book-library-frontend` | [DockerHub](https://hub.docker.com/r/hrishav798/book-library-frontend) |
| Backend | `hrishav798/book-library-backend` | [DockerHub](https://hub.docker.com/r/hrishav798/book-library-backend) |
| Database | `postgres:17.0-alpine` (Official) | [DockerHub](https://hub.docker.com/_/postgres) |

---

## ✨ Features of Docker Usage

- **Multi-stage Build (Frontend):** The frontend Dockerfile uses a two-stage build — Stage 1 builds the React app with Node.js, Stage 2 copies only the compiled output into a lightweight Nginx image. This keeps the final image small and production-ready.
- **Alpine Images:** Both Node.js (`node:22-alpine`) and PostgreSQL (`postgres:17.0-alpine`) use Alpine-based images, reducing image size significantly (~50MB vs ~350MB).
- **Named Volumes:** Database data is stored in a Docker-managed named volume (`dbdata`), ensuring data persists across container restarts.
- **Custom Bridge Network:** All services communicate over a user-defined bridge network (`mynet`), enabling service-name-based DNS resolution (e.g., backend connects to `db:5432`).
- **Health Checks:** The database service includes a health check (`pg_isready`) so the backend only starts after PostgreSQL is fully ready to accept connections.
- **Dependency Management:** `depends_on` with `condition: service_healthy` ensures proper startup order: Database → Backend → Frontend.
- **`.dockerignore` Files:** Both frontend and backend exclude `node_modules` from the build context, preventing unnecessary files from being copied into the image.

---

## 🔧 Docker Compose Services

### 1. Frontend (`frontend`)
| Property | Value | Description |
|----------|-------|-------------|
| `build` | `./frontend` | Builds from `frontend/Dockerfile` |
| `container_name` | `frontend` | Fixed container name |
| `ports` | `8080:80` | Maps host port 8080 to Nginx port 80 |
| `depends_on` | `backend` | Starts after the backend is running |
| `networks` | `mynet` | Connected to the shared network |

### 2. Database (`db`)
| Property | Value | Description |
|----------|-------|-------------|
| `image` | `postgres:17.0-alpine` | Official PostgreSQL image |
| `container_name` | `db` | Fixed container name |
| `environment` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Database credentials |
| `ports` | `5432:5432` | Maps host port to PostgreSQL port |
| `volumes` | `dbdata` + `init.sql` | Persistent storage + seed script |
| `healthcheck` | `pg_isready -U postgres` | Verifies database readiness |
| `networks` | `mynet` | Connected to the shared network |

### 3. Backend (`backend`)
| Property | Value | Description |
|----------|-------|-------------|
| `build` | `./backend` | Builds from `backend/Dockerfile` |
| `container_name` | `backend` | Fixed container name |
| `environment` | `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` | Database connection config |
| `ports` | `5000:5000` | Maps host port to Express port |
| `depends_on` | `db` (condition: service_healthy) | Waits until database is ready |
| `networks` | `mynet` | Connected to the shared network |

---

## 🌐 Environment Variables

### Database Service (`db`)

| Variable | Value | Description |
|----------|-------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL superuser name |
| `POSTGRES_DB` | `librarydb` | Database created on first startup |

### Backend Service (`backend`)

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `5000` | Express server listening port |
| `DB_USER` | `postgres` | Must match `POSTGRES_USER` |
| `DB_HOST` | `db` | Service name of the database container |
| `DB_NAME` | `librarydb` | Must match `POSTGRES_DB` |
| `DB_PASSWORD` | `Secret123` | Must match `POSTGRES_PASSWORD` |
| `DB_PORT` | `5432` | PostgreSQL default port |

---

## 🚀 Run the Application

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hrishav798/3_tier_app.git
   cd 3_tier_app
   ```

2. **Build and start all services**
   ```bash
   docker compose up --build -d
   ```

3. **Verify containers are running**
   ```bash
   docker compose ps
   ```

4. **Access the application**

   | Service | URL |
   |---------|-----|
   | Frontend (React UI) | [http://localhost:8080](http://localhost:8080) |
   | Backend API | [http://localhost:5000/api/books](http://localhost:5000/api/books) |
   | Health Check | [http://localhost:5000/health](http://localhost:5000/health) |

5. **Stop all services**
   ```bash
   docker compose down
   ```

6. **Stop and remove all data (volumes)**
   ```bash
   docker compose down -v
   ```

### Screenshot

<img width="1915" height="1080" alt="Screenshot from 2026-07-16 18-18-14" src="https://github.com/user-attachments/assets/1e86d1f9-a2f6-4729-99f5-5e68c70e9522" />

