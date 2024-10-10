# @zayne-labs/toolkit

## 0.4.12

### Patch Changes

-  560332d: still testing

## 0.4.6

### Patch Changes

-  9e42bec: refactor ♻️: omitkeys and pickkeys functions.

   -  Refactor the omitKeys function to use a generic type to represent the keys to omit.
   -  Refactor the pickKeys function to return the correct type.

## 0.4.5

### Patch Changes

-  434c33c: refactor ♻️: pickkeys function to use set and reduce.

   -  Remove specified keys from an object.
   -  Refactor pickKeys function to use Set and reduce.

## 0.4.4

### Patch Changes

-  9463021: refactor ♻️: omitkeys function to support deleting keys using reflect.deleteproperty

## 0.4.3

### Patch Changes

-  782d768: feat: add Prettify type helper to defineEnum function

   -  Extends the `defineEnum` function to use the `Prettify` type helper in addition to `Writeable`
   -  This ensures the returned enum type is more readable and user-friendly

## 0.4.2

### Patch Changes

-  7b2eb0e: refactor: update createZustandContext to use createElement instead of cloneElement

   -  Replaced the use of `cloneElement` with `createElement` in the `createZustandContext` function
   -  This change simplifies the code and aligns with the recommended React API usage

## 0.4.1

### Patch Changes

-  8e09b01: fixes to usePresence

## 0.4.0

### Minor Changes

-  ee76235: feat: add type option to usePresence hook

   BREAKING CHANGE: The `type` option in the `usePresence` hook now defaults to "transition" instead of "animation". This is a breaking change, as the previous default behavior has been changed.

## 0.3.0

### Minor Changes

-  7ae45ee: added a few zustand wrappers, also fixed a few bugs

## 0.2.0

### Minor Changes

-  fed62e5: feat: Add zustand context creation utility

   BREAKING CHANGE: The `useAnimateElementRefs` hook is now exported from the `react/hooks/index.ts` file.

## 0.1.5

### Patch Changes

-  03c07e5: fixed missing export for useAnimateElementRef

## 0.1.4

### Patch Changes

-  57cee2a: update a few types
-  151873e: fixes to wrong export

## 0.1.3

### Patch Changes

-  76b44b8: update types and move a few files arounf

## 0.1.2

### Patch Changes

-  93b3038: add class resolver to hook

## 0.1.2

### Patch Changes

-  ad7f779: move classResolver to hook

## 0.1.1

### Patch Changes

-  0a28fe5: relaxed ts requirements for cn prop on useDragScroll
-  db6a02c: remove isPrefersDarkMode from constants

## 0.1.0

### Minor Changes

-  38435f3: added useDragScroll hook

## 0.0.1

### Patch Changes

-  8350b67: initial release
