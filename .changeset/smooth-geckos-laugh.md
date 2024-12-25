---
"@zayne-labs/toolkit": patch
---

refactor(type-guards): ✨ enhance isPlainObject with configuration options

The isPlainObject type guard now accepts an options object with:

- Class: for instance checking (existing functionality)
- returnTrueIfNotArray: new option for more flexible type checking

♻️ Also improves internal implementation by using existing type guards

feat(toolkit): 🔧 refactor code organization and enhance type safety

- ♻️ Move cn.ts to internal-lib/utils
- 🔒 Improve type safety in guard.ts and assert.ts
- 🎨 Add data-scope and data-part attributes to form components
- ⚡️ Optimize useEffectOnce with effectGuard ref
- 🏷️ Add DiscriminatedRenderProps type for better render prop patterns
- 🔄 Update Switch.tsx default case slot name
- 🛠️ Enhance tsconfig and tsup build setup
