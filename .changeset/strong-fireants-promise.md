---
"@zayne-labs/toolkit": patch
---

refactor(toolkit): update polymorphism types

-  Update `InferOtherProps` to use `React.ComponentPropsWithRef` instead of `React.ComponentPropsWithoutRef` to include ref prop
-  Remove the separate `RefProp` and `PolymorphicPropsWithRef` types as the ref prop is now included in `PolymorphicProps`
