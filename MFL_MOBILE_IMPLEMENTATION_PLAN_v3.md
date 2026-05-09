# MFL React Native Mobile App — Implementation Plan v3

## Context

The client wants the MFL web app (Next.js + Supabase + NextAuth) replicated as a production-grade mobile app (React Native + Expo), excluding admin features. The visual source of truth is the client's design prototype at `C:\Users\Neeraj\Downloads\MFL_App_v3_0_4 (1).html`. The mobile boilerplate exists at `C:\Users\Neeraj\Desktop\mfl-app` with Expo 54 + HeroUI Native + Uniwind. The web app lives at `C:\Users\Neeraj\Desktop\fix-mfl`.

**Non-negotiables from the user:**
- Production-grade architecture (SOLID, DRY, Clean Architecture)
- Design fidelity to the HTML prototype — every screen must pass a "same-feel" review
- No generic HeroUI-looking fallback screens
- Per-page Lottie assets for loading/empty/error states
- Design system is a first-class workstream, not polish
- Incremental web route migration (phase-by-phase, not batch)
- Both iOS + Android
- Razorpay React Native SDK for payments

---

## 1. Auth Contract (Exact Specification)

### 1.1 Dual-Token Architecture (Access + Refresh)

Mobile auth uses **short-lived access tokens** for API calls and **long-lived refresh tokens** for silent re-authentication. This is a deliberate departure from the web app's 365-day session — mobile Bearer tokens are higher risk if leaked (no cookie httpOnly/sameSite protections), so they must be short-lived.

#### Access Token

```typescript
// Payload shape — IMMUTABLE after Phase 0 launch
interface MobileAccessTokenPayload {
  // ---- identity ----
  id: string;               // users.user_id (UUID)
  email: string;             // users.email
  platform_role: 'admin' | 'user';

  // ---- versioning ----
  v: 1;                      // token schema version (bump on breaking change)
  iss: 'mfl-mobile';         // issuer — distinguishes from NextAuth tokens
  type: 'access';            // token type discriminator
  iat: number;               // issued-at (epoch seconds)
  exp: number;               // expiry (epoch seconds) — iat + 15 minutes
}
```

#### Refresh Token

```typescript
interface MobileRefreshTokenPayload {
  id: string;               // users.user_id (UUID)
  v: 1;
  iss: 'mfl-mobile';
  type: 'refresh';           // token type discriminator
  iat: number;
  exp: number;               // expiry — iat + 30 days
  jti: string;               // unique token ID (UUID) — for revocation
}
```

**Token Lifetimes:**

| Token | TTL | Storage (mobile) | Purpose |
|-------|-----|-------------------|---------|
| Access | **15 minutes** | In-memory (React state/context) | Sent as `Authorization: Bearer <token>` on every API call |
| Refresh | **30 days** | `expo-secure-store` (encrypted keychain/keystore) | Used only to obtain new access tokens via `/api/auth/mobile/refresh` |

**Why 15-minute access tokens:** If an access token is intercepted, the window of abuse is 15 minutes. The refresh token never leaves the device's secure hardware store and is only sent to the single `/refresh` endpoint over HTTPS.

**Signing:**
- Algorithm: `HS256`
- Secret: `process.env.MFL_MOBILE_JWT_SECRET` — a **separate secret** from `NEXTAUTH_SECRET`. This ensures that a compromise of one auth system does not compromise the other, and allows independent key rotation.
- Library: `jsonwebtoken` (already a dependency via `next-auth`)
- **New env var required**: `MFL_MOBILE_JWT_SECRET` must be generated (e.g., `openssl rand -base64 64`) and added to `.env` / Vercel environment.

**Refresh Flow (client-side):**

```
1. API call with access token → 401 (expired)
2. Client intercepts 401 in Axios response interceptor
3. Client calls POST /api/auth/mobile/refresh with refresh token
4. Server verifies refresh token, re-reads user from DB
5a. SUCCESS: Server returns { accessToken, refreshToken (rotated), user }
    → Client stores new refresh token in secure-store, updates access token in memory
    → Client retries the original failed request with new access token
5b. FAILURE (refresh token expired, user deactivated, token revoked):
    → Server returns 401
    → Client clears all tokens and navigates to login screen
```

**Critical:** The client attempts **exactly one** silent refresh on a 401. If the refresh itself returns 401, THEN the user is logged out. This prevents transient auth mismatches from causing unnecessary forced logouts.

**Refresh Token Rotation:** Every successful refresh issues a new refresh token and invalidates the old one (by `jti`). This limits the damage window if a refresh token is somehow extracted from secure storage.

**Revocation:** A `revoked_refresh_tokens` check is needed. Options (in order of simplicity):
1. **Stateless rotation** (Phase 0): Store the latest `jti` per user in the `users` table column `latest_refresh_jti`. On refresh, reject if `jti !== users.latest_refresh_jti`. No new table needed.
2. **Blocklist table** (if needed later): `mobile_revoked_tokens(jti, revoked_at)` with TTL cleanup.

Phase 0 uses option 1 (stateless rotation via `users.latest_refresh_jti`).

**Verification (server-side):**

```typescript
// In get-auth-user.ts
import jwt from 'jsonwebtoken';

const MOBILE_SECRET = process.env.MFL_MOBILE_JWT_SECRET!;

function verifyMobileAccessToken(token: string): MobileAccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, MOBILE_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mfl-mobile',
    }) as MobileAccessTokenPayload;
    if (payload.v !== 1) return null;
    if (payload.type !== 'access') return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyMobileRefreshToken(token: string): MobileRefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, MOBILE_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mfl-mobile',
    }) as MobileRefreshTokenPayload;
    if (payload.v !== 1) return null;
    if (payload.type !== 'refresh') return null;
    return payload;
  } catch {
    return null;
  }
}
```

