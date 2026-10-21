# Security Specification: 10Apples Firebase Integration

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created, read, or modified by the authenticated user whose `request.auth.uid == userId`.
2. **Project Ownership Invariant**: A custom modular home project at `/users/{userId}/projects/{projectId}` strictly belongs to `userId`. No user can read, list, create, update, or delete projects belonging to another user.
3. **Immutability of Identity**: `userId` on a project and `id` on a user profile must match `request.auth.uid` and cannot be mutated after creation.
4. **Default Deny Catch-all**: Any path outside explicit `/users/{userId}` and `/users/{userId}/projects/{projectId}` rules is rejected.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated Profile Write**: Anonymous or missing auth token attempting to create a user profile document (`PERMISSION_DENIED`).
2. **Cross-User Profile Hijack**: Authenticated user `user_A` attempting to read or write `/users/user_B` (`PERMISSION_DENIED`).
3. **Role Escalation Attack**: Client attempting to self-assign `role: 'admin'` on profile creation or update (`PERMISSION_DENIED`).
4. **Cross-User Project Read**: Authenticated user `user_A` querying `/users/user_B/projects` (`PERMISSION_DENIED`).
5. **Cross-User Project Write**: Authenticated user `user_A` writing into `/users/user_B/projects/proj_1` (`PERMISSION_DENIED`).
6. **Project Identity Spoofing**: User `user_A` creating a project under their own path `/users/user_A/projects/proj_1` with `userId: 'user_B'` (`PERMISSION_DENIED`).
7. **Path Traversal / ID Poisoning**: Attempting to write to a document ID with illegal characters or exceeding 128 chars (`PERMISSION_DENIED`).
8. **Oversized String Injection**: Injecting a 2MB string into `fullName` or `name` (`PERMISSION_DENIED`).
9. **Ghost Field Injection**: Adding arbitrary executable keys or shadow admin flags into user document (`PERMISSION_DENIED`).
10. **Unauthenticated List Query**: Non-logged in client attempting to scrape the `/users` collection (`PERMISSION_DENIED`).
11. **Negative Price Exploit**: Creating a saved project with `totalPrice < 0` (`PERMISSION_DENIED`).
12. **Foreign Root Modification**: Writing to an arbitrary collection like `/system_configs` (`PERMISSION_DENIED`).
