import { setAnimationInterval } from "@zayne-labs/toolkit";

setAnimationInterval(() => console.info("hello"), 2000, { immediate: true });
