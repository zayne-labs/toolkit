import { expect, test, vi } from "vitest";
import { createExternalStorageStore } from "./createExternalStorageStore";
import type { StorageOptions } from "./types";

/**
 * @description Helper to wait for all pending microtasks to complete.
 */
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

/**
 * @description Common setup for ExternalStorageStore tests that handles storage cleanup.
 */
const setupStorageStore = <TState>(options: StorageOptions<TState>) => {
	const store = createExternalStorageStore(options);
	const listener = vi.fn();
	const unsubscribe = store.subscribe(listener);

	return {
		listener,
		store,
		[Symbol.dispose]: () => {
			unsubscribe();
			store.removeState();
			vi.clearAllMocks();
		},
	};
};

test("Initial State - retrieval from empty storage", () => {
	const key = "test-empty-key";

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	expect(store.getState()).toEqual({ count: 0 });
	expect(localStorage.getItem(key)).toBeNull();
});

test("Initial State - retrieval from existing storage", () => {
	const key = "test-existing-key";
	localStorage.setItem(key, JSON.stringify({ count: 10 }));

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	expect(store.getState()).toEqual({ count: 10 });
});

test("Updates - setState syncs to storage and notifies listeners", async () => {
	const key = "test-update-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { listener, store } = storeSetup;

	store.setState({ count: 1 });

	await flushMicrotasks();

	expect(store.getState()).toEqual({ count: 1 });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 1 }));
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
});

test("Batching - combine multiple synchronous calls into single storage sync", async () => {
	const key = "test-batch-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { listener, store } = storeSetup;

	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ count: 3 });

	expect(listener).not.toHaveBeenCalled();
	expect(localStorage.getItem(key)).toBeNull();

	await flushMicrotasks();

	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState()).toEqual({ count: 3 });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 3 }));
});

test("Cross-Tab Sync - reflect changes from storage events", async () => {
	const key = "test-sync-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { listener, store } = storeSetup;

	const newValue = JSON.stringify({ count: 20 });
	const oldValue = JSON.stringify({ count: 0 });

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue,
			oldValue,
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 20 });
	expect(listener).toHaveBeenCalledWith({ count: 20 }, { count: 0 });

	await flushMicrotasks();
});

test("Same-Tab Sync - reflect changes between two stores in same window", async () => {
	const key = "test-same-tab-sync-key";

	// Create first store
	using storeSetup1 = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	// Create second store for the same key
	using storeSetup2 = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store: store1 } = storeSetup1;
	const { listener: listener2, store: store2 } = storeSetup2;

	// Update store1
	store1.setState({ count: 50 });

	await flushMicrotasks();

	// store2 should update due to CustomEvent dispatch
	expect(store2.getState()).toEqual({ count: 50 });
	expect(listener2).toHaveBeenCalledWith({ count: 50 }, { count: 0 });

	// Verify persistence
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 50 }));
});

test("Reset - resetState reverts to initial value immediately", async () => {
	const key = "test-reset-key";
	// Note: initialState is set from storage if present. Fallback is defaultValue.
	localStorage.setItem(key, JSON.stringify({ count: 10 }));

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	// First change it
	store.setState({ count: 20 });
	await flushMicrotasks();
	expect(store.getState()).toEqual({ count: 20 });

	// Then reset to session initial (10)
	store.resetState();

	expect(store.getState()).toEqual({ count: 10 });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 10 }));
});

test("Remove - removeState deletes from storage", async () => {
	const key = "test-remove-key";
	localStorage.setItem(key, JSON.stringify({ count: 10 }));

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	store.removeState();
	await flushMicrotasks();

	expect(localStorage.getItem(key)).toBeNull();
	// Should fallback to defaultValue in memory after removal
	expect(store.getState()).toEqual({ count: 0 });
});

test("Partialize - only persist selected parts of state", async () => {
	const key = "test-partial-key";

	using storeSetup = setupStorageStore<{ count: number; secret: string }>({
		defaultValue: { count: 0, secret: "keep-local" },
		key,
		partialize: (state) => ({ count: state.count }),
	});

	const { store } = storeSetup;

	store.setState({ count: 1, secret: "modified" });

	await flushMicrotasks();

	expect(store.getState()).toEqual({ count: 1, secret: "modified" });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 1 }));
});

test("Custom Format - handle custom parser and serializer", async () => {
	const key = "test-custom-key";

	using storeSetup = setupStorageStore<{ count: number }>({
		defaultValue: { count: 0 },
		key,
		parser: (value) => {
			return { count: Number.parseInt(value.split(":")[1] ?? "0", 10) };
		},
		serializer: (state) => `count:${state?.count}`,
	});

	const { store } = storeSetup;

	store.setState({ count: 5 });

	await flushMicrotasks();

	expect(localStorage.getItem(key)).toBe("count:5");

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: "count:15",
			oldValue: "count:5",
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 15 });
});

test("Error Handling - Malformed Storage Data", () => {
	const key = "test-malformed-key";

	localStorage.setItem(key, "{ invalid json");

	const logger = vi.fn();

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		logger,
	});

	const { store } = storeSetup;

	expect(logger).toHaveBeenCalledWith(expect.any(SyntaxError));

	expect(store.getState()).toEqual({ count: 0 });
});

test("Error Handling - Storage Write Error (Quota)", async () => {
	const key = "test-quota-key";
	const logger = vi.fn();

	// Mock setItem to throw
	const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new DOMException("QuotaExceededError", "QuotaExceededError");
	});

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		logger,
	});

	const { store } = storeSetup;

	store.setState({ count: 100 });
	await flushMicrotasks();

	expect(store.getState()).toEqual({ count: 100 });

	setItemSpy.mockRestore();
});
