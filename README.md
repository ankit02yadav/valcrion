# Valcrion — Web Platform

An anonymous freelancing platform connecting clients with elite web developers.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start

# 3. Build for production
npm run build
```

## 🔑 Default Admin Login

```
Email:    admin@valcrion.com
Password: admin123
```

## 📁 Project Structure

```
src/
├── constants.ts          ← ⭐ UPDATE ALL LINKS/SOCIAL MEDIA HERE
├── db.ts                 ← localStorage-backed mock database
├── types/index.ts        ← TypeScript interfaces
├── contexts/
│   ├── AuthContext.tsx   ← Authentication state
│   └── ThemeContext.tsx  ← Dark/light theme
├── components/
│   ├── Header.tsx        ← Navigation + theme toggle
│   └── Footer.tsx        ← Footer with social links
└── pages/
    ├── Home.tsx           ← Landing page
    ├── Login.tsx          ← /login
    ├── Register.tsx       ← /register
    ├── ClientProfile.tsx  ← /profile (client view)
    ├── DevProfile.tsx     ← /dev/profile (developer view)
    ├── AdminPanel.tsx     ← /admin (admin CRM panel)
    ├── Services.tsx       ← /services
    ├── About.tsx          ← /about
    ├── Blog.tsx           ← /blog
    └── Job.tsx            ← /job (developer application)
```

## ⚙️ Updating Constants

All links and social media are in **`src/constants.ts`**:

```ts
export const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/valcrion",
  instagram: "https://www.instagram.com/valcrion.dev",
  website: "valcrion",
};

//  export const IMAGES = {
//    logo: "/assets/logo.png",  // ← add your logo here
//  // ...
//  };
```

## 🗄️ Database

Currently uses **localStorage** as mock storage.

For production, replace the functions in `src/db.ts` with:
- **MongoDB Atlas** (recommended — free tier available on cluster0)
- **Supabase**
- **Firebase**

Each collection maps to a MongoDB collection:
- `vl_users` → users (clients, developers, admin)
- `vl_projects` → projects
- `vl_chat` → chat messages
- `vl_blog` → blog posts
- `vl_jobs` → job applications
- `vl_contact` → contact form submissions

## 👤 User Roles

| Role      | Access                              |
|-----------|-------------------------------------|
| `client`  | Register freely → /profile          |
| `developer` | Apply via /job → Admin adds to DB |
| `admin`   | Full CRM at /admin                  |

## 🎨 Themes

- **Dark** (default): Deep purple-black glassmorphism
- **Light**: Soft lavender glassmorphism
- Toggle via the sun/moon icon in the header

