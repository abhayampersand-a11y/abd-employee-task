# TaskFlow Mobile — Development Prompt (Expo + React Native)

> Paste this whole document back to start implementation.
> Build it phase by phase in the order given. Do not skip ahead.
> Companion to `docs/DEV-PROMPT.md`, which describes the web app this shares a backend with.

---

## 0. Context — what already exists

The web app (`my-app/`) is **built and working**: Next.js 16 App Router, Prisma 7 + Neon Postgres,
custom cookie-session auth, Redux Toolkit + RTK Query, Tailwind v4.

Your job is to build a **native mobile client** on top of the same backend — not a second backend,
not a WebView wrapper, not a redesign of the product.

**Reuse as-is — do not rewrite, do not fork:**

| What | Where | Note |
|---|---|---|
| API contract types | `lib/dto.ts` | `TaskDto`, `UserDto`, `MeDto`, `StatsDto`, `Paginated<T>` |
| Zod input schemas | `lib/validation.ts` | same schemas validate the mobile forms |
| Permission helpers | `lib/permissions.ts` | pure functions, no server imports |
| Formatting helpers | `lib/format.ts` | dates, relative time, initials |
| REST endpoints | `app/api/**/route.ts` | already role-aware and company-scoped |
| Nav model | `lib/nav.ts` | `employeeNavItems` maps 1:1 to the mobile tab bar |

**Never import into the mobile app:** anything under `lib/generated/prisma/`, `lib/prisma.ts`,
`lib/auth.ts`, `lib/api.ts`, or any file with `import "server-only"`. Prisma and bcrypt do not run
on a device, and they never should — the phone talks HTTP, nothing else.

**What must change on the server before the app can work** — this is Phase 1, not an afterthought.
Sessions today live in an `httpOnly` cookie set via `next/headers` (`lib/auth.ts:82`). Native apps
have no reliable cookie jar, so the same `Session` row must also be readable from a
`Authorization: Bearer` header. The `Session` table already stores a SHA-256 `tokenHash`
(`prisma/schema.prisma:87`), so this is an auth-transport change only — no data model change.

---

## 1. Locked stack — use exactly these

Everything native is installed with **`npx expo install`**, never `npm install` / `pnpm add`.
`expo install` pins the version that matches the installed SDK; a plain add will silently give you
a version the SDK cannot build.

| Layer | Choice | Package |
|---|---|---|
| Runtime | Expo SDK (latest stable) + React Native + TypeScript | `npx create-expo-app@latest` |
| Navigation | **Expo Router** (file-based, typed routes) | `expo-router` |
| Styling | **NativeWind v4** | `nativewind`, `tailwindcss` |
| Server state | **Redux Toolkit + RTK Query** | `@reduxjs/toolkit`, `react-redux` |
| Session storage | **expo-secure-store** (Keychain / Keystore) | `expo-secure-store` |
| Non-secret cache | AsyncStorage | `@react-native-async-storage/async-storage` |
| Forms | react-hook-form + zod resolver | `react-hook-form`, `@hookform/resolvers` |
| Validation | **zod** — the exact schemas from `lib/validation.ts` | `zod` |
| Lists | FlashList | `@shopify/flash-list` |
| Gestures | Gesture Handler + Reanimated | `react-native-gesture-handler`, `react-native-reanimated` |
| Sheets / modals | Bottom Sheet | `@gorhom/bottom-sheet` |
| Icons | **react-native-svg**, port the existing icon set | `react-native-svg` |
| Date picker | Community datetimepicker | `@react-native-community/datetimepicker` |
| Push | **expo-notifications** + device/constants | `expo-notifications`, `expo-device`, `expo-constants` |
| Splash / images | `expo-splash-screen`, `expo-image` | |
| Feedback | `expo-haptics`, `expo-clipboard` | copy-credentials parity with web |
| Connectivity | NetInfo | `@react-native-community/netinfo` |
| Build / OTA | **EAS Build + EAS Update** | `eas-cli` |
| Lint | `eslint-config-expo` | |
| Health check | `npx expo-doctor` | must be clean before every phase sign-off |

**Icons:** the web app deliberately has no icon library — 35 inline SVGs in `components/icons.tsx`.
Keep that decision. Port the same paths to `react-native-svg` `<Path>` so both clients look
identical. Do not add `@expo/vector-icons`.

### Where the project lives

Create the app as a **sibling** of `my-app/`, not inside it — Metro and the Next.js build must
never see each other's `node_modules`:

```
todo-task/
  my-app/      ← existing Next.js app (the backend)
  mobile/      ← new Expo app
```

