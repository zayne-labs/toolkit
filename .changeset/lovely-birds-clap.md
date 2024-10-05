---
"@zayne-labs/toolkit": patch
---

refactor: update createZustandContext to use createElement instead of cloneElement

-  Replaced the use of `cloneElement` with `createElement` in the `createZustandContext` function
-  This change simplifies the code and aligns with the recommended React API usage