### 1.2 Normalized AuthUser Shape

The shared `getAuthUser(req)` helper returns this shape regardless of source (NextAuth cookie OR mobile Bearer token):

```typescript
interface AuthUser {
  id: string;               // users.user_id
  email: string;
  platform_role: 'admin' | 'user';
  source: 'nextauth' | 'mobile';  // for audit/debugging
}
```

This is the ONLY shape API routes receive. No route accesses raw session or raw JWT.

### 1.3 get-auth-user.ts Implementation

```typescript
// src/lib/auth/get-auth-user.ts
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  // 1. Check Bearer token first (mobile)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // Skip if it matches CRON_SECRET (cron jobs use Bearer too)
    if (token === process.env.CRON_SECRET) return null;
    const payload = verifyMobileAccessToken(token);
    if (payload) {
      return {
        id: payload.id,
        email: payload.email,
        platform_role: payload.platform_role,
        source: 'mobile',
      };
    }
    return null; // Invalid/expired Bearer = reject (don't fall through to cookie)
    // The mobile client handles 401 by attempting a refresh — see §1.1 Refresh Flow
  }

  // 2. Fall back to NextAuth session (web)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: String(session.user.id),
    email: String(session.user.email),
    platform_role: (session.user as any).platform_role || 'user',
    source: 'nextauth',
  };
}
```

### 1.4 Mobile Auth Endpoints

| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/auth/mobile/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, user: AuthUser }` | bcrypt.compare against users.password_hash. Sets `users.latest_refresh_jti`. |
| `/api/auth/mobile/google` | POST | `{ idToken }` | `{ accessToken, refreshToken, user: AuthUser, isNewUser }` | Verify with Google tokeninfo, lookup/create user. Sets `users.latest_refresh_jti`. |
| `/api/auth/mobile/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken, user: AuthUser }` | Verifies refresh token + checks `jti === users.latest_refresh_jti`. Re-reads user from DB. Issues rotated refresh token (new jti). Returns 401 if token expired, revoked, or user deactivated. |
| `/api/auth/mobile/logout` | POST | `{ refreshToken }` | `{ success: true }` | Clears `users.latest_refresh_jti` to revoke all refresh tokens for this user. |

**Axios Interceptor (mobile client):**
```typescript
// src/core/api/interceptors.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const { accessToken } = await authService.refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — force logout
        authService.logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Web Auth Drift — Resolution Plan

### 2.1 Identified Drift Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| D1 | **Dual auth config** — `config.ts` has 365-day session, `[...nextauth]/route.ts` has 30-day session + no DB sync | `src/lib/auth/config.ts` vs `src/app/api/auth/[...nextauth]/route.ts` | Routes importing from wrong location get different session TTL |
| D2 | **Missing authOptions** — pricing route calls `getServerSession()` without authOptions | `src/app/api/leagues/pricing/route.ts` | Session shape may lack `id` field, falls back to `sub` |
| D3 | **ID field inconsistency** — some routes use `session.user.id`, one uses `session.user.id \|\| session.user.sub` | Pricing route | May return wrong user identifier |
| D4 | **Type casting chaos** — `(session.user as any).id` vs `session?.user?.id` vs `session.user.id` | Throughout | No consistent null-safety |
| D5 | **JWT direct access** — complete-profile route uses `getToken()` instead of `getServerSession()` | `src/app/api/auth/complete-profile/route.ts` | Different auth path, different field access |
| D6 | **Unused token fields** — `phone`, `profile_picture_url`, `name`, `needsProfileCompletion` defined in config but never accessed by API routes | `src/lib/auth/config.ts` | Bloat, false expectations |

### 2.2 Phase 0 Drift Fixes (before mobile work begins)

These are scoped, low-risk fixes:

1. **Canonicalize auth config**: Ensure `[...nextauth]/route.ts` imports from `config.ts` (no inline overrides). Verify both use the same `authOptions` object.

2. **Fix pricing route**: Pass `authOptions` to `getServerSession(authOptions)`.

3. **Fix complete-profile route**: If it needs to also support mobile, migrate to `getAuthUser(req)`.