Share types by generating a copy, not by reaching across the folder boundary. Add a script
`mobile/scripts/sync-contract.ts` that copies `dto.ts`, `validation.ts`, `permissions.ts`,
`format.ts` from `../my-app/lib/` into `mobile/src/contract/` and stamps a
`// GENERATED — do not edit. Run pnpm sync:contract.` header on each. Run it in `predev` and
`prebuild`. If a copied file ever fails to typecheck, the contract drifted — fix the source, re-sync.

---

## 2. The Expo Go question — read this before planning

Expo Go runs Phases 2–7 with zero build steps. It **cannot** run Phase 8.

- **Remote push notifications are not supported in Expo Go on Android** (removed in SDK 53), and
  are unreliable on iOS Expo Go. Local and scheduled notifications still work everywhere.
- Verify the current state in the Expo docs before you start Phase 8 — this policy has moved
  before and your training data is likely stale. Do not assume.

So the plan is:

| Phases | Runs on |
|---|---|
| 2–7 (auth, tasks, teams, offline, polish) | **Expo Go** — `npx expo start`, scan the QR |
| 8 (push notifications) onward | **Development build** — `eas build --profile development` |

A development build is still Expo, still fast refresh, still the same code. You install a custom
`.apk` / `.ipa` once and keep developing. Budget one EAS build before Phase 8 and do not try to
fake push in Expo Go — a locally scheduled notification proves nothing about server delivery.

---

## 3. Connecting a real phone to the dev server

`localhost` on the phone means the phone. Three things must line up:

1. **Base URL** — `EXPO_PUBLIC_API_URL` in `mobile/.env`, e.g. `http://192.168.1.14:3000`.
   Never hardcode it in a source file. Read it via `process.env.EXPO_PUBLIC_API_URL` and surface it
   on a debug screen so a wrong IP is diagnosable in two seconds.
2. **Next.js must listen on the LAN** — `next dev -H 0.0.0.0`, and Windows Firewall must allow
   inbound TCP 3000 for Node. This is the single most common "the app is stuck loading" cause.
3. **Cleartext HTTP** — plain `http://` to a LAN IP needs `usesCleartextTraffic` on Android and an
   ATS exception on iOS, **development profile only**. Production is HTTPS or nothing.

If the phone and the laptop cannot share a network, use `npx expo start --tunnel` plus a tunnel for
port 3000. Slower, but it works from anywhere.

---

## 4. Phase 1 — server changes (do this in `my-app/`, before writing any RN code)

### 4.1 Bearer-token sessions

In `lib/auth.ts`, `getSession()` currently reads only the cookie. Make it accept either transport:

```ts
// Cookie first (web), then Authorization: Bearer (mobile). Same Session row, same hash.
const raw = cookieStore.get(SESSION_COOKIE)?.value
  ?? readBearer(await headers());
```

`createSession(userId)` must **return the raw token** in addition to setting the cookie. Then
`POST /api/auth/login`, `POST /api/auth/signup`, and the invite-accept route include
`{ token }` in their JSON response **only when the request carries `X-Client: mobile`**.

Why gate it on a header: the web client must keep its `httpOnly` cookie, so a token must never
appear in a response the browser JS can read. The header is not a security boundary — it does not
need to be, because minting a token still requires valid credentials.

`POST /api/auth/logout` must delete the session row for the presented Bearer token, not only clear
the cookie.

### 4.2 CORS

The Expo dev client is a different origin, so `app/api/**` needs CORS. Handle it in `proxy.ts` and
extend the matcher to include `/api/*` (today it explicitly excludes it — `proxy.ts:52`):

- Reflect the origin only if it is in an allowlist from `env` (`MOBILE_ORIGINS`), plus `null` /
  missing origin, which is what a native fetch sends.
- Allow `Authorization`, `Content-Type`, `X-Client`.
- Answer `OPTIONS` with 204 before any handler runs.
- `Access-Control-Allow-Credentials` stays **off** — mobile uses Bearer, not cookies.

### 4.3 Missing endpoints the mobile app needs

