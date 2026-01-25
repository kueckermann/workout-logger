# SKILL Pattern Guide

> Feature-driven development with AI assistance.

---

## What is SKILL?

A single-reference system for AI-assisted development:

- **SKILL.md** → Global rules, stack, patterns
- **skills/[feature].md** → Feature-specific business logic

**Stack**: Next.js 16+ / Tailwind / shadcn/ui / Bun / localStorage / Vercel

---

## Quick Start

### General Task

```
@SKILL.md - Build a user profile component
```

### Feature Development

```
@SKILL.md @skills/todos.md - Implement the todo list
```

### New Feature

```
@SKILL.md - Create a skill for user authentication
```

---

## File Structure

```
project/
├── SKILL.md              # Global rules
└── skills/
    ├── README.md         # This file
    ├── _template.md      # Template for new skills
    ├── auth.md           # Auth feature skill
    ├── todos.md          # Todos feature skill
    └── ...               # More features
```

---

## Creating a New Skill

### Option 1: Copy Template

```bash
cp skills/_template.md skills/my-feature.md
```

### Option 2: Ask AI

```
@SKILL.md - Create a skill for [feature description]
```

---

## What Goes Where

| Content | Location |
|---------|----------|
| Tech stack | SKILL.md |
| Code rules & limits | SKILL.md |
| Naming conventions | SKILL.md |
| shadcn patterns | SKILL.md |
| Hook patterns | SKILL.md |
| Zod patterns | SKILL.md |
| Feature types | skills/[feature].md |
| Feature validators | skills/[feature].md |
| Storage keys | skills/[feature].md |
| Business logic | skills/[feature].md |
| Hooks | skills/[feature].md |
| Components | skills/[feature].md |
| User flows | skills/[feature].md |

---

## Skill Sections

Each skill file contains:

1. **Overview** - What & why
2. **Data Model** - Types & storage key
3. **Validation** - Zod schemas
4. **Hooks** - TanStack Query + localStorage
5. **Store** - Zustand (UI state)
6. **Components** - UI breakdown
7. **User Flows** - Step-by-step interactions
8. **States** - Loading, error, empty, success
9. **Checklist** - Implementation progress

**No API routes needed!** All data operations happen client-side with localStorage.

---

## Usage Examples

### Bug Fix

```
@SKILL.md - Fix the delete button not working on user cards
```

### New Component

```
@SKILL.md @skills/users.md - Create the UserCard component
```

### Full Feature

```
@SKILL.md @skills/todos.md - Implement the complete todos feature
```

### Refactor

```
@SKILL.md - Extract the form validation into a reusable hook
```

### Cross-Feature

```
@SKILL.md @skills/users.md @skills/todos.md - Add user assignment to todos
```

---

## Best Practices

1. **Reference both files** - Always include `@SKILL.md` with feature skills
2. **Keep skills updated** - Mark checklist items as you complete them
3. **One feature per skill** - Don't combine unrelated features
4. **Include business logic** - Document rules, not just structure
5. **Update when requirements change** - Skills are living documents

---

## Checklist Conventions

```markdown
- [ ] Not started
- [x] Completed
- [ ] ~Skipped~ (with reason)
```

---

## Tips

- **Be specific** with references
- **Check off items** as you complete them
- **Add notes** for decisions made
- **Challenge rules** that block progress—update them

---

## localStorage Notes

- Data is per-browser (each user has their own data)
- ~5-10MB storage limit per domain
- Data persists until user clears browser storage
- Works offline
- No backend/API routes needed

---

## Philosophy

> **Working code > Perfect documentation**

Skills are guides, not laws. If something doesn't work:

1. Document why
2. Update the skill
3. Keep building