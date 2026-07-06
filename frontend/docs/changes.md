# Frontend Integration Changes

## Implemented Backend Endpoints

### 1. Authentication Core
- **Proxy Configuration**: Added Vite server proxy for `/api` to `127.0.0.1:8000` to prevent CORS issues without altering backend configuration.
- **Dynamic API Base URL**: Configured `http.ts` to use `/api/v1` dynamically, inheriting the Vite proxy.
- **Automated Authorization Headers**: Implemented interceptor in `http.ts` to append the `access_token` from `localStorage` as a Bearer token.
- **Login Request**: Refactored `loginApi.ts` to utilize the `POST /accounts/login/` endpoint for token exchange, parsing JWT internally without external libraries.
- **User Profile Fetch**: Automated `GET /accounts/users/{userId}/` immediately post-login to retrieve user profiles and `assignments`.
- **Role Resolution**: Mapped complex backend assignment arrays to singular frontend `UserProfile` roles (e.g. `super_admin` -> `Admin`).
- **Logout Sequence**: Wired `handleLogout` across hooks to dispatch `POST /accounts/logout/` and blacklist the `refresh_token`.
- **Forgot Password**: Transitioned the forgot password UI to hit `POST /accounts/password/forgot/` securely.

## Planned Step-by-Step Integrations

### Step 1: Automatic Token Refresh (Completed)
- **Objective**: Prevent users from unexpectedly logging out when their short-lived `access_token` expires.
- **Implementation**: Modified `http.ts` to catch `401 Unauthorized` responses. If a `refresh_token` exists, it triggers a `POST /accounts/token/refresh/`. On success, it saves the new tokens and retries the original failed request seamlessly. Concurrent requests wait for the single refresh sequence to finish via a subscriber pattern. If the refresh token itself is expired, it logs the user out.

### Step 2: Password Reset Completion (Completed)
- **Objective**: Complete the password reset lifecycle from the frontend.
- **Implementation**: 
  - Added `resetPasswordApi` in `loginApi.ts` to call `POST /accounts/password/reset/`.
  - Extended the `LoginView.tsx` "Forgot Password" modal to use a state machine (`resetPhase`) to switch from an Email Input (Phase 1) to an OTP and New Password input state (Phase 2) upon successful request.
  - Included error handling to show invalid OTP/Password messages inline securely without breaking the flow.

### Step 3: Admin API Wrappers & UI Integration (Completed)
- **Objective**: Expose all administrative and security actions from the backend (`/accounts/users/*`, `/accounts/password/*`, etc.) to the frontend.
- **Implementation**:
  - Created `adminApi.ts` to manage all `POST/PATCH/GET` queries for User Management, Branch Managers, and Staff Invitations.
  - Created `securityApi.ts` to expose Device Verification, Email Verification, and Password Change logic.
  - Integrated `fetchUsersApi`, `toggleUserStatusApi`, and `createStaffApi` directly into `AdminDashboard.tsx`, allowing real-time User listing, suspension, and invitation, replacing the previous hardcoded `MOCK_USERS`.
  - Added a "Change Admin Password" section inside `SystemSettings` to securely consume `POST /accounts/password/change/`.
