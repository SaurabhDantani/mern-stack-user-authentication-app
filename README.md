# MERN Stack User Authentication App

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Database Schema](#database-schema)
3. [API Documentation](#api-documentation)
4. [Setup Instructions](#setup-instructions)

## Environment Setup

Create a `.env` file in the backend directory with the following configuration:

```env
#backend configuration
DB_HOST=your_database_host  
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
```

## Database Schema

The application uses TypeORM for database management with the following tables:

### User Table
- `id` (auto-increment)
- `name` (varchar(100))
- `email` (varchar(100), unique)
- `password` (varchar(255))
- `role` (enum: '1' for Admin, '2' for User)
- `createdAt` (datetime)

### UserSession Table
- `id` (auto-increment)
- `jwtToken` (varchar(500))
- `ipAddress` (varchar(50))
- `userAgent` (varchar(255))
- `isActive` (boolean, default: true)
- `createdAt` (datetime)
- `lastActiveAt` (datetime)
- `userId` (foreign key to User table)

## API Documentation

### Authentication Routes

#### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "number" // 1 for Admin, 2 for User
  }
  ```

#### Login
- **Endpoint**: `POST /auth/login`
- **Description**: User login
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token",
    "role": "user|admin"
  }
  ```

#### Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: User logout
- **Headers**: `Authorization: Bearer <token>`

### User Routes

#### Get User Profile
- **Endpoint**: `GET /user/profile`
- **Description**: Get user profile
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Authenticated users

#### Get All Users (Admin Only)
- **Endpoint**: `GET /admin/users`
- **Description**: Get all users
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Admin only

#### Admin Dashboard
- **Endpoint**: `GET /admin/dashboard`
- **Description**: Admin dashboard
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Admin only

#### Get Active Sessions (Admin Only)
- **Endpoint**: `GET /sessions/active`
- **Description**: Get active sessions
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Admin only

#### Logout Specific Session
- **Endpoint**: `POST /sessions/:sessionId/logout`
- **Description**: Logout specific session
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Authenticated users

### API Authentication
- All protected routes require a Bearer token in the Authorization header
- Token format: `Bearer <jwt_token>`
- Token expiration: 1 hour

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```

3. Create and configure the `.env` file in the backend directory
4. Run database migrations:

   ```bash
   cd backend
   npm run migration:run
   ```

5. Start the servers:

   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory)
   npm start
   ```

The backend runs on port 8080, and the frontend runs on port 3000 by default.

## Development

### Backend Scripts
- `npm run dev`: Start development server
- `npm run build`: Build the project
- `npm run migration:run`: Run database migrations
- `npm run migration:generate`: Generate new migration
- `npm run migration:show`: Show migrations status

### Frontend Scripts
- `npm start`: Start development server
- `npm run build`: Build the project
- `npm test`: Run tests
- `npm run eject`: Eject from create-react-app
