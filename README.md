# Store Rating Platform (Roxiler Assignment)

Full-stack web app where users rate registered stores (1–5). Built with **Express.js**, **MySQL**, and **React**.

## Features

### System Administrator
- Dashboard with total users, stores, and ratings
- Add users (Admin / Normal User / Store Owner)
- Add stores (optionally assign a store owner)
- List/filter/sort users and stores
- View user details (includes store rating for store owners)

### Normal User
- Sign up and log in
- Browse/search stores by name and address
- Submit and update ratings (1–5)
- Update password

### Store Owner
- Log in and update password
- See average store rating
- View users who rated their store

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express.js, Sequelize      |
| Database | MySQL                               |
| Auth     | JWT + bcrypt                        |
| Frontend | React (Vite), React Router, Axios   |

## Project Structure

```
Rolxier/
├── backend/          # Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── validators/
│       └── utils/
└── frontend/         # React app
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── utils/
```

## Prerequisites

- Node.js 18+
- MySQL 8+ (XAMPP / MySQL Server / Docker)

## Setup

### 1. Start MySQL

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

This starts MySQL with database `store_rating_db`, user `root`, password `root`.

**Option B — Local MySQL:**

```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

If using Docker MySQL, `.env` can keep `DB_PASSWORD=root`. Otherwise set your local MySQL password.

```bash
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Demo Accounts (after seed)

| Role        | Email               | Password   |
|-------------|---------------------|------------|
| Admin       | admin@roxiler.com   | Admin@123  |
| Store Owner | owner1@roxiler.com | Owner@123  |
| Normal User | user1@roxiler.com   | User@1234  |

## Form Validations

- **Name**: 20–60 characters
- **Address**: max 400 characters
- **Password**: 8–16 characters, at least one uppercase letter and one special character
- **Email**: standard email format
- **Rating**: integer 1–5

## API Overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| PUT | `/api/auth/password` | Authenticated |
| GET | `/api/admin/dashboard` | Admin |
| GET/POST | `/api/admin/users` | Admin |
| GET | `/api/admin/users/:id` | Admin |
| GET/POST | `/api/admin/stores` | Admin |
| GET | `/api/user/stores` | User |
| POST/PUT | `/api/user/stores/:storeId/ratings` | User |
| GET | `/api/owner/dashboard` | Store Owner |

## Database Schema

- **users** — id, name, email, password, address, role (`ADMIN` \| `USER` \| `STORE_OWNER`)
- **stores** — id, name, email, address, owner_id → users.id
- **ratings** — id, user_id, store_id, rating (1–5), unique(user_id, store_id)

## Notes

- Tables support ascending/descending sort on key columns (name, email, address, role, rating).
- Passwords are hashed with bcrypt; API protected with JWT.
- Frontend proxies `/api` to the backend during development.
