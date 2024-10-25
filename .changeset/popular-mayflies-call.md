---
"@zayne-labs/toolkit": patch
---

feat(toolkit): update type inference for forwarded refs

-  Update `InferProps` type to use `React.ComponentPropsWithRef` instead of `React.ComponentPropsWithoutRef` to correctly infer props for components with forwarded refs