These are referenced by `docs/DEV-PROMPT.md` but not yet in the repo. Build them now, server-first,
so the app is never blocked waiting on an API:

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/api/tasks/[id]/comments` | `commentSchema` already exists in `lib/validation.ts:79` |
| POST | `/api/invites` | admin only, returns `{ invite, url }` |
| GET / POST | `/api/invites/[token]` · `/accept` | 410 when expired or used |
| PATCH | `/api/employees/[id]` | `employeePatchSchema`, admin only |
| POST / DELETE | `/api/devices` | push-token registration — see §8 |

Every one of them: `requireCompany()` or `requireAdmin()` at the top, zod on the body, `companyId`
from the session and never from the request.

### 4.4 Device model

```prisma
model Device {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Expo push token, e.g. ExponentPushToken[xxxxxxxx]
  pushToken String   @unique
  platform  String   // ios | android
  createdAt DateTime @default(now())
  lastSeenAt DateTime @updatedAt

  @@index([userId])
}
```

Add the back-relation on `User`. One migration, `--name device_push_tokens`.

**Definition of done for Phase 1:** `curl` with a Bearer token reaches `/api/auth/me` and gets the
user; the same call without a token gets 401; the web app still logs in and works unchanged;
`next build`, `eslint`, `tsc --noEmit` all clean.

---

## 5. App skeleton

```
mobile/
  app/                                  Expo Router — the file tree IS the nav
    _layout.tsx                         Providers: Redux, GestureHandlerRootView,
                                        SafeArea, BottomSheetModalProvider, notification listeners
    index.tsx                           Boot gate: read token → /api/auth/me → redirect
    (auth)/
      _layout.tsx                       Stack, no tabs
      login.tsx
      signup.tsx
      forgot-password.tsx
      onboarding-company.tsx            Admin only, right after signup
      change-password.tsx               Forced when mustChangePassword
      invite/[token].tsx                Deep-link target: taskflow://invite/<token>
    (admin)/
      _layout.tsx                       Tabs: Dashboard · Tasks · Teams · Reports · Settings
      dashboard.tsx
      tasks/index.tsx
      teams.tsx
      reports.tsx
      settings.tsx
    (employee)/
      _layout.tsx                       Tabs: Home · My Tasks · Assigned · Profile
      index.tsx
      my-tasks.tsx
      assigned.tsx
      profile.tsx
    task/[id].tsx                       Shared detail screen — both roles push onto it
    support.tsx
    +not-found.tsx

  src/
    contract/                           GENERATED from ../my-app/lib — never hand-edit
      dto.ts  validation.ts  permissions.ts  format.ts
    store/
      index.ts        configureStore, RootState, AppDispatch
      hooks.ts        typed useAppDispatch / useAppSelector
      api.ts          createApi — baseUrl from env, prepareHeaders injects Bearer
      services/       auth-api · task-api · employee-api · company-api · stats-api · device-api
      slices/         session-slice (token + bootstrapped flag) · ui-slice
    components/
      ui/             Button Field Badge Avatar Card StatCard Skeleton Segmented EmptyState ErrorCard
      tasks/          TaskCard SwipeableTaskRow TaskFilters CreateTaskSheet StatusPicker AssigneePicker
      teams/          EmployeeRow AddEmployeeSheet CredentialsResult
      layout/         Screen TabBarIcon TopBar
      icons.tsx       react-native-svg port of the web icon set
    lib/
      secure-token.ts   get / set / clear the session token
      push.ts           permission, token registration, listeners, deep-link routing
      theme.ts          the web design tokens as JS constants
      relative-time.ts  thin wrapper over contract/format
  assets/               icon.png · adaptive-icon.png · splash.png · notification-icon.png
  app.config.ts         env-driven; plugins; scheme "taskflow"
  eas.json              development · preview · production profiles
  tailwind.config.js    same token names as the web app
  global.css            NativeWind entry
  scripts/sync-contract.ts
```

**Rules:** screens under `app/` hold layout and wiring only — no fetch calls, no business logic.
Anything used twice becomes a component in `src/components/`. Named exports everywhere, matching
the web repo's style. Route groups `(auth)` / `(admin)` / `(employee)` decide the shell, exactly
like the Next.js groups they mirror.

---

## 6. Auth + session flow

```
launch
  → SecureStore.getItemAsync("taskflow_token")
      → none          → /(auth)/login
      → present       → GET /api/auth/me with Bearer
                          → 200 + mustChangePassword  → /(auth)/change-password
                          → 200 + role ADMIN + no company → /(auth)/onboarding-company
                          → 200 + role ADMIN → /(admin)/dashboard
                          → 200 + role EMPLOYEE → /(employee)
                          → 401 → clear token → /(auth)/login
