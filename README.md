# 🐾 PawsConnect

Pet adoption platform connecting users with shelters. Browse animals, add favorites, submit adoption/walk applications, and manage your visits.

![Frontend](https://img.shields.io/badge/Frontend-React%20Native%20%2B%20Expo-61DAFB?style=flat-square&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![State](https://img.shields.io/badge/State-Zustand-443E38?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Supabase%20%2B%20JWT-3ECF8E?style=flat-square&logo=supabase)
![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## 🎯 Features

### For Users
- 🏠 **Home Feed** - Browse available animals with filtering by city and type
- ❤️ **Favorites** - Save animals you like (persisted to database)
- 📋 **Adoption Applications** - Submit formal adoption requests with questionnaire
- 🚶 **Walk Reservations** - Book spacer/walk sessions with animals
- 📱 **Visit Tracking** - View all your applications sorted by date (Upcoming/History)
- ⚙️ **Profile Settings** - Manage account, password, profile picture, city selection

### For Shelters (Admin)
- 📊 **Application Dashboard** - Review all pending adoption & walk applications
- ✅ **Approve/Reject** - Make decisions on user applications in real-time
- 👥 **User Management** - Track who applied for which animals
- 🏠 **Shelter Profile** - Manage shelter metadata and settings

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native, Expo, TypeScript |
| **UI Components** | Lucide Icons, React Native StyleSheet |
| **State Management** | Zustand |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Authentication** | Supabase Auth (JWT-based) |
| **Real-time** | Supabase Realtime (optional, can be added) |
| **Build Tool** | Metro Bundler |

---

## 📁 Project Structure

```
PawsConnect/
├── src/
│   ├── screens/
│   │   ├── user/              # User-facing screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── FavoritesScreen.tsx
│   │   │   ├── VisitsScreen.tsx
│   │   │   ├── DetailsScreen.tsx
│   │   │   ├── AdoptionFormScreen.tsx
│   │   │   ├── WalkReservationScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── admin/             # Admin-only screens
│   │   │   ├── AdminApplicationsScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/            # Reusable UI components
│   │   ├── AnimalCard.js
│   │   ├── BottomTabBar.js
│   │   └── profile/
│   ├── store/                 # Zustand state stores
│   │   ├── useAuthStore.ts
│   │   ├── useFavoritesStore.ts
│   │   ├── useShelterStore.ts
│   │   └── useFilterStore.ts
│   ├── services/              # Supabase integration
│   │   └── supabase.ts
│   ├── types/                 # TypeScript interfaces
│   │   └── profile.ts
│   ├── utils/                 # Utilities
│   │   └── animalLabels.ts    # Gender-aware age formatting
│   ├── constants/             # Constants
│   │   ├── categories.ts
│   │   └── cities.ts
│   └── navigation/
│       └── TabNavigator.tsx
├── app.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account and project

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd PawsConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Create .env file in root directory
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   - **Android**: Press `a` in terminal, or scan QR code with Expo Go
   - **iOS**: Press `i` in terminal, or scan QR code with Camera app
   - **Web**: Press `w` in terminal (http://localhost:8081)

---

## 🗄️ Database Schema

### Tables in Supabase PostgreSQL

#### `animals`
```sql
- id (UUID, PK)
- name (text)
- breed (text)
- age (text)
- sex (text)
- city (text)
- description (text)
- image_url (text)
- type (text: 'Pies', 'Kot', 'Inne')
- created_at (timestamp)
```

#### `applications`
```sql
- id (UUID, PK)
- animal_id (UUID, FK → animals)
- animal_name (text)
- applicant_id (UUID, FK → auth.users)
- applicant_name (text)
- type (text: 'Adopcja' | 'Spacer')
- date (text: 'DD.MM.RRRR HH:MM')
- status (text: 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone')
- created_at (timestamp)
```

#### `favorites`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- animal_id (UUID, FK → animals)
- created_at (timestamp)
```

---

## 🔐 Security & Authentication

- **Auth Method**: Supabase Auth with JWT tokens
- **User Roles**: User | Admin (stored in Auth metadata)
- **RLS Policies**: Row-level security enabled on all tables
  - `animals`: public read
  - `applications`: users see own; admins see all
  - `favorites`: users see/manage own

---

## 🔄 Data Flow

```
User Input (Screen)
    ↓
Zustand Store (State Management)
    ↓
Supabase Service (API)
    ↓
PostgreSQL Database
    ↓
RLS Policy Check
    ↓
Response → Zustand Update → UI Re-render
```

### Example: Favoriting an Animal
1. User taps heart icon on `HomeScreen`
2. `useFavoritesStore.toggleFavorite(animalId)` called
3. Store inserts/deletes row in `favorites` table
4. `FavoritesScreen` re-renders with updated list

### Example: Admin Accepts Application
1. Admin views `AdminApplicationsScreen`
2. Taps "Zaakceptuj" button
3. Sends `UPDATE applications SET status = 'Zaakceptowane'`
4. User sees status change in `VisitsScreen`

---

## 📝 Key Features Explained

### Gender-Aware Age Formatting
Ages display correctly in Polish depending on animal sex:
- Female (samica/suczka): `Młoda` / `Dorosła`
- Male (samiec/pies): `Młody` / `Dorosły`
- Unknown: `Młody/a` / `Dorosły/a`

Implemented in `src/utils/animalLabels.ts` and used across HomeScreen, FavoritesScreen, DetailsScreen.

### Visit Filtering (Nadchodzące/Historia)
Visits are filtered by **date**, not just status:
- **Nadchodzące** (Upcoming): Visit date ≥ now OR pending rejection
- **Historia** (History): Visit date < now AND not rejected

Date parsing: `parseVisitDate("30.03.2026 14:00")` → JavaScript Date object

### Profile & Metadata
User profile data stored in Supabase Auth's `user_metadata`:
```json
{
  "full_name": "Jan Kowalski",
  "city": "Warszawa",
  "phone": "+48 123 456 789",
  "avatar_url": "https://..."
}
```

Admin profile data:
```json
{
  "shelter_name": "Schronisko Test",
  "city": "Kraków",
  "phone": "+48 987 654 321",
  "role": "admin"
}
```

---

## 🏃 Running E2E Test (Manual)

To verify full workflow:

1. **Clear Metro cache**
   ```bash
   npm start -- --clear
   ```

2. **Create test user account**
   - Email: `test@example.com`
   - Password: `Test@123`
   - Role: User

3. **Create test admin account**
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Role: Admin

4. **Test workflow**
   - User: Log in → Browse animals → Add favorite → Submit adoption application
   - Admin: Log in → View applications → Accept application
   - User: Refresh VisitsScreen → Verify status shows "Zaakceptowane"

5. **Verify checkpoints**
   - ✅ Animals load from Supabase (not mocks)
   - ✅ Favorites persist in database
   - ✅ Applications insert successfully
   - ✅ Admin can see & update applications
   - ✅ User sees real-time status changes

---

## 🐛 Troubleshooting

### Metro Bundler Errors
```bash
# Clear cache and rebuild
npm start -- --clear
```

### Supabase Connection Issues
- Verify `.env` has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Check network connectivity

### RLS Policy Errors
- Enable RLS on `animals`, `applications`, `favorites` tables
- Verify SELECT/INSERT/UPDATE policies are correct
- Check user role in Auth metadata

### TypeScript Errors
```bash
npx tsc --noEmit
```

---

## 📚 Code Quality

- **TypeScript**: Strict type checking enabled
- **Compilation**: `npx tsc --noEmit` passes with 0 errors
- **Bundle**: Metro Bundler clean startup
- **Code**: No console.log, TODO markers, or dead code

---

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Last Updated**: March 26, 2026  
**Status**: Production-Ready ✅
