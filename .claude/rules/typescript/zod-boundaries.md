---
paths:
  - "src/app/api/**/*.ts"
  - "src/app/**/*.ts"
  - "src/lib/**/*.ts"
---

# Zod Only at Boundaries

**CRITICAL RULE**: Use Zod for validation at system boundaries ONLY. Use TypeScript internally.

## Valid Zod Usage (External Boundaries)

1. **API route handlers** - Validate HTTP requests
2. **Form submissions** - Validate user input
3. **Environment variables** - Validate process.env
4. **External API responses** - Validate 3rd party data
5. **File uploads** - Validate user files
6. **WebSocket messages** - Validate real-time data

## Pattern

```typescript
// schema.ts - Define schemas
import { z } from 'zod'

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user']),
})

// types.ts - Infer types
export type CreateUserInput = z.infer<typeof CreateUserSchema>

// route.ts - Validate at boundary
export async function POST(req: Request) {
  const body = await req.json()
  const input = CreateUserSchema.parse(body) // ✅ Boundary validation
  return await createUser(input)
}

// service.ts - Trust TypeScript
async function createUser(input: CreateUserInput) {
  // ❌ NO Zod validation here
  return await prisma.user.create({ data: input })
}
```

## ❌ INVALID: Internal Zod Usage

```typescript
// BAD: Zod between internal functions
function processUser(data: unknown) {
  const user = UserSchema.parse(data) // ❌ Don't do this!
  return user
}

// GOOD: TypeScript types internally
function processUser(user: User) { // ✅ Type-safe
  return user
}
```

## Enforcement

Before committing:
- [ ] Zod imports only in API routes, forms, env files
- [ ] Internal functions use TypeScript types
- [ ] Types inferred from schemas (z.infer)
- [ ] No duplicate type definitions

Reference: vercel-react-best-practices, supabase-postgres-best-practices