```

- Keep the splash screen up (`expo-splash-screen`, `preventAutoHideAsync`) until this resolves.
  A visible login-flash on every cold start is a bug, not a detail.
- `prepareHeaders` on the RTK Query base reads the token from the session slice and sets
  `Authorization: Bearer …` and `X-Client: mobile`.
- Wrap the base query: any **401** clears SecureStore, resets the store, and redirects to login —
  in one place, never per-endpoint.
- Login stores the token in SecureStore **before** the first authed request fires.
- Logout: `POST /api/auth/logout` → clear SecureStore → `dispatch(api.util.resetApiState())` →
  `DELETE /api/devices` for this push token → redirect.
- Store the token in SecureStore **only**. Never AsyncStorage, never Redux persist, never a log line.

---

## 7. Screen map

| Screen | Endpoint(s) | Notes |
|---|---|---|
| `login` | `POST /auth/login` | identifier = email (admin) or employeeId (staff) |
| `signup` | `POST /auth/signup` → `onboarding-company` | admin only path |
| `onboarding-company` | `POST /company` | blocks the app until a company exists |
| `change-password` | `POST /auth/change-password` | forced, non-dismissable, no back gesture |
| `invite/[token]` | `GET /invites/[token]`, `POST …/accept` | deep link + universal link |
| admin `dashboard` | `GET /stats`, `GET /tasks?scope=all&pageSize=5` | 4 stat cards + recent list |
| admin `tasks` | `GET /tasks?scope=all` + filters | FlashList, infinite scroll, not pagination |
| admin `teams` | `GET/POST /employees`, `POST /invites`, `PATCH /employees/[id]` | credentials sheet with copy |
| admin `reports` | `GET /stats` | native charts, no web charting lib |
| admin `settings` | `GET/PATCH /company`, `POST /auth/change-password` | |
| employee `index` | `GET /stats`, `GET /tasks?scope=mine`, `?scope=created` | |
| employee `my-tasks` | `GET /tasks?scope=mine`, `PATCH /tasks/[id]` | segmented TODO / IN_PROGRESS / DONE |
| employee `assigned` | `GET /tasks?scope=created` | |
| employee `profile` | `GET /auth/me`, `POST /auth/change-password` | |
| `task/[id]` | `GET/PATCH/DELETE /tasks/[id]`, comments | notification tap target |

**Mobile-native behaviour that has no web equivalent — build it, don't skip it:**

- **Pull to refresh** on every list (`RefreshControl` → `refetch()`).
- **Infinite scroll** replaces the web's `Pagination` component. Keep `page`/`pageSize` on the wire;
  merge pages in RTK Query with `serializeQueryArgs` + `merge` + `forceRefetch`.
- **Swipe actions** on a task row — mirror `components/tasks/swipeable-row.tsx`. Right swipe →
  mark done, left swipe → delete with confirm. Haptic on threshold, optimistic mutation.
- **Bottom sheet** for create-task and add-employee, not a centred modal.
- **Keyboard handling** — `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` on every
  form. A submit button hidden behind the keyboard is a broken screen.
- **Safe areas** — `useSafeAreaInsets`, never a hardcoded top padding.
- **Offline banner** from NetInfo; mutations while offline fail with a retry toast, never silently.

Server state lives in RTK Query. `ui-slice` holds UI state only — never a copy of server data.
Keep the web app's tag invalidation exactly: task mutations invalidate `["Task", "Stats"]`,
status changes are optimistic with rollback.

---

## 8. Push notifications — requires a development build

### 8.1 Client

1. Ask permission **after** login, on the first dashboard render — never on the splash screen.
   If denied, the app works fully; show a re-enable row in settings that opens system settings.
2. `getExpoPushTokenAsync({ projectId })` — the projectId comes from
   `Constants.expoConfig.extra.eas.projectId`. It will not work in a bare Expo Go on Android.
3. `POST /api/devices { pushToken, platform }` on every login and on every token change.
   `DELETE /api/devices` on logout, so a shared phone never leaks the previous user's alerts.
4. **Android channels** (required, or notifications arrive silent):
   `tasks` (default importance), `mentions` (high), `reminders` (default).
5. Foreground handler — show a banner while the app is open, but suppress it if the user is already
   looking at that task's detail screen.
6. Tap handling — `addNotificationResponseReceivedListener` reads `data.taskId` and
   `router.push('/task/' + taskId)`. Must also work from a **cold start**
   (`getLastNotificationResponseAsync`), which is the case everyone forgets to test.
7. Badge count = open tasks assigned to me; clear it when My Tasks is opened.
8. Notification action buttons (`setNotificationCategoryAsync`): "Mark done" and "View" on the
   task-assigned category. Mark-done fires the same `PATCH /api/tasks/[id]` as the UI.

### 8.2 Server

`lib/push.ts` in `my-app/` — POST to Expo's push service (`https://exp.host/--/api/v2/push/send`):

