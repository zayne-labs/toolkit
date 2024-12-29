import type { Prettify, Writeable, WriteableLevel } from "./type-utils";

export const defineEnum = <const TValue, TWriteableLevel extends WriteableLevel = "shallow">(
	value: TValue
) => value as Prettify<Writeable<TValue, TWriteableLevel>>;