4. **Do NOT**: Remove unused fields from JWT (they're harmless and may be used by frontend). Do NOT refactor all type casts (too broad, not our scope).

### 2.3 Route Migration Is Additive, Not Destructive

Each route migration is a **backward-compatible** change:
```typescript
// BEFORE (web-only)
const session = await getServerSession(authOptions as any);
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = session.user.id;

// AFTER (web + mobile)
const authUser = await getAuthUser(req);
if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = authUser.id;
```

The web app continues to work identically because `getAuthUser` falls back to `getServerSession` when no Bearer token is present.

---

## 3. Route Migration Matrix (Phase-by-Phase)

### Legend
- **1-line**: Route only uses `session.user.id` → swap to `getAuthUser(req).id`
- **Moderate**: Route uses ID + does role/membership lookups (all via DB, not session)
- **Complex**: Route has extensive business logic or uses non-standard auth patterns
- **None**: Public endpoint, no auth needed

### Phase 1: Auth & Core (5 routes)

| Route | Methods | Auth Complexity | Session Fields | Non-Trivial Notes |
|-------|---------|----------------|----------------|-------------------|
| `POST /api/auth/send-otp` | POST | **None** | N/A | Public — no migration needed |
| `POST /api/auth/verify-otp` | POST | **None** | N/A | Public — no migration needed |
| `POST /api/auth/create-user` | POST | **None** | N/A | Public — no migration needed |
| `POST /api/auth/complete-profile` | POST | **Complex** | Uses `getToken()` not `getServerSession()` | Must rewrite to use `getAuthUser(req)` — currently reads raw JWT via `getToken()` |
| `POST /api/auth/refresh-profile` | POST | **1-line** | `session.user.id` | Standard swap |

### Phase 2: MVP (25 routes)

| Route | Methods | Auth Complexity | Non-Trivial Notes |
|-------|---------|----------------|-------------------|
| `GET /api/user/profile` | GET, PATCH | **1-line** | — |
| `GET /api/user/leagues` | GET | **1-line** | — |
| `GET /api/user/dashboard-summary` | GET | **1-line** | — |
| `GET /api/user/payments` | GET | **1-line** | — |
| `GET /api/user/rejected-submissions` | GET | **1-line** | — |
| `GET /api/dashboard/leagues` | GET | **1-line** | — |
| `GET /api/leagues` | GET | **1-line** | — |
| `GET /api/leagues/[id]` | GET, PATCH | **1-line** | — |
| `GET /api/leagues/[id]/members` | GET | **1-line** | — |
| `GET /api/leagues/[id]/leaderboard` | GET | **1-line** | Auth check only, delegates to service |
| `GET /api/leagues/[id]/activities` | GET | **1-line** | — |
| `GET /api/leagues/[id]/activity-minimums` | GET | **1-line** | — |
| `GET /api/leagues/[id]/dashboard-summary` | GET | **Moderate** | Aggregates per-user stats |
| `GET /api/leagues/[id]/my-submissions` | GET | **Moderate** | Resolves league_member_id from user_id |
| `POST /api/entries/upsert` | POST | **Complex** | 700+ lines. RR calculation, frequency limits, timezone handling, proof requirements. Auth is 1-line but must test thoroughly — this is the highest-risk route |
| `POST /api/entries/preview-rr` | POST | **Moderate** | Delegates to RR calculator service |
| `POST /api/upload/proof` | POST | **1-line** | multipart/form-data with Bearer token |
| `POST /api/upload/profile-picture` | POST | **1-line** | — |
| `POST /api/payments/order` | POST | **1-line** | — |
| `POST /api/payments/verify` | POST | **1-line** | — |
| `GET /api/tiers/preview-price` | GET | **None** | Public endpoint — no auth |
| `GET /api/leagues/[id]/teams` | GET | **1-line** | — |
| `GET /api/leagues/[id]/teams/[teamId]` | GET | **1-line** | — |
| `GET /api/leagues/[id]/teams/[teamId]/members` | GET | **1-line** | — |
| `GET /api/leagues/[id]/roles` | GET | **1-line** | — |

**Summary Phase 2**: 25 routes. 20 are 1-line swaps. 3 moderate. 1 complex (`entries/upsert`). 1 public (no change).

### Phase 3: P1 Features (~18 routes)

| Route | Methods | Auth Complexity | Non-Trivial Notes |
|-------|---------|----------------|-------------------|
| `POST /api/leagues` | POST | **Moderate** | League creation — user becomes host |
| `POST /api/leagues/[id]/launch` | POST | **Moderate** | Host-only action |
| `POST /api/leagues/[id]/join` | POST | **Moderate** | Creates membership record |
| `POST /api/leagues/join-by-code` | POST | **Moderate** | Similar to join |
| `GET /api/leagues/[id]/challenges` | GET, POST | **Moderate** | Role check for creation |
| `GET /api/leagues/[id]/challenges/[cid]` | GET, PATCH | **Moderate** | — |
| `GET /api/leagues/[id]/challenges/[cid]/submissions` | GET | **Moderate** | — |
| `GET /api/leagues/[id]/challenges/[cid]/leaderboard` | GET | **1-line** | — |
| `POST /api/challenge-submissions/[id]/validate` | POST | **Moderate** | Host/Governor only |
| `GET /api/leagues/[id]/messages` | GET, POST | **Moderate** | Role-based visibility |
| `POST /api/leagues/[id]/messages/read` | POST | **1-line** | — |
| `GET /api/leagues/[id]/messages/unread-count` | GET | **1-line** | — |
| `POST /api/leagues/[id]/messages/reactions` | POST | **1-line** | — |
| `GET /api/leagues/[id]/rest-day-donations` | GET, POST | **Moderate** | Membership check |
| `GET /api/leagues/[id]/rest-days` | GET | **Moderate** | — |
| `GET /api/leagues/[id]/rules` | GET, POST | **1-line** | — |
| `GET /api/custom-activities` | GET, POST | **Moderate** | — |
| `POST /api/upload/challenge-proof` | POST | **1-line** | multipart/form-data |

**Summary Phase 3**: 18 routes. 6 are 1-line. 12 moderate. 0 complex.

### Phase 4: P2 Features (~8 routes)

| Route | Methods | Auth Complexity | Non-Trivial Notes |
|-------|---------|----------------|-------------------|
| `GET /api/leagues/[id]/ai-coach` | GET, POST | **Moderate** | Mistral API call, rate limiting (20 Q/day) |
| `GET /api/leagues/[id]/ai-coach/chat-history` | GET | **1-line** | — |
| `POST /api/leagues/[id]/ai-motivate` | POST | **Moderate** | — |
| `GET /api/leagues/[id]/analytics` | GET | **Complex** | Uses Next.js `unstable_cache` (10-min TTL) for server-side caching. Mobile calls this endpoint normally — the server-side cache applies to all callers equally. Complexity is in the heavy computation, not the caching. Mobile client adds TanStack Query caching on top (staleTime: 10 min to match server). |
| `POST /api/leagues/[id]/report` | POST | **Moderate** | Host-only report generation |
| `POST /api/leagues/[id]/host-digest` | POST | **Moderate** | Host-only |
| `GET /api/leagues/[id]/governor` | GET | **Moderate** | Governor dashboard data |
| `GET /api/leagues/[id]/submissions` | GET | **Moderate** | Governor/host view of all submissions |

**Summary Phase 4**: 8 routes. 1 is 1-line. 6 moderate. 1 complex (analytics — heavy computation, server-side cached via `unstable_cache`).

### Total Migration Effort

| Phase | Total Routes | 1-Line | Moderate | Complex | Public |
|-------|-------------|--------|----------|---------|--------|
| 1 | 5 | 1 | 0 | 1 | 3 |
| 2 | 25 | 20 | 3 | 1 | 1 |
| 3 | 18 | 6 | 12 | 0 | 0 |
| 4 | 8 | 1 | 6 | 1 | 0 |
| **Total** | **56** | **28** | **21** | **3** | **4** |

---

## 4. Platform Constraints

### 4.1 Expo Go vs Dev Builds (CRITICAL)

**The following features REQUIRE Expo dev builds (EAS Build) and WILL NOT work in Expo Go:**

| Feature | Native Module | Why |
|---------|--------------|-----|
| Secure token storage | `expo-secure-store` | Native keychain/keystore access |
| Persistent storage | `react-native-mmkv` | JSI native module |
| Payments | `react-native-razorpay` | Native Razorpay SDK bridge |
| Camera | `expo-camera` | Hardware access |
| Push notifications | `expo-notifications` | APNs/FCM native integration |
| Google Sign-In | `expo-auth-session` | System browser + deep link callback |
| Image manipulation | `expo-image-manipulator` | Native image processing |

**Implication**: From Phase 1 onward, all development and testing MUST use EAS dev builds, not Expo Go. The boilerplate's current in-memory storage and mock auth are Expo Go compatible but will be replaced.

**EAS Build setup required in Phase 0:**
```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

### 4.2 iOS-Specific Constraints
- Apple Developer account required for TestFlight / App Store
- Camera/photo library permission descriptions in `app.json` (already configured in boilerplate)
- **Razorpay on iOS**: Apple may require In-App Purchase for digital goods. MFL leagues are "real-world fitness services" — Razorpay should be acceptable, but this must be validated with Apple's guidelines before App Store submission.

### 4.3 Android-Specific Constraints
- `edgeToEdgeEnabled: true` (already set in boilerplate)
- POST_NOTIFICATIONS permission for Android 13+ (already configured)
- Razorpay Android SDK integration via `react-native-razorpay`

---

## 5. Design System — First-Class Workstream

### 5.1 Visual Source of Truth

The HTML prototype at `C:\Users\Neeraj\Downloads\MFL_App_v3_0_4 (1).html` defines:

**Screens (5 main tabs + role mode + modal):**

| Tab | Sub-Tabs | Key Components |
|-----|----------|----------------|
| **Activity** | Today, Stats, Guide | Greeting header, sync detection card, log CTA, streak dots (14-day), 4-stat strip, AI coach nudge, rank cards, weekly bar chart, completion bars, activity list with minimums |
| **Challenges** | Active, Rules, Done | Points summary (individual + team), challenge cards with progress bar + proof submission, challenge rules sections, completed challenge list |
| **Team** | Roster, Chat, Captain DM, Badges | Team header card (dark bg), member list with avatars/streaks/logged status, chat thread with suggested prompts, captain DM, badge grid (2x2) |
| **League** | Leaderboard, League Life | Period selector dropdown, team ranking cards (expandable to player rows), 4-stat grid, completion by team, season timeline |
| **Coach** | Insights, Chat, Profile | Goals progress bars, today's insight + suggestion, AI chat with header, radar chart (motivation genome), survey form |
| **Governor** | (single view) | Governor header (dark bg), team health bars, at-risk player cards + nudge, quick actions |
| **Log Modal** | (bottom sheet) | Synced workouts detection, workout selection, manual entry (type chips + duration stepper) |

**Design Tokens (from prototype):**
```
ink: '#0F172A'       inkLight: '#F1F5F9'
brand: '#00C48C'     brandLight: '#ECFDF5'
accent: '#1B4F8A'    accentLight: '#EFF6FF'
danger: '#DC2626'    dangerLight: '#FEF2F2'
amber: '#D97706'     amberLight: '#FFFBEB'
surface: '#F8FAFC'   card: '#FFFFFF'
border: '#E2E8F0'    text: '#0F172A'
textSub: '#475569'   textMuted: '#94A3B8'
```

**Typography:**
- Primary: Inter (400, 500, 600, 700, 800, 900)
- Numeric: SF Mono / Fira Code (monospace for stats, points, ranks)
- Card radius: 16px
- Button radius: 12px
- Tag radius: 8px

**Design Primitives (from prototype, must be recreated as RN components):**
- `Avatar` — Circular colored initials with active border
- `ProgressBar` — Rounded bar with configurable height/color
- `Tag` — Inline badge/chip (bg + color + text)
- `SectionLabel` — Uppercase muted label with optional CTA link
- `CardContainer` — White card with border-radius 16, subtle shadow
- `SubTabs` — Pill-style sub-tab switcher (gray bg, white active)
- `StreakDots` — 14-day activity dot row with "NOW" indicator
- `ChatThread` — Message bubbles + suggested prompts + input
- `BottomSheet` — Modal from bottom with drag handle
- `StatCard` — Monospace number + label (used in grids)

### 5.2 Design System as Phase 1 Deliverable

The design system is NOT a polish task — it is a Phase 1 blocking deliverable.

**Phase 1 includes creating `src/shared/components/design-system/`:**

```
src/shared/components/design-system/
├── tokens.ts                # Color palette, spacing, radii, shadows from prototype
├── typography.ts            # Font families, sizes, weights (Inter + monospace)
├── primitives/
│   ├── avatar.tsx           # Av from prototype
│   ├── progress-bar.tsx     # Bar from prototype
│   ├── tag.tsx              # Tag from prototype
│   ├── section-label.tsx    # Lbl from prototype
│   ├── card.tsx             # Cs from prototype (white card + shadow)
│   ├── sub-tabs.tsx         # SubTabs from prototype
│   ├── stat-card.tsx        # Monospace stat with label
│   ├── separator.tsx        # Sep from prototype
│   ├── button.tsx           # Btn from prototype (primary/ghost/disabled)
│   └── index.ts             # Barrel export
├── patterns/
│   ├── streak-dots.tsx      # 14-day streak visualization
│   ├── chat-thread.tsx      # Message list + input + suggestions
│   ├── bottom-sheet-modal.tsx # Log modal pattern
│   ├── dark-header-card.tsx # Team/Governor/Coach header (dark bg)
│   ├── member-row.tsx       # Team member row with avatar + stats
│   └── index.ts
└── lottie/
    └── README.md            # Requirements for per-page Lottie assets
```

**Every component in this directory must be derived from the prototype — not from HeroUI defaults.**
HeroUI Native provides structural primitives (gesture handling, animations, portal, keyboard). The design-system layer wraps them with MFL-specific styling that matches the prototype.

### 5.3 Per-Page Lottie Requirements

**Each page/screen gets ONE dedicated Lottie animation file.** That single animation is reused across all 3 states (loading, empty, error) for that page. The states differ only in the **text message** and **action button** shown beneath the animation — the animation itself is the same.

This means:
- `activity-today` has ONE Lottie file (e.g., a jogging person) shown whether the page is loading, has no data, or hit an error
- The `ScreenState` component controls the **message** ("Loading your activity...", "No activity logged today", "Something went wrong") and the **action** (none, CTA button, retry button)
- This is intentional: each page's animation acts as its visual identity/mascot, not a literal representation of the state

| Screen | Lottie Animation | Theme |
|--------|-----------------|-------|
| Activity - Today | Person jogging/running | Activity/movement |
| Activity - Stats | Bar chart growing | Data/analytics |
| Activity - Guide | Open book with pages | Learning/guide |
| Challenges - Active | Target with arrow hitting | Goals/targets |
| Challenges - Done | Confetti burst | Celebration |
| Team - Roster | Group of people | Teamwork |
| Team - Chat | Chat bubbles floating | Communication |
| Team - Badges | Star spinning/medal | Achievement |
| League - Leaderboard | Winners podium | Competition |
| League - League Life | Timeline/calendar | History |
| Coach - Insights | Lightbulb moment | Insights |
| Coach - Chat | Robot waving | AI assistant |
| Coach - Profile | Radar/profile shape | Identity |
| Governor Dashboard | Shield/crown | Authority |
| Dashboard (main) | Home/house | Home base |
| Submissions | Paper with checkmark | Documents |
| Payments | Wallet/coins | Finance |
| Profile | User silhouette | Identity |

**Lottie assets stored as ONE file per screen:**
```
assets/lottie/activity-today.json
assets/lottie/activity-stats.json
assets/lottie/activity-guide.json
assets/lottie/challenges-active.json
... (one file per screen, NOT three files per screen)
```

**Implementation**: A shared `ScreenState` component:
```typescript
// src/shared/components/design-system/patterns/screen-state.tsx
interface ScreenStateProps {
  screen: string;          // e.g., 'activity-today' → loads assets/lottie/activity-today.json
  state: 'loading' | 'empty' | 'error';
  message?: string;        // State-specific message shown below the animation
  actionLabel?: string;    // Optional button text (e.g., "Retry", "Log Activity")
  onAction?: () => void;   // Button press handler
}

// The component:
// 1. Loads the SINGLE Lottie file for the given screen
// 2. Plays it on loop (loading) or plays once and holds last frame (empty/error)
// 3. Renders the state-specific message text below the animation
// 4. Renders an optional action button (retry for error, CTA for empty)
```

### 5.4 "Same-Feel" Review Gate

Every new screen implementation must pass this checklist before being accepted:
1. Side-by-side comparison with HTML prototype screenshot
2. Color tokens match (no hardcoded hex values — use design-system tokens)
3. Typography matches (Inter for text, monospace for numbers)
4. Card styling matches (radius, shadow, padding)
5. Spacing is consistent with prototype
6. Lottie assets are integrated for loading/empty/error
7. No HeroUI default styling visible (all wrapped in design-system primitives)

---

## 6. Architecture (unchanged from v1, condensed)

### Folder Structure

```
mfl-app/
├── app/                              # Expo Router screens (thin)
│   ├── _layout.tsx                   # Root providers
│   ├── index.tsx                     # Auth check → redirect
│   ├── (auth)/                       # login, signup, verify-otp, forgot-password, reset-password, complete-profile
│   ├── (main)/                       # AuthGuard wrapper
│   │   ├── (tabs)/                   # 5 tabs: activity, challenges, team, league, coach
│   │   ├── leagues/[id]/             # League-scoped screens
│   │   │   └── challenges/[challengeId].tsx
│   │   ├── governor/                 # Governor mode screens
│   │   ├── profile/, payments/, invite/[code], settings, notifications, help
│   └── +not-found.tsx
├── src/
│   ├── core/                         # API client, auth, storage, config, errors, analytics
│   ├── features/                     # 14 feature modules, each with types/{dto,model}, mappers/, services/, hooks/, components/
│   │   │                             # (auth, dashboard, leagues, submissions, validation, leaderboard, team, messages, challenges, payments, profile, rest-days, ai-coach, notifications)
│   ├── shared/
│   │   ├── components/
│   │   │   └── design-system/        # ← FIRST-CLASS (tokens, primitives, patterns, lottie)
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── contexts/                     # league-context, role-context, theme-context
│   └── theme/
├── lib/                              # HeroUI Native (pre-built, structural only)
├── themes/                           # Uniwind CSS themes
├── assets/
│   └── lottie/                       # Per-page Lottie assets
└── __tests__/
```

### Dependency Rules
- Screens → Feature Components → Feature Hooks → Feature Services → Core API Client
- Features NEVER import from other features (shared types only)
- Design-system primitives are the ONLY UI atoms used in feature components

### DTO → Mapper → Domain Model Isolation (MANDATORY)

**Problem this solves:** If the web backend API response shapes change during a future refactor (field renames, nesting changes, type changes), every mobile screen and hook that directly consumes the raw API response would break. This creates tight coupling between the mobile app and today's backend contract.

**Rule:** No feature hook, component, or screen may directly consume a raw API response. Every API response passes through a **mapper** that converts the raw **DTO** (Data Transfer Object — the exact shape the API returns) into a **domain model** (the shape the mobile app uses internally).

**Per-feature structure:**

```
src/features/leaderboard/
├── types/
│   ├── leaderboard.dto.ts      # Exact shape of API response (mirrors backend)
│   ├── leaderboard.model.ts    # App-internal shape (what hooks/components use)
│   └── index.ts
├── mappers/
│   └── leaderboard.mapper.ts   # DTO → Model conversion (SINGLE place to update on API change)
├── services/
│   └── leaderboard.service.ts  # API calls, returns DTOs
├── hooks/
│   └── use-leaderboard.ts      # Calls service → maps DTO → returns Model
├── components/
│   └── ...                     # Only receives Model types as props
└── index.ts
```

**Example:**

```typescript
// leaderboard.dto.ts — mirrors backend response EXACTLY
interface LeaderboardEntryDTO {
  league_member_id: number;
  user_id: string;
  display_name: string;
  team_name: string;
  total_rr: number;
  rank: number;
  streak_days: number;
  profile_picture_url: string | null;
}

// leaderboard.model.ts — app-internal shape, decoupled from backend
interface LeaderboardEntry {
  memberId: number;
  userId: string;
  displayName: string;
  teamName: string;
  totalRR: number;
  rank: number;
  streakDays: number;
  avatarUrl: string | null;
}

// leaderboard.mapper.ts — the ONLY file that changes when API shape changes
export function toLeaderboardEntry(dto: LeaderboardEntryDTO): LeaderboardEntry {
  return {
    memberId: dto.league_member_id,
    userId: dto.user_id,
    displayName: dto.display_name,
    teamName: dto.team_name,
    totalRR: dto.total_rr,
    rank: dto.rank,
    streakDays: dto.streak_days,
    avatarUrl: dto.profile_picture_url,
  };
}

// use-leaderboard.ts — hook consumes Model, never DTO
export function useLeaderboard(leagueId: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard.byLeague(leagueId),
    queryFn: async () => {
      const dtos = await leaderboardService.getLeaderboard(leagueId);
      return dtos.map(toLeaderboardEntry);
    },
  });
}
```

**Enforcement rules:**
1. `*.dto.ts` files use `snake_case` field names (matching backend JSON)
2. `*.model.ts` files use `camelCase` field names (idiomatic TypeScript/React)
3. `*.mapper.ts` files are the **ONLY** place that references both DTO and Model types
4. Components and hooks **NEVER** import from `*.dto.ts` — only from `*.model.ts`
5. If the backend renames `total_rr` to `rr_score`, the fix is exactly one line in one mapper file — zero component changes

**When a backend API changes:**
1. Update the DTO type to match the new API response
2. Update the mapper function
3. Done. No hooks, components, or screens change.

This boundary is non-negotiable for every feature module. It is the explicit mechanism that prevents web refactors from rippling through mobile.

### State Management
- **Auth**: React Context (token in expo-secure-store, user in MMKV)
- **League/Role**: React Context (hydrated from API, persisted in MMKV)
- **Server data**: TanStack Query (query key factory, per-type stale times)
- **Forms**: react-hook-form + Zod
- **UI**: useState

---

## 7. Revised Implementation Phases & Timeline

### Phase 0: Web Auth Bridge + EAS Setup (4 days)

**Web app changes (C:\Users\Neeraj\Desktop\fix-mfl):**
- [ ] Fix drift: Ensure `[...nextauth]/route.ts` imports from `config.ts`, fix pricing route auth
- [ ] Generate `MFL_MOBILE_JWT_SECRET` and add to `.env` + Vercel environment variables
- [ ] Add `latest_refresh_jti` column to `users` table (nullable UUID, for refresh token rotation)
- [ ] Create `src/lib/auth/get-auth-user.ts` (shared auth helper with `verifyMobileAccessToken`)
- [ ] Create `POST /api/auth/mobile/login` (email/password → access token + refresh token)
- [ ] Create `POST /api/auth/mobile/google` (Google ID token → access token + refresh token)
- [ ] Create `POST /api/auth/mobile/refresh` (refresh token rotation, re-read user from DB)
- [ ] Create `POST /api/auth/mobile/logout` (revoke refresh token by clearing `latest_refresh_jti`)
- [ ] Migrate Phase 1 auth routes to use `getAuthUser()` (complete-profile, refresh-profile)
- [ ] Test with curl: login → get tokens → call /api/user/profile with access token → wait for expiry → refresh → retry

**Mobile app setup (C:\Users\Neeraj\Desktop\mfl-app):**
- [ ] Create `eas.json` configuration
- [ ] Run first EAS dev build (iOS Simulator + Android Emulator)
- [ ] Install native dependencies: expo-secure-store, react-native-mmkv, expo-camera, expo-image-picker, react-native-razorpay
- [ ] Verify dev build boots and runs

**Deliverable**: Bearer token auth works end-to-end via curl. EAS dev build boots.

**Risk**: `expo-secure-store` or `react-native-mmkv` may have build issues with Expo 54 + new architecture. Budget 1 day for native module troubleshooting.

### Phase 1: Design System + Core Infrastructure (7 days)

**Design System (3 days):**
- [ ] Create `src/shared/components/design-system/tokens.ts` from prototype color/typography/spacing
- [ ] Build all primitives: Avatar, ProgressBar, Tag, SectionLabel, Card, SubTabs, StatCard, Separator, Button
- [ ] Build patterns: StreakDots, ChatThread, BottomSheetModal, DarkHeaderCard, MemberRow
- [ ] Create ScreenState component for Lottie loading/empty/error
- [ ] Source initial Lottie assets (can use LottieFiles.com placeholders, replace with custom later)
- [ ] Create a design-system showcase/storybook screen for visual QA

**Core Infrastructure (4 days):**
- [ ] Core API client (Axios + interceptors + error handler)
- [ ] Auth module (auth-provider, auth-store, auth-service, auth-guard)
- [ ] Storage (MMKV instance + secure-store wrapper)
- [ ] Config (typed env vars, constants, query-client, query-keys)
- [ ] Providers composition (app-providers.tsx)
- [ ] Navigation skeleton (auth group + main group with 5 tabs + drawer + stack)
- [ ] Error boundary with Lottie error state
- [ ] Install remaining deps: axios, zod, react-hook-form, @hookform/resolvers, date-fns, lottie-react-native, @react-native-community/netinfo

**Deliverable**: Login flow works e2e. Design-system showcase screen shows all primitives matching prototype.

### Phase 2: MVP Features (16 days)

**Web route migration**: Migrate 25 routes (Phase 2 batch from matrix above).

**Sprint 2a (5d): Activity tab + Dashboard**
- [ ] Activity - Today tab (greeting, sync card, log CTA, streak dots, stat strip, coach nudge)
- [ ] Activity - Stats tab (rank cards, weekly bar chart, completion bars)
- [ ] Activity - Guide tab (activity list with minimums, rules, pro tip)
- [ ] Log Modal (bottom sheet with workout selection + manual entry)
- [ ] Dashboard/league list with league switcher
- [ ] LeagueContext + RoleContext

**Sprint 2b (5d): Submissions + Leaderboard**
- [ ] Submit workout flow (activity picker → effort input → proof camera/upload → RR preview → confirm)
- [ ] My submissions list with status badges
- [ ] Submission validation (approve/reject for captains+) with proof viewer
- [ ] League tab - Leaderboard (team ranking + expandable player rows + period selector)

**Sprint 2c (6d): Team + Profile + Payments**
- [ ] Team tab - Roster (dark header card, member list)
- [ ] Team tab - Chat (chat thread with suggested prompts)
- [ ] Team tab - Badges (2x2 grid)
- [ ] Profile view/edit + avatar picker
- [ ] Change password
- [ ] Razorpay payment flow (league join/creation)
- [ ] League tab - League Life (stats grid, completion by team, season timeline)

**Deliverable**: User can login, see leagues, submit workout, see leaderboard, view team, pay for league. All screens match prototype.

### Phase 3: P1 Features (12 days)

**Web route migration**: Migrate ~18 routes (Phase 3 batch).

**Sprint 3a (4d): League Creation + Challenges**
- [ ] League creation wizard (multi-step form)
- [ ] Tier selection + pricing preview
- [ ] Challenges tab - Active (challenge cards with progress + proof submit)
- [ ] Challenges tab - Rules (challenge detail)
- [ ] Challenges tab - Done (completed list)

**Sprint 3b (4d): Messaging + Coach**
- [ ] Team tab - Captain DM (private chat)
- [ ] In-league messaging (messages screen within league)
- [ ] Read receipts + reactions
- [ ] Coach tab - Insights (goals, today's insight)
- [ ] Coach tab - Chat (AI chat with suggested prompts)
- [ ] Coach tab - Profile (radar chart, survey)

**Sprint 3c (4d): Rest Days + Rules + Custom Activities + Governor**
- [ ] Rest day viewing + donation form
- [ ] Rules viewer
- [ ] Custom activities list
- [ ] Governor Dashboard (dark header, team health, at-risk, quick actions)
- [ ] Role switching (player ↔ governor in top bar)

**Deliverable**: Full feature parity for P1 features. Governor mode works.

### Phase 4: P2 Features + Polish (10 days)

**Web route migration**: Migrate ~8 routes (Phase 4 batch).

**Sprint 4a (4d): AI + Analytics + Reports**
- [ ] AI Coach full integration (Mistral via API)
- [ ] AI motivational messages
- [ ] League analytics (charts)
- [ ] League report viewer
- [ ] Host digest

**Sprint 4b (6d): Production Polish**
- [ ] Push notifications (expo-notifications + EAS)
- [ ] All per-page Lottie assets finalized (replace placeholders)
- [ ] Skeleton loaders for all screens
- [ ] Pull-to-refresh on all list screens
- [ ] Accessibility audit (screen reader labels, touch targets ≥ 44pt)
- [ ] Performance: FlashList for long lists, image caching
- [ ] Deep linking: `mfl://invite/{code}`, `mfl://league/{id}`, `mfl://reset-password`
- [ ] App icon, splash screen finalization
- [ ] Offline banner (network status detection)

