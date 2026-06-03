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

	expect(replaceStateSpy).toHaveBeenCalledWith(undefined, "", expect.stringMatching(/\/replaced\?b=2$/));
	expect(listener).toHaveBeenCalledTimes(1);
});

test("PopState - reacts to external history changes", () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

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

	store.push("/path?query=1");
	await flushMicrotasks();
	expect(sliceListener).toHaveBeenCalledTimes(1);

	store.push("/path?query=2");
	await flushMicrotasks();
	expect(sliceListener).toHaveBeenCalledTimes(1);

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

	expect(store.getState().pathname).toBe("/error-path");

	expect(logger).toHaveBeenCalledWith(expect.any(Error));

	pushStateSpy.mockRestore();
});

test("Push - passes state parameter correctly", async () => {
	using storeSetup = setupLocationStore();
	const { store } = storeSetup;

	const pushStateSpy = vi.spyOn(globalThis.history, "pushState");

	store.push("/with-state", { state: { userId: 123 } });
	await flushMicrotasks();

	expect(store.getState().pathname).toBe("/with-state");
	expect(pushStateSpy).toHaveBeenCalledWith({ userId: 123 }, "", expect.stringContaining("/with-state"));

	pushStateSpy.mockRestore();
});

test("Replace - passes state parameter correctly", async () => {
	using storeSetup = setupLocationStore();
	const { store } = storeSetup;

	const replaceStateSpy = vi.spyOn(globalThis.history, "replaceState");

	store.replace("/replaced-with-state", { state: { token: "abc" } });
	await flushMicrotasks();

	expect(store.getState().pathname).toBe("/replaced-with-state");
	expect(replaceStateSpy).toHaveBeenCalledWith(
		{ token: "abc" },
		"",
		expect.stringContaining("/replaced-with-state")
	);

	replaceStateSpy.mockRestore();
});

test("Sync Notification - global shouldNotifySync notifies immediately", () => {
	using storeSetup = setupLocationStore({ shouldNotifySync: true });
	const { listener, store } = storeSetup;

	store.push("/sync-path");

	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState().pathname).toBe("/sync-path");
});

test("Sync Notification - per-call shouldNotifySync override", async () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	store.push("/immediate", { shouldNotifySync: true });

	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState().pathname).toBe("/immediate");

	await flushMicrotasks();

	expect(listener).toHaveBeenCalledTimes(1);
});

test("PopState - same storeId is ignored", async () => {
	using storeSetup = setupLocationStore();
	const { listener, store } = storeSetup;

	store.push("/first-path");
	await flushMicrotasks();
	listener.mockClear();

	const stateWithStoreId = store.getState();

	globalThis.dispatchEvent(
		new PopStateEvent("popstate", {
			state: { ...stateWithStoreId, storeId: (stateWithStoreId as Record<string, unknown>).storeId },
		})
	);

	expect(listener).not.toHaveBeenCalled();
});

test("Unsubscribe - cleans up popstate listener when all subscribers leave", () => {
	const store = createLocationStore();

	const listener1 = vi.fn();
	const listener2 = vi.fn();

	const unsub1 = store.subscribe(listener1);
	const unsub2 = store.subscribe(listener2);

	globalThis.history.replaceState(undefined, "", "/active");
	globalThis.dispatchEvent(new PopStateEvent("popstate"));
	expect(store.getState().pathname).toBe("/active");

	unsub1();

	globalThis.history.replaceState(undefined, "", "/still-active");
	globalThis.dispatchEvent(new PopStateEvent("popstate"));
	expect(store.getState().pathname).toBe("/still-active");

	unsub2();

	globalThis.history.replaceState(undefined, "", "/ignored");
	globalThis.dispatchEvent(new PopStateEvent("popstate"));

	expect(store.getState().pathname).toBe("/still-active");

	globalThis.history.replaceState(undefined, "", "/");
});

test("getInitialState - returns initial snapshot after mutations", async () => {
	using storeSetup = setupLocationStore();
	const { store } = storeSetup;

	const initialState = store.getInitialState();

	store.push("/mutated-path?x=1#changed");
	await flushMicrotasks();

	expect(store.getInitialState()).toEqual(initialState);
	expect(store.getInitialState().pathname).toBe("/");

	expect(store.getState().pathname).toBe("/mutated-path");
});
