---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
Full-stack web application for managing Mini Projects in an academic setting. It features a **React + Vite** frontend and an **Express.js + MongoDB** backend. The system manages user roles (Students, Guides, Admins) and facilitates project selection, allotment, and tracking.

## Repository Structure
- **backend/**: Node.js/Express application serving the REST API.
- **frontend/**: React application built with Vite.
- **WARP.md**: Comprehensive project documentation and guide.

## Projects

### Backend
**Configuration File**: `backend/package.json`

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Framework**: Express.js
**Database**: MongoDB (Mongoose)
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- multer
- express-validator

#### Build & Installation
```bash
# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Start production server
npm start

# Seed database
npm run seed
```

#### Testing
**Status**: No test suite configured.

### Frontend
**Configuration File**: `frontend/package.json`

#### Language & Runtime
**Language**: JavaScript (React)
**Build System**: Vite
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react
- react-dom
- react-router-dom
- axios

**Development Dependencies**:
- vite
- @vitejs/plugin-react

#### Build & Installation
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Testing
**Status**: No test suite configured.
