import type { Prettify, Writeable } from "./types";

export const defineEnum = <const TValue>(value: TValue) => value as Prettify<Writeable<TValue, "deep">>;
