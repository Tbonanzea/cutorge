---
name: refactor-boundaries
description: Refactor Server/Client Component boundaries
agent: nextjs-architect
argument-hint: [file-path]
allowed-tools: Read, Write, Edit, Glob, Grep, Task
---

# Refactor Server/Client Boundaries

Refactor Server/Client boundaries in: **$ARGUMENTS**

## Analysis

1. **Identify current state**:
   - Which components have 'use client'?
   - Why is each Client Component necessary?
   - What could be Server Components?

2. **Find violations**:
   - Client Components doing data fetching
   - Server logic mixed with UI
   - Unnecessary 'use client' directives

## Refactoring Strategy

### Pattern 1: Split Data Fetching from UI

```typescript
// BEFORE: Client Component doing everything
'use client'
export default function Page() {
  const [data, setData] = useState()
  useEffect(() => { fetch('/api/data').then(setData) }, [])
  const [filter, setFilter] = useState('')

  return (
    <div>
      <input onChange={(e) => setFilter(e.target.value)} />
      {data?.filter(item => item.name.includes(filter)).map(...)}
    </div>
  )
}

// AFTER: Server Component + minimal Client Component
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData() // Server-side
  return <DataList data={data} />
}

// DataList.tsx (Client Component - interactivity only)
'use client'
export function DataList({ data }: { data: Data[] }) {
  const [filter, setFilter] = useState('')
  return (
    <div>
      <input onChange={(e) => setFilter(e.target.value)} />
      {data.filter(item => item.name.includes(filter)).map(...)}
    </div>
  )
}
```

### Pattern 2: Extract Static Parts

```typescript
// BEFORE: Entire component client-side
'use client'
export function Feature() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Header />
      <StaticContent />
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>...</Dialog>
    </div>
  )
}

// AFTER: Server Component wrapper
// Feature.tsx (Server Component)
export async function Feature() {
  return (
    <div>
      <Header />
      <StaticContent />
      <FeatureInteractive />
    </div>
  )
}

// FeatureInteractive.tsx (Client Component - minimal)
'use client'
export function FeatureInteractive() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>...</Dialog>
    </>
  )
}
```

## Verification

After refactoring:
- [ ] Data fetching in Server Components
- [ ] 'use client' only on interactive components
- [ ] No server imports in Client Components
- [ ] Props serializable (no functions passed down)

Reference: vercel-react-best-practices (server-* rules)
