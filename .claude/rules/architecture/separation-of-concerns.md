---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Separation of Concerns

**CRITICAL RULE**: Keep server logic, UI, and types separated.

## Layers

```
┌─────────────────────────────────┐
│   UI Components (tsx)           │  ← Presentation only
│   - Tailwind styling            │
│   - Event handlers              │
│   - Client interactivity        │
└─────────────────────────────────┘
           ↓ Props (typed data)
┌─────────────────────────────────┐
│   Server Components (tsx)       │  ← Data fetching
│   - Fetch data                  │
│   - Server-side logic           │
│   - Async operations            │
└─────────────────────────────────┘
           ↓ Function calls
┌─────────────────────────────────┐
│   Services (ts)                 │  ← Business logic
│   - Database queries            │
│   - External API calls          │
│   - Data transformations        │
└─────────────────────────────────┘
           ↓ ORM calls
┌─────────────────────────────────┐
│   Database (Prisma)             │  ← Data persistence
└─────────────────────────────────┘
```

## Anti-Patterns

### ❌ BAD: Database in UI component

```tsx
// components/UserCard.tsx
export function UserCard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return <Card>{user.name}</Card>
}
```

### ✅ GOOD: Separated concerns

```typescript
// lib/users.ts
export async function getUser(id: string) {
  return await prisma.user.findUnique({ where: { id } })
}

// app/users/[id]/page.tsx (Server Component)
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)
  return <UserCard user={user} />
}

// components/UserCard.tsx
export function UserCard({ user }: { user: User }) {
  return <Card>{user.name}</Card>
}
```

## File Organization

```
src/
├── app/              # Routes, pages (Next.js App Router)
│   ├── api/          # API route handlers
│   └── (routes)/     # Page components
├── components/       # UI components (presentation)
│   ├── ui/           # shadcn/ui primitives
│   └── forms/        # Form components
├── lib/              # Business logic, utilities
│   ├── prisma.ts     # Database client
│   ├── supabase/     # Auth clients
│   └── utils/        # Helpers
├── hooks/            # React hooks (Client Component logic)
├── types/            # TypeScript types
└── context/          # React Context (state management)
```

## Enforcement

- [ ] No database queries in UI components
- [ ] No UI logic in service functions
- [ ] Clear data flow: DB → Service → Server Component → UI Component
- [ ] Types defined separately and imported

Reference: vercel-react-best-practices (server-dedup-props, server-serialization)