### Phase 5: Testing + Release (5 days)

- [ ] Unit tests: hooks + services (Jest + React Native Testing Library)
- [ ] Integration tests: login → submit workout → validate → leaderboard update
- [ ] E2E tests: Maestro for happy paths
- [ ] EAS Build profiles: dev, preview, production
- [ ] TestFlight (iOS) + Internal testing track (Android)
- [ ] App store metadata + screenshots

### Timeline Summary

| Phase | Days | Cumulative | Deliverable |
|-------|------|-----------|-------------|
| 0: Auth bridge + EAS | 4 | 4 | Bearer auth works, dev build boots |
| 1: Design system + core | 7 | 11 | Login works, design showcase matches prototype |
| 2: MVP | 16 | 27 | Core user flows work e2e |
| 3: P1 features | 12 | 39 | Full feature set minus AI/analytics |
| 4: P2 + polish | 10 | 49 | Feature-complete, production-polished |
| 5: Testing + release | 5 | 54 | Store-ready builds |
| **Total** | **54 days (~11 weeks)** | | |

### Timeline Justification

The original estimate of 48 days was aggressive. Revised to 54 days because:
1. **Design system as first-class workstream** adds 3 days to Phase 1 (was implicit before)
2. **Per-page Lottie assets** adds 2 days for sourcing/integration across Phase 1 and 4b
3. **"Same-feel" review** adds buffer to each sprint (1 day total across phases)
4. **EAS build setup** and native module troubleshooting adds 1 day to Phase 0

