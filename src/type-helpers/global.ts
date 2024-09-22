import type { Writeable } from "./types";

export const defineEnum = <const TValue>(value: TValue) => value as Writeable<TValue, "deep">;
