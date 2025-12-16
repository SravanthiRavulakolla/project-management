# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack web application for managing Mini Projects in an academic setting. It features a **React + Vite** frontend and an **Express.js + MongoDB** backend. The system manages three user roles (Students, Guides, and Admins) and facilitates the selection, allotment, and tracking of project work through Centers of Excellence (COEs).

## Development Commands

### Backend (Node.js/Express)
Navigate to `backend/` directory:
- **Start server**: `npm start` or `npm run dev` (runs on port 5000)
- **Seed database**: `npm run seed` (creates admin/guide users and sample COEs)

### Frontend (React + Vite)
Navigate to `frontend/` directory:
- **Start dev server**: `npm run dev` (runs on port 3000 with proxy to backend)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

### Running the Full Application
1. Start backend: `cd backend && npm run dev`
2. Start frontend (in separate terminal): `cd frontend && npm run dev`
3. Access at `http://localhost:3000`

## Architecture

### Backend Structure
- **Models** (`backend/models/`): Mongoose schemas for 10 entities
  - User roles: `Student.js`, `Guide.js`, `Admin.js`
  - Core entities: `Batch.js` (student teams), `ProblemStatement.js`, `COE.js` (Centers of Excellence)
  - Supporting: `TeamMember.js`, `ProgressUpdate.js`, `TimelineEvent.js`, `Submission.js`
- **Routes** (`backend/routes/`): RESTful API endpoints organized by domain
  - `/api/auth` - authentication (login, register for all roles)
  - `/api/batches` - team/batch management
  - `/api/problems` - problem statements
  - `/api/coe` - Centers of Excellence
  - `/api/guides` - guide profiles and batch assignments
  - `/api/progress` - progress updates with comments
  - `/api/timeline` - timeline events
  - `/api/submissions` - project submissions with marking
  - `/api/admin` - admin dashboard and overview
- **Middleware** (`backend/middleware/auth.js`): JWT-based authentication with role-based authorization
  - `protect`: verifies JWT token and attaches user to request
  - `authorize(...roles)`: restricts routes by user role
- **Controllers** (`backend/controllers/`): Business logic for each route
- **Config** (`backend/config/db.js`): MongoDB connection with automatic retry logic

### Frontend Structure
- **Pages** (`frontend/src/pages/`): Role-specific dashboards and auth flows
  - `student/` - Student dashboard, team management, problem selection
  - `guide/` - Guide dashboard, problem creation, team monitoring
  - `admin/` - Admin dashboard, COE management, overview
  - Auth pages: `Login.jsx`, `Register.jsx`, `RegisterGuide.jsx`, `RegisterAdmin.jsx`
- **Context** (`frontend/src/context/AuthContext.jsx`): Global authentication state using React Context
  - Manages JWT token in localStorage
  - Provides `login`, `register`, `logout` functions
  - Auto-sets axios Authorization header
- **Services** (`frontend/src/services/api.js`): Centralized API client with axios
  - All API calls are defined here as named exports
  - Uses relative `/api` path (proxied by Vite to backend)
- **Routing**: React Router with role-based route protection in `App.jsx`
  - Redirects based on authentication state
  - Role-specific dashboard routing (student/guide/admin)

### Key Workflow: Problem Selection & Allotment
1. **Problem Creation**: Guide creates problem statements linked to a COE and target year
2. **Team Formation**: Student leader creates a Batch (team) with team name
3. **Problem Selection**: Batch opts for up to 3 problems (stored in `Batch.optedProblems[]`)
4. **Allotment**: Guide accepts/rejects opted problems; accepted problem is set as `Batch.problemId`
5. **Progress Tracking**: Teams submit progress updates; guides comment
6. **Submission**: Teams submit final work; guides assign marks

### Authentication & Authorization
- **JWT-based**: Token stored in localStorage, sent via Authorization header
- **Three roles**: `student`, `guide`, `admin` (stored in JWT payload)
- **Role-based access**: Middleware `authorize()` restricts routes by role
- **User models**: Separate Mongoose models for each role with shared fields (name, email, password)
- **Password hashing**: bcryptjs used in pre-save hooks

### Database
- **MongoDB Atlas**: Connection string in `backend/.env` as `MONGODB_URI`
- **Initial data**: Run `npm run seed` in backend to create:
  - Admin: `admin@example.com` / `admin123`
  - Guide: `guide@example.com` / `guide123`
  - 7 sample COEs (Deep Learning, IoT, AR-VR, etc.)

### Environment Configuration
- **Backend** (`backend/.env`):
  - `PORT` - Server port (default: 5000)
  - `MONGODB_URI` - MongoDB connection string
  - `JWT_SECRET` - Secret key for JWT signing
  - `JWT_EXPIRE` - Token expiration (e.g., "7d")
- **Frontend**: Vite proxy configured in `vite.config.js` to route `/api` to `http://localhost:5000`

## Important Notes
- **Windows environment**: This project is on Windows; use PowerShell-compatible commands
- **No test suite**: `npm test` is not configured in either frontend or backend
- **Batch terminology**: A "Batch" represents a student team/group, not an academic batch/year
- **Multi-problem opting**: Batches can opt for up to 3 problems; guide selects one to allot
- **Submission flow**: The `Submission` model (added recently) handles final project submissions with marking