The scope is genuinely large: 5 tabs × 2-4 sub-tabs each = 15+ unique views, plus governor mode, log modal, auth screens, profile, payments, settings. Each view has loading/empty/error Lottie states. Role-based conditional rendering adds complexity to every screen.

**Dependency risks that could extend timeline:**
- Razorpay RN SDK compatibility with Expo 54 new architecture (test in Phase 0)
- Apple App Store Razorpay policy (research in Phase 0, decide before Phase 2c)
- Complex `entries/upsert` route (700+ lines) may surface edge cases when tested via mobile

---

## 8. Assumptions, Risks & Open Questions

### Assumptions
1. Web app remains deployed on Vercel with stable API routes during mobile development
2. Supabase database schema does not change during mobile development
3. `MFL_MOBILE_JWT_SECRET` (separate from `NEXTAUTH_SECRET`) is used to sign/verify mobile JWTs — isolates mobile auth from web auth
4. HeroUI Native + Uniwind are stable (structural use only, visual styling overridden by design system)
5. EAS Build is available for both iOS and Android dev builds

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Razorpay RN SDK doesn't work with Expo 54 new arch | Blocked payments | Test in Phase 0; fallback: WebView-based payment page |
| Apple rejects Razorpay for digital goods | Can't ship iOS payments | Research Apple guidelines in Phase 0; MFL is real-world fitness (should qualify) |
| `entries/upsert` (700 lines) has hidden session assumptions | Broken submissions | Dedicated testing session for this route in Phase 2b |
| `analytics` route has heavy computation (~5s uncached) | Slow initial load for analytics screen | Server-side `unstable_cache` benefits all callers (web + mobile). Mobile adds TanStack Query staleTime (10 min). No mobile-specific workaround needed. |
| Lottie assets sourcing takes longer than planned | Delayed polish | Use LottieFiles placeholders early; commission custom assets in parallel |
| auth config drift causes intermittent failures | Flaky auth | Fix ALL identified drift issues in Phase 0 before mobile work begins |

