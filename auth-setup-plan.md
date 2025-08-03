# Closed-Registration Authentication Setup Plan

**Goal:** Convert the dashboard to a private, employee-only application secured with Better Auth (email + password) while blocking public sign-up. Provide an admin-only screen for adding / removing employee accounts.

---

## 1  Prerequisites

1. Node/Bun installed (≥ 1.0)
2. Cloudflare Wrangler configured (for dev & prod deployments)
3. Access to the production D1 database credentials
4. Environment variables ready: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

---

## 2  Server Configuration

| File | Task |
|------|------|
| `apps/server/src/lib/auth.ts` (create if missing) | Initialize Better Auth with **sign-up disabled**:  
```ts
import { betterAuth } from "better-auth";
import { db } from "../db"; // drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,  // 🚫 no public registration
  },
});
``` |
| `apps/server/src/index.ts` | Mount the auth handler at `/api/auth/*` using the Hono helper:  
```ts
import { toHonoHandler } from "better-auth/hono";
import { auth } from "./lib/auth";

app.route("/api/auth/*", toHonoHandler(auth));
``` |

> **Note:** Do **not** expose any sign-up endpoints; only `signIn`, `signOut`, `useSession`, etc. will be available.

---

## 3  Database Preparation

1. **Add Better Auth tables** (if not already present):
   ```bash
   cd apps/server
   bunx @better-auth/cli generate         # produces drizzle migration
   # Apply to the *remote* production database
   wrangler d1 migrations apply onepercent-stats-new --remote
   ```
2. **Seed initial employee account (Jane only)**
   Create `apps/server/scripts/seed-employees.ts`:
   ```ts
   import { auth } from "../src/lib/auth";

   await auth.createUser({
     name: "Jane",
     email: "chongxienhui4m@gmail.com",
     password: "12345678",
     emailVerified: true,
   });

   console.log("✅ Jane has been seeded");
   ```

   **Run this against the *remote* D1 database** (production):
   ```bash
   # Apply auth migrations to remote DB first
   wrangler d1 migrations apply onepercent-stats-new --remote

   # Execute the seed script pointing to remote DB
   bun run tsx scripts/seed-employees.ts
   ```
   The `db` drizzle instance inside the server is already configured to use the same D1 binding, so the script will operate on the live database.
   

---

## 4  Front-End Adjustments (apps/web)

### 4.1 Remove Public Sign-Up

- Delete/ignore `sign-up-form.tsx`, `/signup` route, menu links.
- Ensure `/login` is the only public route.

### 4.2 Login Page Implementation

- Re-use existing `sign-in-form.tsx`; confirm it calls:
  ```ts
  const { data, error } = await authClient.signIn.email({
    email,
    password,
    rememberMe
  });
  ```
- On success redirect to `/dashboard`.

### 4.3 Route Protection & Session Refresh

1. **Root Guard** – in `root.tsx` (or your top-level layout):
   ```tsx
   import { useSession } from "@/lib/auth-client";
   import { Navigate, Outlet } from "react-router-dom";
   
   export default function ProtectedRoot() {
     // Refresh session every 5 minutes (300 000 ms). If the token has expired,
     // better-auth will attempt to renew it transparently; if that fails the
     // hook returns null.
     const { data: session, isLoading } = useSession({
       refreshInterval: 300_000,
     });
   
     if (isLoading) return null; // or a splash screen
     if (!session) return <Navigate to="/login" replace />;
   
     return <Outlet />; // authenticated area
   }
   ```
   Place all private routes under this component so unauthenticated visitors are immediately redirected to `/login`.

2. **Login Page** – after successful `signIn`, call `mutateSession()` (returned by `useSession`) to prime the session cache and redirect:
   ```ts
   const { mutateSession } = useSession();
   await authClient.signIn.email({ email, password });
   mutateSession();           // ensures state is up-to-date
   navigate("/dashboard");
   ```

3. **Auto-Refresh Token (optional)** – better-auth client auto-renews the session cookie; however if you rely on an access token in headers, use `authClient.refresh()` on a background timer (same 5 min).

4. **Session Provider (optional)** – wrap the app once and expose the session via React context so you don’t re-call the hook in every component. Example provider skeleton is included in `/apps/web/lib/auth-provider.tsx` (to be created by the implementer).

---

## 5  Admin Panel for User Management

### 5.1 Authorization Strategy

- Flag admins with `role = "admin"` column (add to Better Auth `user` table via migration).
- Middleware that only permits `role === "admin"`.

### 5.2 Routes

| Route | Purpose |
|-------|---------|
| `GET  /admin/users` | List current employees |
| `POST /admin/users` | Add employee (name, email, pwd) |
| `DELETE /admin/users/:id` | Remove employee & revoke sessions |

Implementation steps:
1. Create Hono router `routers/admin.ts` with above endpoints.
2. In `apps/web`, add `/admin/users` page with shadcn `<Table>` + `<Dialog>` for add.

---

## 6  Removing Employees

Flow triggered from Admin UI:
1. **DELETE** user via `/admin/users/:id` → calls `auth.deleteUser(id)`.
2. Immediately `auth.invalidateSessions(id)` to kick active logins.
3. Refresh user list.

---

## 7  Testing Checklist

- [ ] Employee can log in, reach dashboard.
- [ ] Public visitor gets redirected to `/login`.
- [ ] Disabled email/password sign-up endpoint returns 404.
- [ ] Admin can add a new employee and they can log in.
- [ ] Admin can delete an employee and their session becomes invalid.

---

## 8  Deployment Steps

1. Merge this plan branch → main.
2. `turbo run build` to ensure both apps compile.
3. `wrangler deploy` (server) & `wrangler pages deploy` (web).
4. Verify login, admin panel, dashboard on production URL.

---

## 9  Maintenance

- Rotate any default passwords immediately after first login.
- Update `seed-employees.ts` when onboarding/offboarding until admin UI is live.
- Periodically review the `user` table for stale accounts.

---

> **Timeline Estimate:** ~4 hours setup + 2 hours testing + 1 hour deployment.

---

### 👍 You’re ready to implement closed-registration Better Auth!
