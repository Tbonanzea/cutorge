---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Tailwind Utilities First

**CRITICAL RULE**: Use Tailwind utility classes. Avoid custom CSS.

## Pattern

### ✅ GOOD: Utility classes

```tsx
<div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
    {title}
  </h2>
  <Button variant="ghost" size="sm">Edit</Button>
</div>
```

### ❌ BAD: Custom CSS

```tsx
<div className="custom-card">
  <h2 className="custom-title">{title}</h2>
</div>

/* styles.css - AVOID */
.custom-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  /* ... */
}
```

## Mobile-First Responsive

Always start mobile, add breakpoints upward:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
</div>
```

## Accessibility Required

- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`
- ARIA labels on icon-only buttons
- Keyboard navigation (tab, enter, space, escape)
- Focus styles: Never `outline-none` without alternative
- Color contrast: WCAG AA (4.5:1 for text)

```tsx
// ✅ GOOD
<button
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-blue-500"
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>

// ❌ BAD
<div onClick={onClose}>
  <X />
</div>
```

## Enforcement

Before committing:
- [ ] Tailwind utilities used (no custom CSS)
- [ ] Mobile-first breakpoints (sm:, md:, lg:)
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Focus styles visible
- [ ] Keyboard navigation tested

Reference: web-design-guidelines
