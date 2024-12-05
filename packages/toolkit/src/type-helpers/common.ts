import type { Prettify, Writeable } from "./type-utils";

export const defineEnum = <const TValue>(value: TValue) => value as Prettify<Writeable<TValue, "deep">>;
