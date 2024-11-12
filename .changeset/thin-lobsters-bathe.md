---
"@zayne-labs/toolkit": patch
---

feat(toolkit): add popstate event trigger to location hooks

-  Add `triggerPopstate` function to `useLocation` and `useSearchParams` hooks
-  Update `createLocationStore` to expose `triggerPopstateEvent` function
-  This allows triggering a popstate event manually
