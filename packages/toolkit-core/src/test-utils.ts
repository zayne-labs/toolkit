import { vi } from "vitest";
import { createStore } from "./createStore";

/**
 * @description Helper to wait for all pending microtasks to complete.
 */
export const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

/**
 * @description Creates a disposable spy on an object's method that automatically restores when disposed.
 */
export const spyOnDisposable = <TObject extends object, TKey extends keyof TObject>(
	obj: TObject,
	method: TKey
) => {
	const spy = vi.spyOn(obj, method as never);

	return {
		spy,
		[Symbol.dispose]: () => {
			spy.mockRestore();
		},
	};
};

export type TestState = {
	count: number;
};

/**
 * @description Common setup for store tests that creates a store and subscribes a mock listener.
 */
export const setupStore = <TState>(...params: Parameters<typeof createStore<TState>>) => {
	const store = createStore(...params);

	const listener = vi.fn();

	store.subscribe(listener);

	return { listener, store };
};
