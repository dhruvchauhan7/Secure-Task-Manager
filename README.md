# Secure Task Management System

A full-stack **Secure Task Management System** built with an **Nx monorepo**, featuring **JWT authentication**, **role-based access control (RBAC)**, and a responsive **Angular dashboard** for managing tasks.

This project demonstrates secure API design, frontend–backend integration, and a pragmatic testing strategy suitable for production-grade applications.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Data Model](#data-model)
- [Access Control Implementation](#access-control-implementation)
- [API Documentation](#api-documentation)
- [Testing Strategy](#testing-strategy)
- [Future Considerations](#future-considerations)

---

## Overview

The system allows users to:

- Authenticate using JWT
- Access features based on their role (OWNER / ADMIN / VIEWER)
- Create, edit, delete, categorize, sort, and filter tasks
- Interact with a secure REST API via a modern Angular dashboard

Security and clarity were prioritized over unnecessary complexity.

---

## Tech Stack

### Backend
- **NestJS**
- **TypeORM**
- **JWT Authentication**
- **Jest + Supertest (E2E tests)**

### Frontend
- **Angular (standalone components)**
- **Nx workspace**
- **Responsive CSS (no UI framework)**
- **Karma / Jasmine (unit tests)**

### Monorepo Tooling
- **Nx 17**
- **Node.js 18**
- **npm**

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Git

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=fallback_dev_secret
JWT_EXPIRES_IN=3600
```

---

### 3. Run Backend (API)

```bash
npx nx serve api
```

API will be available at:

```
http://localhost:3000/api
```

---

### 4. Run Frontend (Dashboard)

```bash
npx nx serve dashboard
```

Dashboard will be available at:

```
http://localhost:4200
```

---

## Demo Users

| Role   | Email            | Password    |
|--------|------------------|-------------|
| OWNER  | owner@demo.com   | Owner123!  |
| ADMIN  | admin@demo.com   | Admin123!  |
| VIEWER | viewer@demo.com  | Viewer123! |

---

## Architecture Overview

### Nx Monorepo Layout

```text
apps/
  api/              → NestJS backend
  api-e2e/          → Backend E2E tests
  dashboard/        → Angular frontend
  dashboard-e2e/    → Frontend E2E tests

libs/
  auth/             → Shared auth utilities (guards, decorators)
  data/             → Shared DTOs & interfaces
```

### Rationale

- Clear separation of concerns
- Shared code without tight coupling
- Scales well for larger teams
- Single dependency graph & tooling

---

## Data Model

### User

```text
User
----
id
email
password
role (OWNER | ADMIN | VIEWER)
orgId
```

### Task

```text
Task
----
id
title
description
status (OPEN | IN_PROGRESS | DONE)
category
createdByEmail
orgId
createdAt
updatedAt
```

### Entity Relationship (Logical)

```text
Organization
   |
   |-- Users (roles)
   |
   |-- Tasks
```

Tasks belong to an organization and are created by users within that organization.

---

## Access Control Implementation

### Roles

| Role   | Permissions        |
|--------|--------------------|
| OWNER  | Full access (CRUD) |
| ADMIN  | Full access (CRUD) |
| VIEWER | Read-only          |

---

### How RBAC Works

#### JWT Authentication
- User logs in
- Server issues a JWT containing:
  - userId
  - role
  - orgId

#### Guards
- `JwtAuthGuard` validates the token
- `RolesGuard` checks role permissions

#### Decorators
- `@Roles('OWNER', 'ADMIN')` restricts routes

#### Frontend
- UI disables create/edit/delete for VIEWER
- Backend always enforces RBAC regardless of UI

---

## API Documentation

### Authentication

#### Login

```http
POST /api/auth/login
```

**Request**
```json
{
  "email": "owner@demo.com",
  "password": "Owner123!"
}
```

**Response**
```json
{
  "accessToken": "eyJhbGciOi..."
}
```

---

### Tasks

#### Get Tasks

```http
GET /api/tasks
Authorization: Bearer <token>
```

---

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
```

```json
{
  "title": "Write README",
  "description": "Finish documentation",
  "status": "OPEN",
  "category": "Work"
}
```

---

#### Update Task

```http
PUT /api/tasks/:id
Authorization: Bearer <token>
```

---

#### Delete Task

```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

---

## Testing Strategy

### Backend Tests (Jest + Supertest)

Run:

```bash
npx nx e2e api-e2e
```

Covered:
- Authentication (login returns JWT)
- RBAC enforcement (viewer forbidden)
- Owner/Admin CRUD access
- Task lifecycle (create → update → delete)

---

### Frontend Tests (Karma / Jasmine)

Run:

```bash
npx nx test dashboard
```

Covered:
- Dashboard renders
- Task list loads
- Create button disabled for VIEWER
- Task creation interaction

Focused on critical paths, not exhaustive UI coverage.

---

## Future Considerations

### Advanced Role Delegation
- Per-project roles
- Temporary permissions
- Role inheritance

### Production-Ready Security
- Refresh tokens
- Token rotation
- CSRF protection
- Secure cookie storage
- Password hashing (bcrypt)

### Performance & Scalability
- Permission caching
- Query optimization
- Background audit logging
- Horizontal scaling
