import { createStore } from "@zayne-labs/toolkit-core";
import type { AnyFunction, AnyObject, Prettify } from "@zayne-labs/toolkit-type-helpers";
import { createReactZustandStore } from "./createReactZustandStore";
import type { StateCreator, StoreMutatorIdentifier } from "./types";

type Write<TInitialState, TExtraState> = Prettify<Omit<TInitialState, keyof TExtraState> & TExtraState>;

export const combine =
	<
		TInitialState extends AnyObject,
		TExtraState extends AnyObject,
		Mps extends Array<[StoreMutatorIdentifier, unknown]> = [],
		Mcs extends Array<[StoreMutatorIdentifier, unknown]> = [],
	>(
		initialState: TInitialState,
		storeCreator: StateCreator<TInitialState, Mps, Mcs, TExtraState>
	): StateCreator<Write<TInitialState, TExtraState>, Mps, Mcs> =>
	// eslint-disable-next-line ts-eslint/no-unsafe-return -- We don't know what the storeCreator will return
	(...params) => ({
		...initialState,
		...(storeCreator as AnyFunction)(...params),
	});

export const createStoreWithCombine = <TInitialState extends AnyObject, TExtraState extends AnyObject>(
	...params: Parameters<typeof combine<TInitialState, TExtraState>>
) => createStore(combine(...params));

export const createWithCombine = <TInitialState extends AnyObject, TExtraState extends AnyObject>(
	...params: Parameters<typeof combine<TInitialState, TExtraState>>
) => createReactZustandStore(combine(...params));
