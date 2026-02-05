# Backend – Prime Trade Assignment

## Overview

Node.js/Express backend with:

- User **registration & login** with **password hashing** (bcrypt)
- **JWT authentication** and **role-based access** (`user` / `admin`)
- Versioned REST API under `"/api/v1"`
- CRUD for a secondary entity: **Tasks**
- Centralized **error handling** and **request validation**
- **Swagger** documentation at `/api-docs`

## Setup & Run

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in `backend` directory:

   ```bash
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/prime_trade_assignment
   JWT_SECRET=your_secret_here
   NODE_ENV=development
   ```

3. **Run the server**

   ```bash
   npm run dev
   # or
   npm start
   ```

4. **Key URLs**

- Health: `GET http://localhost:4000/health`
- Swagger: `http://localhost:4000/api-docs`
- API base: `http://localhost:4000/api/v1`

## Auth Endpoints

- `POST /api/v1/auth/register`
  - Body: `{ "name": string, "email": string, "password": string }`
  - Response: `{ user, token }`
  - First registered user is assigned role **admin**, subsequent users are **user**.

- `POST /api/v1/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `{ user, token }`

- `GET /api/v1/auth/me`
  - Headers: `Authorization: Bearer <JWT>`
  - Response: `{ user }`

## Task Endpoints

All task endpoints require `Authorization: Bearer <JWT>`.

- `POST /api/v1/tasks`
  - Create a task for the current user.
  - Body: `{ "title": string, "description"?: string, "status"?: "pending" | "in-progress" | "completed" }`

- `GET /api/v1/tasks`
  - Get all tasks belonging to the current user.

- `GET /api/v1/tasks/:id`
  - Get a single task by ID (must belong to current user).

- `PUT /api/v1/tasks/:id`
  - Update a task (title, description, status) for the current user.

- `DELETE /api/v1/tasks/:id`
  - Delete a task for the current user.

- `GET /api/v1/tasks/admin/all`
  - **Admin only** – lists all tasks across users.

## Validation & Error Handling

- Uses `express-validator` to validate and sanitize inputs.
- Errors are returned in a consistent JSON shape:

```json
{
  "message": "Error message",
  "errors": [ { "msg": "...", "param": "...", "location": "body" } ]
}
```

## Security Notes

- Passwords are **never stored in plain text**, only bcrypt hashes.
- JWTs are signed with `JWT_SECRET` and expire (config in `utils/jwt.js`).
- CORS is enabled to allow the frontend to talk to the backend; in production this should be restricted to trusted origins.


