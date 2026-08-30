# AgriVet Frontend Architecture Guide

## 🏗️ Strict Architecture Rules

**ALL data operations must go directly from the browser to Django REST API. NO Next.js API routes.**

---

## ✅ CORRECT: Direct Django API Calls

```typescript
// ✅ Client Component calling Django directly
"use client";
import { getFarmerDashboard } from "@/lib/farmer-api";

export default function Dashboard() {
  useEffect(() => {
    // Direct call to Django backend
    const data = await getFarmerDashboard();
  }, []);
}
```

---

## ❌ WRONG: Using Next.js API Routes

```typescript
// ❌ DO NOT CREATE app/api/route.ts files
// ❌ DO NOT proxy requests through Next.js
export async function GET() {
  const res = await fetch("http://localhost:8000/api/...");
  return NextResponse.json(res);
}
```

---

## 📁 Project Structure

```
RealtimeKit-Frontend/
├── .env.local                       # Environment variables
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   ├── auth/
│   │   └── page.tsx               # Authentication page (Client Component)
│   ├── farmer/
│   │   ├── page.tsx              # Farmer home (Client Component)
│   │   └── dashboard/
│   │       └── page.tsx          # Farmer dashboard (Client Component)
│   ├── vet/
│   │   ├── page.tsx             # Vet home (Client Component)
│   │   └── dashboard/
│   │       └── page.tsx         # Vet dashboard (Client Component)
│   ├── guest/
│   │   └── page.tsx            # Guest consultation (Client Component)
│   └── [NO app/api/ FOLDER - DELETED]
│
├── components/
│   ├── AuthPanel.tsx              # Client Component
│   ├── FarmerDashboard.tsx        # Client Component
│   ├── VetDashboard.tsx           # Client Component
│   ├── VideoCall.tsx              # Client Component
│   └── guest/
│       └── GuestConsultationForm.tsx # Client Component
│
├── lib/
│   ├── api.ts                     # Core API utilities & base endpoints
│   ├── auth-api.ts               # Authentication endpoints
│   ├── farmer-api.ts             # Farmer-specific endpoints
│   ├── vet-api.ts                # Vet-specific endpoints
│   ├── meeting-api.ts            # Video call & meeting endpoints
│   └── guest-api.ts              # Guest request endpoints
│
└── hooks/
    ├── useAuth.ts               # Authentication hook
    └── useGuestRequestPolling.ts # Polling hook for guest requests
```

---

## 🔑 Environment Variables

**`.env.local` (Development)**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_STATIC_API_KEY=agrivet-secret-lifetime-key-2026
NODE_ENV=development
```

**`.env.production` (Production)**
```env
NEXT_PUBLIC_BACKEND_URL=https://api.agrivet.com/api
NEXT_PUBLIC_STATIC_API_KEY=agrivet-secret-lifetime-key-2026
NODE_ENV=production
```

---

## 📝 Implementation Patterns

### 1️⃣ Authentication Flow

**Step 1: Create Client Component**
```typescript
"use client";

import { userLogin } from "@/lib/auth-api";

export default function AuthPage() {
  const handleLogin = async (username: string, password: string) => {
    // ✅ Direct Django call
    const response = await userLogin({ username, password });
    if (response.access) {
      // Token saved to localStorage automatically
      router.push("/dashboard");
    }
  };
}
```

**Step 2: Access Token is Stored in localStorage**
- `userLogin()` automatically saves token via `saveAuth()`
- All subsequent requests include `Authorization: Bearer <token>`

**Step 3: Protected Pages Check Token**
```typescript
useEffect(() => {
  const auth = getStoredAuth();
  if (!auth?.access) {
    router.push("/auth");
  }
}, []);
```

---

### 2️⃣ Farmer Dashboard Flow

```typescript
"use client";

import { 
  getFarmerDashboard, 
  getFarmerProfile, 
  getConsultationHistory 
} from "@/lib/farmer-api";

export default function FarmerDashboard() {
  useEffect(() => {
    // ✅ All calls go directly to Django
    Promise.all([
      getFarmerDashboard(),    // GET /farmer/dashboard/
      getFarmerProfile(),      // GET /farmer/profile/
      getConsultationHistory() // GET /farmer/consultations/
    ]).then(([stats, profile, history]) => {
      // Update UI with data from Django
    });
  }, []);
}
```

---

### 3️⃣ Video Call Flow

```typescript
"use client";

import { 
  getMeetingCredentials, 
  getMeeting, 
  endMeeting 
} from "@/lib/meeting-api";

export default function VideoCall({ meetingId, role }) {
  useEffect(() => {
    // ✅ Get Dyte credentials from Django
    const credentials = await getMeetingCredentials(meetingId, role);
    
    // Initialize Dyte video client with credentials
    const dyte = await DyteClient.init({ 
      authToken: credentials.auth_token 
    });
    
    await dyte.joinRoom();
  }, []);

  const handleEndCall = async () => {
    // ✅ Update meeting status in Django
    await endMeeting(meetingId, "Consultation completed");
  };
}
```

---

### 4️⃣ Guest Consultation Request

```typescript
"use client";

import { submitGuestRequest, pollGuestRequest } from "@/lib/guest-api";