### Open Questions for Reviewer
1. **Offline workout queueing**: Should the app queue submissions when offline? (Current plan: network-required, cached data shown offline)
2. **Push notification backend**: Build custom (notifications table + FCM/APNs) or use Expo Push Notifications service?
3. **Biometric auth**: Support fingerprint/Face ID for app unlock? (Post-MVP or skip?)
4. **App versioning**: Add `X-App-Version` header + minimum version check on server for forced updates?
5. **Custom Lottie assets**: Should we commission custom Lottie animations or use LottieFiles library?

---

## 9. Verification Plan

| Phase | Verification |
|-------|-------------|
| 0 | `curl -X POST .../api/auth/mobile/login -d '{"email":"...","password":"..."}' → get accessToken + refreshToken → `curl -H "Authorization: Bearer <accessToken>" .../api/user/profile` → returns user data → wait 15 min → 401 → `curl -X POST .../api/auth/mobile/refresh -d '{"refreshToken":"..."}' → new tokens → retry succeeds |
| 1 | Login flow on iOS Simulator + Android Emulator. Design-system showcase screen screenshot matches prototype side-by-side |
| 2 | Submit workout on mobile → appears in web app. Validate on mobile → leaderboard updates on web. Pay with Razorpay test mode |
| 3 | Create league → invite user → join → submit → validate → leaderboard. Governor mode shows at-risk players |
| 4 | AI coach responds. Push notification received. All Lottie states visible |
| 5 | All tests pass. EAS production build succeeds. TestFlight + Internal track deployed |

---

## 10. Critical Files Reference

**Web app (to modify):**
- `src/lib/auth/config.ts` — NextAuth config (audit for drift)
- `src/app/api/auth/[...nextauth]/route.ts` — Ensure imports from config.ts
- `src/app/api/leagues/pricing/route.ts` — Fix missing authOptions
- `src/app/api/auth/complete-profile/route.ts` — Rewrite getToken() to getAuthUser()
- `src/app/api/entries/upsert/route.ts` — Highest-risk route (700+ lines)
- `src/lib/rbac/permissions.ts` — Port to mobile for client-side role gating

**Design source of truth:**
- `C:\Users\Neeraj\Downloads\MFL_App_v3_0_4 (1).html` — ALL screens

**Mobile app (boilerplate):**
- `C:\Users\Neeraj\Desktop\mfl-app/src/app/_layout.tsx` — Root layout
- `C:\Users\Neeraj\Desktop\mfl-app/src/contexts/AuthContext.tsx` — Replace with production auth
- `C:\Users\Neeraj\Desktop\mfl-app/lib/index.tsx` — HeroUI components (structural use only)
