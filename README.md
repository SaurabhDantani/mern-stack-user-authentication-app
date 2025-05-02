✅ Task Title: Advanced User Authentication System with Session Tracking and Device Management (Full Stack)

🎯 Objective:
Build a full-stack authentication system with the following features:
User registration and login


JWT-based session management


Role-based access control


Device and IP tracking


Session expiration


React frontend with protected routes and session management



🔧 Technologies to Use:
Backend: Node.js, Express.js, MySQL OR MongoDB, JWT, bcrypt


Frontend: React.js (Vite or CRA), Axios, React Router


Optional: Redis (for faster session checks), Sequelize/Knex.js



📌 Features and Requirements
🔐 1. User Registration
Fields: name, email, password, role (admin, user)


The password must be hashed using bcrypt


Email must be unique (SQL constraint)


Send a success response with a message like User created successfully



🔐 2. User Login (with Device/IP Management)
Authenticate user with email/password


On successful login:


Generate JWT (valid for 1 hour)


Store in user_sessions:


user_id, ip_address, user_agent, jwt_token, created_at, last_active_at, is_active


On new login:


Invalidate previous session (i.e., only one active session per user)


OR (optional) allow multiple sessions and show all in the dashboard


Track:


IP address


Browser/device (user-agent)


Login time and last activity



🔑 3. JWT-Based Authentication
Protect sensitive routes on the backend using middleware


Frontend should store the token in a secure HTTP-only cookie or localStorage



🔒 4. Role-Based Access
Admin can access /admin/dashboard


user can access /user/profile


Enforce this in both backend middleware and frontend routes



🔁 5. Logout
Invalidate session in user_sessions table (mark is_active = false)


Remove JWT on the frontend



📋 6. Session Viewer
Endpoint /sessions/active returns:


Device info (browser, OS)


IP address


Login time


Last active time


Display on the React dashboard



🛡️ 7. Frontend Requirements (React)
Login & Registration forms


Authenticated layout:


Navbar with user info and logout button


Protected routes using React Router


Session Viewer Page:


Show a list of active sessions with a logout option per session


Error handling for:


Expired tokens


Unauthorized access


Network/API errors



🗃️ Database Schema Suggestion:
users
id
name
email
password
role
created_at

user_sessions
| id | user_id | jwt_token | ip_address | user_agent | is_active | created_at | last_active_at |

✅ Bonus Challenges (Optional)
Use Redis to store sessions for fast invalidation


Add account lock after 5 failed attempts


Add multi-device support with the ability to log out specific devices


Add a refresh token mechanism



📦 Deliverables
GitHub repo with:


/backend – Express.js server


/frontend – React.js app


.env.example and setup instructions


SQL schema + migration scripts


Postman collection or Swagger API docs


