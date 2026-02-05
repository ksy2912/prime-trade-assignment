# Full-stack assignment: Node.js/Express backend + vanilla JS frontend.


## UI snapshots

<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/11d86c7b-7174-4d8c-85ae-ed89781a6a58" />


## Backend (Node.js / Express / MongoDB)

- **Tech stack**: Express, MongoDB (Mongoose), JWT, bcrypt, express-validator, Swagger.
- **Main features**:
  - **User registration & login** with **hashed passwords** and **JWT authentication**
  - **Role-based access** (`user` vs `admin`) – first registered user becomes **admin**
  - **Versioned REST API** under `"/api/v1"` (auth + task CRUD)
  - **Task CRUD** with owner scoping and an admin-only endpoint to view all tasks
  - **Centralized error handling**, validation, and basic logging
  - **Swagger API docs** available at `http://localhost:4000/api-docs`

### Run with Docker (recommended for demo)

- Prerequisite: **Docker Desktop** installed and running.
- From the project root (`prime trade` folder):

  ```bash
  docker compose up --build
  ```

- This will start:
  - `mongo` container (MongoDB)
  - `api` container (backend on `http://localhost:4000`)

You can then use the **frontend** (see below) or hit the API/Swagger directly from your host:
- Swagger: `http://localhost:4000/api-docs`
- Health: `http://localhost:4000/health`

### How to run the backend

- **Prerequisites**: Node.js (LTS), MongoDB running locally on `mongodb://localhost:27017`
- In a terminal:
  - `cd backend`
  - Optionally create a `.env` file with:
    - `PORT=4000`
    - `MONGO_URI=mongodb://localhost:27017/prime_trade_assignment`
    - `JWT_SECRET=your_secret_here`
  - Install dependencies: `npm install`
  - Start dev server: `npm run dev`
- Visit:
  - **Health check**: `http://localhost:4000/health`
  - **Swagger docs**: `http://localhost:4000/api-docs`

## Frontend (Vanilla JS)

- Simple static frontend in the `frontend` folder that talks to the backend APIs:
  - **Register** and **log in** users
  - Stores JWT in **`localStorage`** and attaches it as `Authorization: Bearer <token>`
  - Shows a basic **dashboard** with:
    - Current user info
    - List of **tasks** (for logged-in user)
    - Form to **create**, **update status**, and **delete** tasks
  - Displays **success/error messages** from API responses

### How to run the frontend

- Easiest options:
  - Open `frontend/index.html` directly in the browser, or
  - Use a simple static server / VS Code Live Server and serve the `frontend` folder
- Make sure the **backend is running on `http://localhost:4000`** before testing.

## Short Scalability Note

- **Horizontal scaling**:
  - The API is stateless (JWT-based auth), so multiple backend instances can run behind a **load balancer**.
- **Database & caching**:
  - MongoDB can be scaled with **replica sets** and **sharding** for read/write-heavy workloads.
  - Frequently accessed data (e.g., user profile, task lists) can be cached in **Redis** to reduce DB load.
- **Modular structure**:
  - The current folder structure (`models`, `controllers`, `routes`, `middleware`, `config`) allows adding new modules (e.g., products, notes) without impacting existing ones.
- **Observability & deployment**:
  - Can be containerized with **Docker** and deployed to services like AWS ECS/Kubernetes, with centralized logging and monitoring (e.g., CloudWatch / ELK / Prometheus + Grafana).

