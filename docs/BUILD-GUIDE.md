# Magster Platform - Build & Deployment Guide

## Project Overview

Magster is an Ethiopian-focused educational platform built with React Router v7, TypeScript, Supabase, and modern web technologies.

---

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Supabase Account**: For database and backend services

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd magster-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_PROJECT_URL=your_supabase_project_url
SUPABASE_API_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

---

## Development

### Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

---

## Building for Production

### 1. Build the Application
```bash
npm run build
```

This generates optimized production files in the `build/` directory.

### 2. Preview Production Build
```bash
npm run start
```

---

## Project Structure

```
magster-platform/
├── app/
│   ├── components/          # Reusable UI components
│   ├── routes/             # Route modules
│   ├── services/           # Business logic & API calls
│   ├── lib/                # Auth & Supabase configuration
│   ├── styles/             # Global styles & theme
│   ├── utils/              # Helper functions
│   └── root.tsx            # App root
├── public/                 # Static assets
├── docs/                   # Documentation
└── package.json
```

---

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy
4. Add environment variables in Vercel dashboard

### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build/client`
4. Add environment variables in Netlify dashboard

### Self-Hosted
1. Build the app: `npm run build`
2. Copy `build/` directory to your server
3. Serve with Node.js or any static file server
4. Ensure environment variables are set

---

## Database Setup (Supabase)

### 1. Create Tables

Run the migrations in `supabase/migrations/` (if available) or manually create the following tables:

- `students`
- `teachers`
- `admins`
- `courses`
- `bundles`
- `lessons`
- `enrollments`
- `payment_submissions`
- `payment_methods`
- `library_items`
- `library_content`
- `competitions`
- `app_settings`
- `notifications`

### 2. Set Row Level Security (RLS)

Enable RLS on all tables and configure policies based on user roles (student, teacher, admin).

### 3. Storage Buckets

Create storage buckets for:
- Course thumbnails
- Lesson videos
- Payment screenshots
- Profile pictures

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_PROJECT_URL` | Your Supabase project URL |
| `SUPABASE_API_KEY` | Supabase anonymous API key |

---

## Features

### Student Portal
- Browse courses and bundles
- Enroll and submit payment
- Watch lessons
- Access library content
- Join competitions
- Device binding for security

### Teacher Portal
- Create and manage courses
- Upload lessons (YouTube URLs)
- Track students and earnings
- Request withdrawals

### Admin Portal
- User management (students & teachers)
- Course and content approval
- Payment processing
- Library management
- Competitions management
- System settings
- Send notifications

---

## Mobile App (Capacitor)

### iOS & Android Build

#### 1. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

#### 2. Initialize Capacitor
```bash
npx cap init
```

#### 3. Build Web App
```bash
npm run build
```

#### 4. Add Platforms
```bash
npx cap add ios
npx cap add android
```

#### 5. Sync Changes
```bash
npx cap sync
```

#### 6. Open Native IDE
```bash
npx cap open ios
npx cap open android
```

#### 7. Build & Run
- **iOS**: Use Xcode to build and run
- **Android**: Use Android Studio to build and run

---

## Support & Contact

For issues or questions:
- **Email**: support@magster.com
- **Telegram**: @magster_support

---

## License

Magster Platform - Educational Technology Solution
