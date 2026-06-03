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

	using storeSetup1 = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	using storeSetup2 = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store: store1 } = storeSetup1;
	const { listener: listener2, store: store2 } = storeSetup2;

	store1.setState({ count: 50 });

	await flushMicrotasks();

	expect(store2.getState()).toEqual({ count: 50 });
	expect(listener2).toHaveBeenCalledWith({ count: 50 }, { count: 0 });

	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 50 }));
});

test("Reset - resetState reverts to initial value immediately", async () => {
	const key = "test-reset-key";

	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	store.setState({ count: 20 });
	await flushMicrotasks();
	expect(store.getState()).toEqual({ count: 20 });

	store.resetState();

	expect(store.getState()).toEqual({ count: 0 });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 0 }));
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

test("storageAction: 'none' - skip storage write and event dispatch", () => {
	const key = "test-none-action-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
	const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
	const dispatchEventSpy = vi.spyOn(globalThis, "dispatchEvent");

	store.setState({ count: 42 }, { shouldNotifySync: true, storageAction: "none" });

	expect(store.getState()).toEqual({ count: 42 });

	expect(setItemSpy).not.toHaveBeenCalled();
	expect(removeItemSpy).not.toHaveBeenCalled();
	expect(dispatchEventSpy).not.toHaveBeenCalledWith(
		expect.objectContaining({ type: "storage-store-change" })
	);

	setItemSpy.mockRestore();
	removeItemSpy.mockRestore();
	dispatchEventSpy.mockRestore();
});

test("Cross-Tab Sync - does not re-write to storage", () => {
	const key = "test-no-rewrite-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

	const newValue = JSON.stringify({ count: 99 });
	const oldValue = JSON.stringify({ count: 0 });

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue,
			oldValue,
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 99 });

	expect(setItemSpy).not.toHaveBeenCalled();

	setItemSpy.mockRestore();
});

test("Sync Notification - shouldNotifySync option notifies immediately", () => {
	const key = "test-sync-notify-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		shouldNotifySync: true,
	});

	const { listener, store } = storeSetup;

	store.setState({ count: 1 });
	store.setState({ count: 2 });

	expect(listener).toHaveBeenCalledTimes(2);
	expect(store.getState()).toEqual({ count: 2 });
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 2 }));
});

test("Session Storage - works with sessionStorage", async () => {
	const key = "test-session-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		storageArea: "sessionStorage",
	});

	const { store } = storeSetup;

	store.setState({ count: 7 });
	await flushMicrotasks();

	expect(store.getState()).toEqual({ count: 7 });
	expect(sessionStorage.getItem(key)).toBe(JSON.stringify({ count: 7 }));

	expect(localStorage.getItem(key)).toBeNull();
});

test("syncStateAcrossTabs: false - ignores native storage events", async () => {
	const key = "test-no-cross-tab-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		syncStateAcrossTabs: false,
	});

	const { listener, store } = storeSetup;

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: JSON.stringify({ count: 50 }),
			oldValue: JSON.stringify({ count: 0 }),
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 0 });
	expect(listener).not.toHaveBeenCalled();

	await flushMicrotasks();
});

test("Unsubscribe - cleans up external listeners when all subscribers leave", () => {
	const key = "test-cleanup-key";
	const store = createExternalStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const listener1 = vi.fn();
	const listener2 = vi.fn();

	const unsub1 = store.subscribe(listener1);
	const unsub2 = store.subscribe(listener2);

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: JSON.stringify({ count: 10 }),
			oldValue: JSON.stringify({ count: 0 }),
			storageArea: localStorage,
		})
	);
	expect(store.getState()).toEqual({ count: 10 });

	unsub1();

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: JSON.stringify({ count: 20 }),
			oldValue: JSON.stringify({ count: 10 }),
			storageArea: localStorage,
		})
	);
	expect(store.getState()).toEqual({ count: 20 });

	unsub2();

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: JSON.stringify({ count: 30 }),
			oldValue: JSON.stringify({ count: 20 }),
			storageArea: localStorage,
		})
	);
	expect(store.getState()).toEqual({ count: 20 });

	store.removeState();
});

test("Skip Conditions - wrong key is ignored", () => {
	const key = "test-skip-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { listener, store } = storeSetup;

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key: "completely-different-key",
			newValue: JSON.stringify({ count: 999 }),
			oldValue: JSON.stringify({ count: 0 }),
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 0 });
	expect(listener).not.toHaveBeenCalled();
});

test("Skip Conditions - wrong storageArea is ignored", () => {
	const key = "test-skip-storage-area-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
		storageArea: "localStorage",
	});

	const { listener, store } = storeSetup;

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: JSON.stringify({ count: 999 }),
			oldValue: JSON.stringify({ count: 0 }),
			storageArea: sessionStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 0 });
	expect(listener).not.toHaveBeenCalled();
});

test("Skip Conditions - same newValue and oldValue is ignored", () => {
	const key = "test-skip-same-value-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { listener, store } = storeSetup;

	const sameValue = JSON.stringify({ count: 5 });

	globalThis.dispatchEvent(
		new StorageEvent("storage", {
			key,
			newValue: sameValue,
			oldValue: sameValue,
			storageArea: localStorage,
		})
	);

	expect(store.getState()).toEqual({ count: 0 });
	expect(listener).not.toHaveBeenCalled();
});

test("Callback Forwarding - onNotifySync and onNotifyViaBatch are called", async () => {
	const key = "test-callback-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0 },
		key,
	});

	const { store } = storeSetup;

	const onNotifyViaBatch = vi.fn();
	store.setState({ count: 1 }, { onNotifyViaBatch });

	await flushMicrotasks();

	expect(onNotifyViaBatch).toHaveBeenCalledTimes(1);
	expect(onNotifyViaBatch).toHaveBeenCalledWith({ count: 0 });

	const onNotifySync = vi.fn();
	store.setState({ count: 2 }, { onNotifySync, shouldNotifySync: true });

	expect(onNotifySync).toHaveBeenCalledTimes(1);
});

test("Equality - uses shallowCompare by default to prevent identical updates", async () => {
	const key = "test-shallow-compare-key";
	using storeSetup = setupStorageStore({
		defaultValue: { count: 0, name: "test" },
		key,
	});

	const { listener, store } = storeSetup;

	store.setState({ count: 0, name: "test" });

	await flushMicrotasks();

	expect(listener).not.toHaveBeenCalled();
	expect(localStorage.getItem(key)).toBeNull();

	store.setState({ count: 1, name: "test" });

	await flushMicrotasks();

	expect(listener).toHaveBeenCalledTimes(1);
	expect(localStorage.getItem(key)).toBe(JSON.stringify({ count: 1, name: "test" }));
});
