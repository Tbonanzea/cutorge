---
name: audit-tailwind
description: Audit Tailwind v4 usage and UI patterns
agent: ui-engineer
allowed-tools: Read, Glob, Grep
---

# Tailwind Audit

Audit Tailwind v4 usage and UI patterns.

## Scan Areas

1. **Custom CSS Usage**
   - Find .css files with custom classes
   - Flag where Tailwind utilities could be used instead
   - Check for duplicate styles

2. **Accessibility**
   - Find buttons without ARIA labels (icon-only)
   - Check for outline-none without focus alternatives
   - Verify semantic HTML usage (divs as buttons)
   - Check color contrast

3. **Responsive Design**
   - Verify mobile-first breakpoints
   - Check for fixed pixel widths
   - Ensure responsive testing

4. **Component Composition**
   - Check shadcn/ui component usage
   - Verify proper Radix primitives
   - Flag over-configuration vs composition

5. **Dark Mode**
   - Verify dark: variants used
   - Check CSS variable usage
   - Ensure theme consistency

## Output

**CRITICAL**: Accessibility violations
**WARNING**: Non-responsive or custom CSS
**SUGGESTION**: Better patterns

Reference: web-design-guidelines
