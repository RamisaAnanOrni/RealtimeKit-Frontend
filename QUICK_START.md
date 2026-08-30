# 🚀 Quick Start Guide - AgriVet Frontend

## ✅ Setup Complete

All the infrastructure is now in place for a strict **Direct-to-Django** architecture:

- ❌ **Deleted**: All Next.js API routes (`app/api/`)
- ✅ **Created**: Comprehensive API service modules
- ✅ **Created**: Environment configuration files
- ✅ **Created**: Example components with correct patterns

---

## 📦 What You Have

### API Service Modules (`lib/`)
All ready to use. Each module handles specific functionality:

```typescript
// Authentication
import { userLogin, userSignup, getCurrentUser } from "@/lib/auth-api";

// Farmer Operations
import { getFarmerProfile, getFarmerDashboard } from "@/lib/farmer-api";

// Vet Operations
import { getVetProfile, getVetDashboard } from "@/lib/vet-api";

// Video Calls
import { getMeetingCredentials, createMeeting } from "@/lib/meeting-api";

// Guest Requests
import { submitGuestRequest, pollGuestRequest } from "@/lib/guest-api";
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_STATIC_API_KEY=agrivet-secret-lifetime-key-2026
```

---

## 🎯 Example: Build a Component in 3 Steps

### Step 1: Add `"use client"` Directive
```typescript
"use client";
```

### Step 2: Import API Functions
```typescript
import { getFarmerDashboard } from "@/lib/farmer-api";
import { getErrorMessage } from "@/lib/api";
```

### Step 3: Call Django Directly
```typescript
useEffect(() => {
  getFarmerDashboard()
    .then(data => setStats(data))
    .catch(err => setError(getErrorMessage(err)));
}, []);
```

**Done!** The component now fetches data directly from your Django backend.

---

## 📋 Checklist for Every Component

Before committing code:

- [ ] Component file starts with `"use client"`
- [ ] All API imports are from `lib/` (not `next/api` or `app/api`)
- [ ] No `NextResponse`, `NextRequest`, or route handlers
- [ ] Authentication token is handled by `saveAuth()` and `getAuthHeaders()`
- [ ] Errors are handled with `getErrorMessage()`
- [ ] `.env.local` is in `.gitignore` (secrets safe)
- [ ] Component uses TypeScript interfaces from API modules

---

## 🔍 Example Flows

### Authentication Flow
```
User enters phone/password
       ↓
Component calls userLogin()
       ↓
Django validates credentials
       ↓
Returns { access: "token", role: "farmer" }
       ↓
saveAuth() stores token in localStorage
       ↓
Component redirects to dashboard
```

### Dashboard Flow
```
User navigates to /farmer/dashboard
       ↓
Component loads, checks token with getStoredAuth()
       ↓
useEffect calls getFarmerDashboard()
       ↓
Django processes request (check token, get data from DB)
       ↓
Returns { pending_consultations: 3, total_livestock: 5, ... }
       ↓
Component renders with data
```

### Video Call Flow
```
Meeting ID created in database
       ↓
Component calls getMeetingCredentials(meetingId, "farmer")
       ↓
Django validates + generates Dyte auth token
       ↓
Returns { auth_token: "...", meeting_id: "..." }
       ↓
Component initializes Dyte with token
       ↓
User joins video call
       ↓
When done, component calls endMeeting()
       ↓
Django updates meeting status in database
```

---

## 📁 File Structure Quick Reference

```
lib/
├── api.ts              ← Core utilities (tokens, headers, base fetch)
├── auth-api.ts         ← Login, signup, password reset
├── farmer-api.ts       ← Farmer dashboard, profile, livestock
├── vet-api.ts          ← Vet dashboard, profile, consultations
├── meeting-api.ts      ← Video calls, meeting credentials
└── guest-api.ts        ← Guest requests, polling

components/
├── AuthExample.tsx                          ← Login/Signup pattern
├── FarmerDashboardExample.tsx               ← Fetch pattern
├── VideoCallExample.tsx                     ← Dyte integration pattern
└── guest/
    └── GuestConsultationFormExample.tsx     ← Polling pattern

app/
├── layout.tsx          ← Root layout (Server Component ok)
├── page.tsx            ← Home (can be Server Component)
├── auth/
│   └── page.tsx        ← Client Component
├── farmer/dashboard/
│   └── page.tsx        ← Client Component
├── vet/dashboard/
│   └── page.tsx        ← Client Component
└── guest/
    └── page.tsx        ← Client Component

[NO app/api/ directory - all deleted]
```

---

## 🛠️ Common Tasks

### How to: Fetch User Profile
```typescript
import { getCurrentUser } from "@/lib/auth-api";

const user = await getCurrentUser(); // Returns { id, username, role, ... }
```

### How to: Update Dashboard Data
```typescript
import { updateConsultationStatus } from "@/lib/vet-api";

await updateConsultationStatus(consultationId, "COMPLETED", {
  diagnosis: "...",
  treatment: "..."
});
```

### How to: Get Video Call Credentials
```typescript
import { getMeetingCredentials } from "@/lib/meeting-api";

const creds = await getMeetingCredentials(meetingId, "farmer");
// { auth_token: "...", meeting_id: "...", base_url: "..." }
```

### How to: Handle Errors
```typescript
import { getErrorMessage } from "@/lib/api";

try {
  await someApiCall();
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message); // "Invalid credentials" or similar
}
```

---

## 🔐 Security Notes

1. **Tokens are secure**: localStorage is isolated per domain
2. **HTTPS in production**: Tokens never sent over HTTP
3. **Static API key in .env**: Safe in `.env.local` (git-ignored)
4. **No sensitive data in components**: All auth logic in `lib/auth-api.ts`
5. **Bearer tokens auto-included**: `getAuthHeaders()` handles it

---

## 🚀 Next Steps

1. **Update existing pages** from `app/auth/` to use `userLogin()` instead of `/api/auth`
2. **Update existing pages** from `app/farmer/dashboard/` to use `getFarmerDashboard()`
3. **Create video call page** using `getMeetingCredentials()` and Dyte SDK
4. **Test with Django running** on `http://localhost:8000`
5. **Verify tokens** in browser DevTools → Application → localStorage

---

## 📚 Reference Files

- 📖 **ARCHITECTURE.md** - Complete detailed architecture guide
- 🔧 **lib/api.ts** - Core utilities and base functions
- 📝 **lib/auth-api.ts** - Full authentication API
- 👨‍🌾 **lib/farmer-api.ts** - Farmer endpoints
- 🐕 **lib/vet-api.ts** - Vet endpoints
- 🎥 **lib/meeting-api.ts** - Video call endpoints
- 👤 **lib/guest-api.ts** - Guest consultation endpoints
- 📄 **.env.local** - Environment variables (create if missing)

---

## ❓ Troubleshooting

### Error: "401 Unauthorized"
→ Token expired or not present. Clear localStorage and re-login.

### Error: "NEXT_PUBLIC_BACKEND_URL is not set"
→ Create `.env.local` file with correct URL.

### Component not updating after API call
→ Make sure it's a Client Component (`"use client"`) and using useState/useEffect.

### Video call not loading
→ Check if `NEXT_PUBLIC_BACKEND_URL` is correct and Django is running.

### CORS errors
→ Configure CORS in Django `settings.py` to allow your frontend URL.

---

## ✨ You're Ready!

Your AgriVet frontend is now properly architected for direct Django integration.

**Key Principle**: Browser ↔ Django (NO Next.js API routes in between)

Happy coding! 🎉