- Batch up to 100 messages per request.
- Read the receipts; on `DeviceNotRegistered` delete that `Device` row. Tokens go stale constantly
  and a dead token silently poisons every later batch if you ignore receipts.
- Never let a push failure fail the request that triggered it — fire it after the response is
  committed, catch and log.
- Every payload carries `data: { taskId, kind }` so the tap handler can route.

**Events to send:**

| Event | Goes to | Body |
|---|---|---|
| Task assigned to you | assignee (not the creator, if same person) | "Priya assigned you: Fix the login bug" |
| Task reassigned away | previous assignee | "You were unassigned from …" |
| Status changed | task creator, if not the actor | "Rahul moved 'Fix login bug' to Done" |
| New comment | assignee + creator, minus the commenter | "Rahul commented on …" |
| Due tomorrow | assignee | daily digest, one notification listing N tasks |
| Overdue | assignee + creator | once per task, never repeated daily |

Due-date reminders need a scheduler, not a request. Use a Vercel Cron (or a GitHub Action hitting a
token-protected route) once a day at 08:00 in the company's timezone. Guard the route with a secret
header — an open cron endpoint is an open spam relay.

**Quiet rules:** never notify a user about their own action. Never send more than one notification
per task per event. Give every user a settings toggle per category and honour it server-side.

---

## 9. Build order

Do not start a phase until the previous one runs on a real device.

| # | Phase | Done when |
|---|---|---|
| 1 | Server: Bearer auth, CORS, missing endpoints, `Device` model | `curl` with Bearer hits `/api/auth/me`; web app still works |
| 2 | Expo scaffold: Router, NativeWind, Redux, theme tokens, icons | Blank tabbed app runs in Expo Go on a real phone |
| 3 | Auth flow end to end | Login on the phone → token in SecureStore → correct role's tabs |
| 4 | UI primitives + skeletons | Every primitive rendered on a component-gallery screen |
| 5 | Tasks: list, filters, infinite scroll, detail, create sheet | Employee sees only their tasks; admin sees all |
| 6 | Swipe actions + optimistic status + haptics | Swipe-to-done is instant and rolls back on a forced 500 |
| 7 | Teams, invites, settings, profile, comments | Admin creates an employee on the phone; that employee logs in |
| 8 | **Dev build** + push notifications, both directions | Task assigned on web → phone buzzes → tap opens that task |
| 9 | Offline states, error boundaries, empty states, a11y | Airplane mode gives a banner, not a crash |
| 10 | Icons, splash, EAS preview build, EAS Update channel | Someone else installs the preview build and signs in |

---

## 10. Definition of done

- [ ] `npx tsc --noEmit` clean; `npx eslint .` clean; `npx expo-doctor` clean
- [ ] No `any` in application code
- [ ] The session token exists in SecureStore only — grep proves it is never logged or persisted elsewhere
- [ ] Every 401 anywhere logs the user out and lands on `/login`
- [ ] Employee hitting `scope=all` gets **403** — verified from the app, not just the server
- [ ] Every list has: skeleton → content → empty state → error state with retry → pull to refresh
- [ ] Every form: keyboard-safe, zod-validated with the shared schemas, field errors from the API surfaced
- [ ] Push works cold-start, backgrounded, and foregrounded; tapping always lands on the right task
- [ ] Logout deletes the device row — the next user on that phone gets no stale notifications
- [ ] No hardcoded API URL anywhere; `mobile/.env` git-ignored, `.env.example` committed
- [ ] Runs on both a physical Android device and an iOS simulator or device
- [ ] `mobile/README.md` documents LAN setup, the dev-build step, and every env var

---

## 11. Ground rules while building

- **Read the docs before using an unfamiliar API.** Expo SDK, Expo Router, and NativeWind all had
  breaking changes recently; your training data is stale on all three. Same rule the web repo sets
  in `AGENTS.md` — it applies here with more force, not less.
- `npx expo install` for anything native. Never a plain add.
- Do not add a library that needs custom native code before Phase 8 — it silently ends Expo Go
  development for everyone on the team.
- Do not change the API contract to make a screen easier. If an endpoint is genuinely wrong, fix it
  in `my-app/` and re-sync the contract — both clients move together.
- Do not copy business logic out of `lib/permissions.ts` into a component. Import it.
- Never bypass a permission check "for now". The server re-checks regardless, but a UI that offers
  an action it cannot perform is a bug report waiting to happen.
- If a requirement here turns out to be wrong or unworkable, say so and propose the fix — don't
  silently do something different.
