# Valcrion — MongoDB Setup Guide

## Your connection string is already configured ✅
`mongodb+srv://Ankit:Ankit@cluster0.cj3t3ic.mongodb.net/valcrion`

---

## Step-by-Step: Run the App

You need **two terminals** open at the same time.

---

### TERMINAL 1 — Start the Backend (Express + MongoDB)

```bash
# Go into the server folder
cd valcrion/server

# Install dependencies (only once)
npm install

# Start the server
npm run dev
```

You should see:
```
✅ Valcrion API running on http://localhost:5000
📦 MongoDB connected to cluster0
📂 Connected to database: valcrion
👤 Admin account seeded: admin@valcrion.com / admin123
```

---

### TERMINAL 2 — Start the Frontend (React)

```bash
# Go into the React app folder
cd valcrion

# Install dependencies (only once, if not done already)
npm install

# Start React
npm start
```

React opens at `http://localhost:3000`

---

## MongoDB Atlas — One Thing You Must Do

Before running, go to **MongoDB Atlas → Network Access** and allow your IP:

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Left sidebar → **"Network Access"**
3. Click **"Add IP Address"**
4. Click **"Allow Access From Anywhere"** (for development)
5. Click **Confirm**

Without this step the server will fail to connect.

---

## Admin Login

```
Email:    admin@valcrion.com
Password: admin123
```

---

## File Structure

```
valcrion/
├── .env                    ← React env (API URL)
├── src/
│   ├── db.ts               ← API client (calls Express)
│   └── ...
└── server/
    ├── .env                ← MongoDB URI + JWT secret
    ├── index.js            ← Express app entry
    ├── db.js               ← MongoDB connection
    ├── middleware/
    │   └── auth.js         ← JWT middleware
    └── routes/
        ├── auth.js         ← /api/auth/login, /register
        ├── users.js        ← /api/users
        ├── projects.js     ← /api/projects
        ├── chat.js         ← /api/chat
        ├── blog.js         ← /api/blog
        ├── jobs.js         ← /api/jobs
        └── contact.js      ← /api/contact
```

---

## MongoDB Collections (auto-created)

| Collection   | What it stores           |
|--------------|--------------------------|
| vl_users     | Clients, developers, admin |
| vl_projects  | All projects             |
| vl_chat      | Chat messages            |
| vl_blog      | Blog posts               |
| vl_jobs      | Job applications         |
| vl_contact   | Contact form submissions |

---

## Common Errors

**"MongoServerError: bad auth"**
→ Wrong password in connection string. Go to Atlas → Database Access → Edit user → reset password.

**"connection timed out"**
→ IP not whitelisted. Go to Atlas → Network Access → Add IP.

**"CORS error" in browser**
→ Make sure Express server is running on port 5000.
