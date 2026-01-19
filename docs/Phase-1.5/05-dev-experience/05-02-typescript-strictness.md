---
Phase: 1.5
Risk Level: Low
Effort Estimate: 3 hours
Non-breaking: Yes
---

## 5.2 TypeScript Strictness

### Purpose

To improve code quality, maintainability, and developer confidence by enabling TypeScript's strictest settings, thereby catching potential bugs at compile-time rather than runtime.

### Scope

This task involves enabling the `strict` compiler option in `tsconfig.json` and resolving any resulting type errors. The primary focus is on eliminating implicit `any` types and ensuring `null` and `undefined` are handled explicitly.

### Current State

- The project is written in TypeScript.
- The `tsconfig.json` does not have `"strict": true` enabled.
- While the codebase is generally well-typed, there are instances of implicit `any` types, where TypeScript cannot infer the type of a variable and defaults to `any`.
- This reduces the benefits of using TypeScript, as it bypasses type checking for those variables.

### Recommended Approach

1.  **Enable Strict Mode:** In the `tsconfig.json` file, under `compilerOptions`, set `"strict": true` (this enables a wide range of strictness checks, including `noImplicitAny` and `strictNullChecks`).
2.  **Run Type Check:** Run `pnpm tsc --noEmit` and observe the new errors.
3.  **Fix `any` Types:** Go through each error and provide the correct type. This may involve:
    - Adding explicit types to function parameters and variables.
    - Creating new interfaces or types for complex objects.
    - Using `unknown` instead of `any` for variables whose type is truly unknown, and then performing type-safe checks before using them.
4.  **Address Null/Undefined Errors:** With `strictNullChecks`, explicitly handle cases where a value could be `null` or `undefined`.

#### Illustrative Code Snippet (Fixing implicit `any`)

```typescript
// Before (illustrative / not yet enforced)
// The `data` parameter has an implicit `any` type
function processData(data) {
  console.log(data.name);
}

// After (illustrative / not yet enforced)
interface MyData {
  id: string;
  name: string;
}

// The `data` parameter is now explicitly typed
function processData(data: MyData) {
  console.log(data.name);
}
```

### Non-breaking Confirmation

This change is non-breaking. It is a compile-time check that improves code quality. It has no impact on the runtime behavior of the application, as it only adds type information that is erased during compilation.

### Phase Boundary Notes

- **Phase 1.5:** Enable strict mode and eliminate all implicit `any` types.
- **Phase 2 Follow-ups:** None. Strict mode should be the enforced standard for all new code written in Phase 2.

---

Ready for GitHub commit: Yes
