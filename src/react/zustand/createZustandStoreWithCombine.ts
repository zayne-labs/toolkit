import type { AnyFunction, AnyObject } from "@/type-helpers";
import { type StateCreator, type StoreMutatorIdentifier, create, createStore } from "zustand";

export type Combine = <
	TInitialState extends AnyObject,
	TExtraState extends AnyObject,
	Mps extends Array<[StoreMutatorIdentifier, unknown]> = [],
	Mcs extends Array<[StoreMutatorIdentifier, unknown]> = [],
>(
	initialState: TInitialState,
	additionalStateCreator: StateCreator<TInitialState, Mps, Mcs, TExtraState>
) => StateCreator<TExtraState & TInitialState>;

export const combine: Combine =
	(initialState, storeCreator) =>
	// eslint-disable-next-line ts-eslint/no-unsafe-return
	(...params) => ({
		...initialState,
		...(storeCreator as AnyFunction)(...params),
	});

export const createStoreWithCombine = <TInitialState extends AnyObject, TExtraState extends AnyObject>(
	...params: Parameters<typeof combine<TInitialState, TExtraState>>
) => createStore(combine(...params));

export const createWithCombine = <TInitialState extends AnyObject, TExtraState extends AnyObject>(
	...params: Parameters<typeof combine<TInitialState, TExtraState>>
) => create(combine(...params));
