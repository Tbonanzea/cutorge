---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Server Components First

**CRITICAL RULE**: All components are Server Components by default.

## When to Use 'use client'

ONLY add 'use client' when the component needs:

1. **React hooks**: useState, useEffect, useContext, custom hooks
2. **Browser APIs**: window, document, localStorage, etc.
3. **Event handlers**: onClick, onChange, onSubmit, etc.
4. **Client-side libraries**: Libraries that depend on browser APIs

## Examples

### ✅ GOOD: Server Component (default)

```typescript
// src/app/users/page.tsx
export default async function UsersPage() {
  const users = await prisma.user.findMany()
  return <UserList users={users} />
}
```

### ✅ GOOD: Minimal Client Component

```typescript
// src/components/UserList.tsx
'use client'
export function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState('')

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {users.filter(u => u.name.includes(search)).map(...)}
    </div>
  )
}
```

### ❌ BAD: Client Component doing data fetching

```typescript
'use client'
export default function UsersPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
  }, [])

  return <UserList users={users} />
}
```

**Why it's bad**: Data fetching should happen in Server Components for better performance and SEO.

## Enforcement

Before committing, verify:
- [ ] Each 'use client' directive has a justification
- [ ] Server Components handle data fetching
- [ ] Client Components only handle interactivity
- [ ] No server imports (prisma, server-only) in Client Components

Reference: vercel-react-best-practices (server-* rules)
