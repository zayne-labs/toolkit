import { expect, test, vi } from "vitest";
import { createLocationStore } from "./createLocationStore";

/**
 * @description Helper to wait for all pending microtasks to complete.
 */
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

/**
 * @description Common setup for LocationStore tests that handles history resets.
 */
const setupLocationStore = (options: Parameters<typeof createLocationStore>[0] = {}) => {
	const store = createLocationStore(options);
	const listener = vi.fn();
	const unsubscribe = store.subscribe(listener);

	return {
		listener,
		store,
		[Symbol.dispose]: () => {
			unsubscribe();
			// Reset history and location as much as possible
			globalThis.history.replaceState(undefined, "", "/");
			vi.clearAllMocks();
		},
	};
};

test("Initial State - default browser values", () => {
	using storeSetup = setupLocationStore();
	const { store } = storeSetup;

	const state = store.getState();
	expect(state.pathname).toBe("/");
	expect(state.searchString).toBe("");
	expect(state.hash).toBe("");
});

test("Initial State - custom default values", () => {
	using storeSetup = setupLocationStore({
		defaultValues: {
			hash: "#test",
			pathname: "/custom",
			search: { query: "val" },
		},
	});
	const { store } = storeSetup;

	const state = store.getState();
	expect(state.pathname).toBe("/custom");
	expect(state.searchString).toBe("query=val");
	expect(state.hash).toBe("#test");
});

test("Push - updates location and notifies listeners", async () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	const pushStateSpy = vi.spyOn(globalThis.history, "pushState");

	store.push("/new-path?a=1#hash");

	await flushMicrotasks();

	expect(store.getState().pathname).toBe("/new-path");
	expect(store.getState().searchString).toBe("a=1");
	expect(store.getState().hash).toBe("#hash");
	expect(pushStateSpy).toHaveBeenCalledWith(undefined, "", expect.stringContaining("/new-path?a=1#hash"));
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith(
		expect.objectContaining({ pathname: "/new-path" }),
		expect.objectContaining({ pathname: "/" })
	);
});

test("Replace - updates location and notifies listeners", async () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	const replaceStateSpy = vi.spyOn(globalThis.history, "replaceState");

	store.replace({ pathname: "/replaced", search: { b: "2" } });

	await flushMicrotasks();

	expect(store.getState().pathname).toBe("/replaced");
	expect(store.getState().searchString).toBe("b=2");
	// Note: environment might return absolute URL
	expect(replaceStateSpy).toHaveBeenCalledWith(undefined, "", expect.stringMatching(/\/replaced\?b=2$/));
	expect(listener).toHaveBeenCalledTimes(1);
});

test("PopState - reacts to external history changes", () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	// Simulate browser back button
	globalThis.history.replaceState({ val: 1 }, "", "/back");
	globalThis.dispatchEvent(new PopStateEvent("popstate", { state: { val: 1 } }));

	expect(store.getState().pathname).toBe("/back");
	expect(store.getState().state).toEqual({ val: 1 });
	expect(listener).toHaveBeenCalledTimes(1);
});

test("Batching - multiple updates result in single notification", async () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	store.push("/first");
	/* eslint-disable unicorn/prefer-single-call -- Store is not an array */
	store.push("/second");
	store.push("/third");
	/* eslint-enable unicorn/prefer-single-call -- Store is not an array */

	expect(listener).not.toHaveBeenCalled();

	await flushMicrotasks();

	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState().pathname).toBe("/third");
	expect(globalThis.location.pathname).toBe("/third");
});

test("withSelector - only notifies when selected slice changes", async () => {
	using storeSetup = setupLocationStore();
	const { store } = storeSetup;

	const sliceListener = vi.fn();
	const unsubscribe = store.subscribe.withSelector((s) => s.pathname, sliceListener);

	store.push("/path?query=1"); // Pathname changes
	await flushMicrotasks();
	expect(sliceListener).toHaveBeenCalledTimes(1);

	store.push("/path?query=2"); // Pathname stays same
	await flushMicrotasks();
	expect(sliceListener).toHaveBeenCalledTimes(1); // Still 1

	unsubscribe();
});

test("TriggerPopstateEvent - manually fires popstate", () => {
	using storeSetup = setupLocationStore();

	const popStateListener = vi.fn();
	globalThis.addEventListener("popstate", popStateListener);

	const { store } = storeSetup;
	store.triggerPopstateEvent({ manual: true });

	expect(popStateListener).toHaveBeenCalledTimes(1);
	expect(popStateListener).toHaveBeenCalledWith(expect.objectContaining({ state: { manual: true } }));

	globalThis.removeEventListener("popstate", popStateListener);
});

test("Same-Tab Sync - reflect changes between two stores in same window", async () => {
	using storeSetup1 = setupLocationStore();
	using storeSetup2 = setupLocationStore();

	const { store: store1 } = storeSetup1;
	const { listener: listener2 } = storeSetup2;

	store1.push("/shared-path");
	await flushMicrotasks();

	// Verify that manually triggering a popstate event synchronizes other store instances.
	// This is necessary because history.pushState/replaceState do not natively trigger popstate.
	store1.triggerPopstateEvent({ manual: true });

	expect(listener2).toHaveBeenCalled();
});

test("Error Handling - History Write Error", async () => {
	const logger = vi.fn();
	const pushStateSpy = vi.spyOn(globalThis.history, "pushState").mockImplementation(() => {
		throw new Error("SecurityError");
	});

	using storeSetup = setupLocationStore({ logger });
	const { store } = storeSetup;

	store.push("/error-path");
	await flushMicrotasks();

	// Store should assume success (optimistic)
	expect(store.getState().pathname).toBe("/error-path");
	// Logger should capture error
	expect(logger).toHaveBeenCalledWith(expect.any(Error));

	pushStateSpy.mockRestore();
});
