# @zayne-labs/toolkit

## 0.8.11

### Patch Changes

- fa0c266: ✨ feat(location): add equality check for location state updates
  🔧 refactor(search): improve useSearchParams hook implementation
  📝 docs(types): enhance isPlainObject options documentation

   - Add equality check to prevent unnecessary location state updates
   - Refactor useSearchParams hook to use URLSearchParams more effectively
   - Update isPlainObject type documentation for better clarity
   - Replace isObject with isPlainObject for more accurate type checking

- b968cc3: refactor(type-guards): ✨ enhance isPlainObject with configuration options

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

## 0.8.10

### Patch Changes

- 7595424: upgrade assert functionality

## 0.8.9

### Patch Changes

- da01405: edit polymorphism type helper

## 0.8.5

### Patch Changes

- 6250317: feat: updates to storage state impl

## 0.8.4

### Patch Changes

- cb4ad68: feat: add react import on every component avoid errors.

## 0.8.3

### Patch Changes

- a50dd44: fix: react bug cause by minification

## 0.8.2

### Patch Changes

- 841c4ba: feat: structure exports better

## 0.8.1

### Patch Changes

- 887f30f: fix types, revert util-types scope

## 0.8.0

### Minor Changes

- a096fbb: add css support and ui folder

## 0.7.0

### Minor Changes

- 9f56ef9: feat(core): add handleImagePreview function
  feat(core): add FileValidationOptions and related types
  feat(core): export handleFileValidation and handleImagePreview
  feat(toolkit): add tailwind config
  chore(deps): update dependencies

## 0.6.8

### Patch Changes

- b61e915: fix(type-helpers): update isObject and isPlainObject functions
  refactor(core): use isPlainObject instead of isObject in syncStateWithStorage
  refactor(react): use isPlainObject instead of isObject in useSearch

## 0.6.7

### Patch Changes

- 8d237d3: fix(toolkit): only call onSuccess callback when there are valid files

## 0.6.6

### Patch Changes

- 9b6bf55: feat(toolkit): enhance file validation with error context and success callback

## 0.6.5

### Patch Changes

- 247e617: feat(toolkit): add popstate event trigger to location hooks

   - Add `triggerPopstate` function to `useLocation` and `useSearchParams` hooks
   - Update `createLocationStore` to expose `triggerPopstateEvent` function
   - This allows triggering a popstate event manually

- 907d3a4: add option for default value

## 0.6.4

### Patch Changes

- cc6c4d6: refactor(toolkit): update polymorphism types

   - Update `InferOtherProps` to use `React.ComponentPropsWithRef` instead of `React.ComponentPropsWithoutRef` to include ref prop
   - Remove the separate `RefProp` and `PolymorphicPropsWithRef` types as the ref prop is now included in `PolymorphicProps`

## 0.6.3

### Patch Changes

- 9242b24: refactor: remake handleFile util

## 0.6.2

### Patch Changes

- 909c6db: feat: allowed milliseconds option for waitUntil

## 0.6.1

### Patch Changes

- 9516314: feat(toolkit): update type inference for forwarded refs

   - Update `InferProps` type to use `React.ComponentPropsWithRef` instead of `React.ComponentPropsWithoutRef` to correctly infer props for components with forwarded refs

## 0.6.0

### Minor Changes

- 0172250: feat(toolkit): add new utils and exports

   - Add `toArray` utility to `core` module
   - Add `react/zustand` and `react/utils` exports to `package.json`
   - Update `tsup.config.ts` to include new entry points

## 0.5.2

### Patch Changes

- f16fff8: feat(core): add `once` and `immediate` options to `setAnimationInterval`

   BREAKING CHANGE: The `setAnimationInterval` function now accepts an optional `options` parameter with `immediate` and `once` properties. This is a breaking change as it modifies the public API of the `setAnimationInterval` function.

## 0.5.1

### Patch Changes

- 27ed30f: exposed popstate trigger for useLocation

## 0.5.0

### Minor Changes

- 544fd67: add inferEnums type helper

## 0.4.12

### Patch Changes

- 560332d: still testing

## 0.4.6

### Patch Changes

- 9e42bec: refactor ♻️: omitkeys and pickkeys functions.

   - Refactor the omitKeys function to use a generic type to represent the keys to omit.
   - Refactor the pickKeys function to return the correct type.

## 0.4.5

### Patch Changes

- 434c33c: refactor ♻️: pickkeys function to use set and reduce.

   - Remove specified keys from an object.
   - Refactor pickKeys function to use Set and reduce.

## 0.4.4

### Patch Changes

- 9463021: refactor ♻️: omitkeys function to support deleting keys using reflect.deleteproperty

## 0.4.3

### Patch Changes

- 782d768: feat: add Prettify type helper to defineEnum function

   - Extends the `defineEnum` function to use the `Prettify` type helper in addition to `Writeable`
   - This ensures the returned enum type is more readable and user-friendly

## 0.4.2

### Patch Changes

- 7b2eb0e: refactor: update createZustandContext to use createElement instead of cloneElement

   - Replaced the use of `cloneElement` with `createElement` in the `createZustandContext` function
   - This change simplifies the code and aligns with the recommended React API usage

## 0.4.1

### Patch Changes

- 8e09b01: fixes to usePresence

## 0.4.0

### Minor Changes

- ee76235: feat: add type option to usePresence hook

   BREAKING CHANGE: The `type` option in the `usePresence` hook now defaults to "transition" instead of "animation". This is a breaking change, as the previous default behavior has been changed.

## 0.3.0

### Minor Changes

- 7ae45ee: added a few zustand wrappers, also fixed a few bugs

## 0.2.0

### Minor Changes

- fed62e5: feat: Add zustand context creation utility

   BREAKING CHANGE: The `useAnimateElementRefs` hook is now exported from the `react/hooks/index.ts` file.

## 0.1.5

### Patch Changes

- 03c07e5: fixed missing export for useAnimateElementRef

## 0.1.4

### Patch Changes

- 57cee2a: update a few types
- 151873e: fixes to wrong export

## 0.1.3

### Patch Changes

- 76b44b8: update types and move a few files arounf

## 0.1.2

### Patch Changes

- 93b3038: add class resolver to hook

## 0.1.2

### Patch Changes

- ad7f779: move classResolver to hook

## 0.1.1

### Patch Changes

- 0a28fe5: relaxed ts requirements for cn prop on useDragScroll
- db6a02c: remove isPrefersDarkMode from constants

## 0.1.0

### Minor Changes

- 38435f3: added useDragScroll hook

## 0.0.1

### Patch Changes

- 8350b67: initial release