export default function GuestForm() {
  const handleSubmit = async (phone: string, problem: string) => {
    // ✅ Submit directly to Django
    const response = await submitGuestRequest(phone, problem);
    const requestId = response.request_id;
    
    // ✅ Poll Django for status updates
    const pollInterval = setInterval(async () => {
      const status = await pollGuestRequest(requestId);
      if (status.status === "MEETING_CREATED") {
        window.location.href = status.farmer_join_link;
        clearInterval(pollInterval);
      }
    }, 2000);
  };
}
```

---

## 🔐 Authentication Headers

All requests to Django automatically include:

```typescript
// Authorization Bearer Token
Authorization: Bearer <access_token_from_localStorage>

// Static API Key (if configured)
X-API-KEY: agrivet-secret-lifetime-key-2026

// Content Type for JSON
Content-Type: application/json
```

**Handled by `getAuthHeaders()` in `lib/api.ts`**

---

## 📊 API Service Modules

### `lib/api.ts` - Core Utilities
- `API_BASE_URL` - Base URL for all API calls
- `getStoredAuth()` - Retrieve token from localStorage
- `saveAuth()` - Store token in localStorage
- `getAuthHeaders()` - Get headers with Bearer token
- `fetchJson<T>()` - Generic fetch utility with error handling

### `lib/auth-api.ts` - Authentication
- `userLogin()` - POST /auth/login/
- `userSignup()` - POST /auth/signup/
- `refreshAccessToken()` - POST /auth/token/refresh/
- `getCurrentUser()` - GET /auth/user/
- `changePassword()` - POST /auth/password/change/

### `lib/farmer-api.ts` - Farmer Operations
- `getFarmerProfile()` - GET /farmer/profile/
- `getFarmerDashboard()` - GET /farmer/dashboard/
- `getFarmerLivestock()` - GET /farmer/livestock/
- `getFarmerRequests()` - GET /farmer/requests/
- `getConsultationHistory()` - GET /farmer/consultations/

### `lib/vet-api.ts` - Vet Operations
- `getVetProfile()` - GET /vet/profile/
- `getVetDashboard()` - GET /vet/dashboard/
- `getVetConsultations()` - GET /vet/consultations/
- `updateConsultationStatus()` - PATCH /vet/consultations/{id}/
- `getVetSchedule()` - GET /vet/schedule/

### `lib/meeting-api.ts` - Video Calls
- `createMeeting()` - POST /meeting/create/
- `getMeeting()` - GET /meeting/{id}/
- `getMeetingCredentials()` - POST /meeting/{id}/credentials/
- `startMeeting()` - PATCH /meeting/{id}/ (status=IN_PROGRESS)
- `endMeeting()` - PATCH /meeting/{id}/ (status=COMPLETED)
- `getMeetingRecording()` - GET /meeting/{id}/recording/

### `lib/guest-api.ts` - Guest Requests
- `submitGuestRequest()` - POST /guest/request/
- `getGuestRequest()` - GET /guest/request/{id}/
- `pollGuestRequest()` - GET /guest/request/{id}/poll/

---

## 🚫 What NOT to Do

### ❌ Never Create app/api/ Routes
```typescript
// DO NOT create this
export async function GET(request: NextRequest) {
  const data = await fetch("http://localhost:8000/...");
  return NextResponse.json(data);
}
```

### ❌ Never Store Tokens in Cookies via Next.js
```typescript
// DO NOT do this
response.cookies.set("auth_token", token);
```

### ❌ Never Call Next.js API from Components
```typescript
// DO NOT do this
const data = await fetch("/api/dashboard");
```

### ❌ Never Proxy Backend Calls
```typescript
// DO NOT do this
// Component calls /api/route → route.ts calls Django
// INSTEAD: Component calls Django directly
```

---

## ✅ Verification Checklist

Before deploying any component:

- [ ] Component starts with `"use client"` (if it uses hooks/state)
- [ ] All API calls use functions from `lib/` (auth-api, farmer-api, etc.)
- [ ] No imports from `next/api`, no `NextResponse`, no route handlers
- [ ] No `app/api/` directory or files
- [ ] Authentication token is stored in localStorage
- [ ] All requests include Bearer token via `getAuthHeaders()`
- [ ] Error handling uses `getErrorMessage()` utility
- [ ] Environment variables are correctly set in `.env.local`

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────┐
│  Browser / Client        │
│  (React Component)       │
└────────────┬─────────────┘
             │
             │ (Direct HTTPS/HTTP)
             │
             ├─ /lib/auth-api.ts
             ├─ /lib/farmer-api.ts
             ├─ /lib/vet-api.ts
             ├─ /lib/meeting-api.ts
             └─ /lib/guest-api.ts
             │
             │ (fetch with Bearer token)
             │
             ↓
┌─────────────────────────────────────┐
│  Django REST API Backend             │
│  (Django REST Framework)             │
│                                      │
│  - SimpleJWT Authentication          │
│  - PostgreSQL Database               │
│  - Dyte Video Integration            │
│  - Business Logic & Validation       │
└─────────────────────────────────────┘
```

---

## 🎯 Key Takeaway

**Frontend = UI Only**
- No business logic
- No database access
- No authentication logic
- No API proxying

**Backend = Everything Else**
- All authentication
- All data validation
- All database operations
- All video call management
- All business rules

---

*Last Updated: 2026-08-30*
*Architecture: Next.js (UI) + Django REST Framework (Backend)*
*Authentication: SimpleJWT Bearer Tokens*
*Database: PostgreSQL*
*Video Calls: Dyte API*
