# 🐾 PawsConnect

Pet adoption platform connecting users with shelters. Browse animals, save favorites, and submit adoption or walk applications.

![Frontend](https://img.shields.io/badge/Frontend-React%20Native%20%2B%20Expo-61DAFB?style=flat-square&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![State](https://img.shields.io/badge/State-Zustand-443E38?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Supabase%20%2B%20JWT-3ECF8E?style=flat-square&logo=supabase)
![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## Features

### User
- Browse animals with filtering (city/type)
- Favorites synced to the database
- Adoption application form
- Walk reservation
- Visits list (upcoming/history)
- Profile settings (account data, avatar, city)

### Shelter (Admin)
- Applications dashboard (adoption + walks)
- Approve / reject applications
- Track applicants per animal
- Shelter profile/settings

---

## Tech

- React Native + Expo
- TypeScript
- Zustand
- Supabase (PostgreSQL, Auth, RLS)

---

## Project structure

```
PawsConnect/
├── src/
│   ├── screens/               # app screens
│   ├── components/            # reusable UI
│   ├── store/                 # Zustand stores
│   ├── services/              # Supabase client
│   ├── utils/                 # helpers
│   └── navigation/            # navigators
├── app.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting started

### Requirements
- Node.js 16+
- Expo CLI
- Supabase project

### Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env` in the project root:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the app
   ```bash
   npm start
   ```

---

## Database (Supabase)

Tables used by the app:
- `animals`
- `applications`
- `favorites`

RLS is enabled. Users can access their own `favorites` and `applications`, admins can review all applications.

---

## License

MIT
