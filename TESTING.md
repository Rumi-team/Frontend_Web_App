# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Vitest** v4 with jsdom environment
- **@testing-library/react** for component testing
- **@testing-library/jest-dom** for DOM assertions
- **@testing-library/user-event** for user interaction simulation

## Running Tests

```bash
pnpm test          # single run
pnpm test:watch    # watch mode
```

## Test Layers

### Unit Tests (`test/*.test.tsx`)
- Pure logic extraction (display rules, state derivation)
- Component rendering with mocked dependencies
- Write when: adding new functions, fixing bugs, adding conditionals

### Integration Tests
- Auth flows, API route handlers, Supabase interactions
- Write when: adding new API routes or auth logic

### E2E Tests (planned)
- Full user journeys (login, coaching session, settings)
- Requires Playwright setup (deferred)

## Conventions

- Test files: `test/<module-name>.test.tsx`
- Mock external deps (Supabase, fetch) — never hit real APIs
- Use `data-testid` for test selectors when semantic queries aren't possible
- Test behavior, not implementation — assert what the user sees
