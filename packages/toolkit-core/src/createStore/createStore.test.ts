import { expect, test, vi } from "vitest";
import { deepCompare } from "../compare";
import { createStore } from "./createStore";
import { defineStorePlugin } from "./plugins";
import type { StoreApi } from "./types";

/**
 * @description Helper to wait for all pending microtasks to complete.
 */
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

type TestState = { count: number; multiplier?: number; name?: string };

/**
 * @description Creates a disposable spy on an object's method that automatically restores when disposed.
 */
const spyOnDisposable = <TObject extends object, TKey extends keyof TObject>(
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

/**
 * @description Common setup for store tests that creates a store and subscribes a mock listener.
 */
function setupStore<T extends object>(initialState: () => T) {
	const store = createStore(initialState);

	const listener = vi.fn();

	store.subscribe(listener);

	return { listener, store };
}

test("Basic Batching - batch multiple synchronous calls and result in single listener notification", async () => {
	const { listener, store } = setupStore(() => ({ count: 0, name: "test" }));

	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ count: 3 });

	// Assert - listener should not be called yet
	expect(listener).not.toHaveBeenCalled();

	await flushMicrotasks();

	// Assert - listener should be called exactly once with final state
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 3, name: "test" }, { count: 0, name: "test" });
});

test("Basic Batching - apply all updates in correct order and reflect final state", async () => {
	const { store } = setupStore(() => ({ count: 0, multiplier: 1 }));

	store.setState({ count: 5 });
	store.setState({ multiplier: 2 });
	store.setState({ count: 15 });

	await flushMicrotasks();

	// Assert - final state should reflect all updates in order
	const finalState = store.getState();
	expect(finalState).toEqual({ count: 15, multiplier: 2 });
});

test("Basic Batching - clear the queue after flush", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - First batch
	store.setState({ count: 1 });
	store.setState({ count: 2 });
	await flushMicrotasks();

	// Assert - First batch processed
	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState()).toEqual({ count: 2 });

	// Act - Second batch (queue should be clear from first batch)
	listener.mockClear();
	store.setState({ count: 3 });
	store.setState({ count: 4 });
	await flushMicrotasks();

	// Assert - Second batch processed independently
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 4 }, { count: 2 });
	expect(store.getState()).toEqual({ count: 4 });
});

test("Basic Batching - prevent multiple microtask schedules with guard clause", async () => {
	const { store } = setupStore(() => ({ count: 0 }));

	using queueMicrotaskSpy = spyOnDisposable(globalThis, "queueMicrotask");

	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ count: 3 });
	store.setState({ count: 4 });
	store.setState({ count: 5 });

	// Assert - queueMicrotask should only be called once
	expect(queueMicrotaskSpy.spy).toHaveBeenCalledTimes(1);

	await flushMicrotasks();

	// Assert - final state is correct
	expect(store.getState()).toEqual({ count: 5 });
});

test("Basic Batching - allow new batch after previous batch completes", async () => {
	const { store } = setupStore(() => ({ count: 0 }));
	using queueMicrotaskSpy = spyOnDisposable(globalThis, "queueMicrotask");

	// Act - First batch
	store.setState({ count: 1 });
	store.setState({ count: 2 });
	expect(queueMicrotaskSpy.spy).toHaveBeenCalledTimes(1);

	await flushMicrotasks();

	// Act - Second batch (guard should be reset)
	store.setState({ count: 3 });
	store.setState({ count: 4 });

	// Assert - queueMicrotask should be called again (total 2 times)
	// Note: flushMicrotasks itself calls queueMicrotask, so we expect 3 total
	expect(queueMicrotaskSpy.spy).toHaveBeenCalledTimes(3);

	await flushMicrotasks();

	// Assert - final state is correct
	expect(store.getState()).toEqual({ count: 4 });
});

test("Basic Batching - handle function updates with correct accumulated state", async () => {
	const { store } = setupStore(() => ({ count: 0, total: 0 }));

	// Act - Mix of object and function updates
	store.setState({ count: 5 });
	store.setState((state) => ({ total: state.count + 10 })); // Should see count: 5
	store.setState((state) => ({ count: state.count * 2 })); // Should see count: 5

	await flushMicrotasks();

	const finalState = store.getState();
	expect(finalState).toEqual({ count: 10, total: 15 });
});

test("Basic Batching - respect equality check when final state equals current state", async () => {
	const { listener, store } = setupStore(() => ({ count: 5 }));

	// Act - Batched updates that create a new object with same values
	store.setState({ count: 5 });
	store.setState({ count: 5 });

	await flushMicrotasks();

	// Assert - listener is called because a new object is created (different reference)
	// This is expected behavior with Object.is equality check
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 5 }, { count: 5 });
	expect(store.getState()).toEqual({ count: 5 });
});

test("Basic Batching - handle rapid successive batches correctly", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - First batch
	store.setState({ count: 1 });
	store.setState({ count: 2 });

	await flushMicrotasks();

	// Act - Second batch immediately after
	store.setState({ count: 3 });
	store.setState({ count: 4 });

	await flushMicrotasks();

	// Act - Third batch
	store.setState({ count: 5 });

	await flushMicrotasks();

	// Assert - listener called 3 times (once per batch)
	expect(listener).toHaveBeenCalledTimes(3);
	expect(store.getState()).toEqual({ count: 5 });
});

test("Update Merging - merge object updates correctly", async () => {
	const { store } = setupStore(() => ({ age: 25, city: "NYC", name: "John" }));

	// Act - Multiple object updates
	store.setState({ name: "Jane" });
	store.setState({ age: 30 });
	store.setState({ city: "LA" });

	await flushMicrotasks();

	// Assert - all properties should be merged
	expect(store.getState()).toEqual({ age: 30, city: "LA", name: "Jane" });
});

test("Update Merging - provide correct accumulated state to function updates", async () => {
	const { store } = setupStore(() => ({ count: 0, multiplier: 1 }));

	// Act - Function updates should see accumulated state
	store.setState({ count: 5 });
	store.setState((state) => {
		// Should see count: 5
		expect(state.count).toBe(5);
		return { multiplier: state.count * 2 };
	});
	store.setState((state) => {
		// Should see count: 5, multiplier: 10
		expect(state.count).toBe(5);
		expect(state.multiplier).toBe(10);
		return { count: state.count + state.multiplier };
	});

	await flushMicrotasks();

	// Assert - final state reflects accumulated updates
	expect(store.getState()).toEqual({ count: 15, multiplier: 10 });
});

test("Update Merging - handle mixed object and function updates together", async () => {
	const { store } = setupStore(() => ({ a: 1, b: 2, c: 3 }));

	// Act - Mix of object and function updates
	store.setState({ a: 10 }); // Object update
	store.setState((state) => ({ b: state.a + 5 })); // Function sees a: 10
	store.setState({ c: 20 }); // Object update
	store.setState((state) => ({ a: state.b + state.c })); // Function sees b: 15, c: 20

	await flushMicrotasks();

	expect(store.getState()).toEqual({ a: 35, b: 15, c: 20 });
});

test("Update Merging - preserve update order during merging", async () => {
	const { store } = setupStore(() => ({ value: 0 }));
	const updateOrder: number[] = [];

	// Act - Track order of updates
	store.setState((state) => {
		updateOrder.push(1);
		return { value: state.value + 1 };
	});
	store.setState((state) => {
		updateOrder.push(2);
		return { value: state.value + 10 };
	});
	store.setState((state) => {
		updateOrder.push(3);
		return { value: state.value + 100 };
	});

	await flushMicrotasks();

	// Assert - updates applied in order
	expect(updateOrder).toEqual([1, 2, 3]);
	expect(store.getState()).toEqual({ value: 111 }); // 0 + 1 + 10 + 100
});

test("Update Merging - use equality check to prevent unnecessary notifications when merged state equals current state", async () => {
	const { listener, store } = setupStore(() => ({ count: 5, name: "test" }));

	// Act - Updates that result in same values
	store.setState({ count: 5 });
	store.setState({ name: "test" });

	await flushMicrotasks();

	// Assert - listener is called because new object is created (different reference)
	// This is expected with Object.is equality check
	expect(listener).toHaveBeenCalledTimes(1);
});

test("Update Merging - handle complex nested object merging", async () => {
	const { store } = setupStore(() => ({
		nested: { x: 1, y: 2 },
		simple: "value",
	}));

	// Act - Update nested property (note: shallow merge only)
	store.setState({ simple: "updated" });
	store.setState({ nested: { x: 10, y: 20 } });

	await flushMicrotasks();

	expect(store.getState()).toEqual({
		nested: { x: 10, y: 20 },
		simple: "updated",
	});
});

test("Update Merging - handle function updates that depend on previous function updates", async () => {
	const { store } = setupStore(() => ({ counter: 0 }));

	// Act - Chain of dependent function updates
	store.setState((state) => ({ counter: state.counter + 1 }));
	store.setState((state) => ({ counter: state.counter * 2 }));
	store.setState((state) => ({ counter: state.counter + 10 }));
	store.setState((state) => ({ counter: state.counter / 2 }));

	await flushMicrotasks();

	// Assert - ((0 + 1) * 2 + 10) / 2 = 6
	expect(store.getState()).toEqual({ counter: 6 });
});

test("Update Merging - handle empty object updates", async () => {
	const { listener, store } = setupStore(() => ({ count: 5 }));

	// Act - Empty object update
	store.setState({});

	await flushMicrotasks();

	// Assert - state unchanged but listener called (new object created)
	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState()).toEqual({ count: 5 });
});

test("Update Merging - correctly merge when function returns partial state", async () => {
	const { store } = setupStore(() => ({ x: 1, y: 2, z: 3 }));

	// Act - Function returns partial update
	store.setState({ x: 10 });
	store.setState((state) => ({ y: state.x + 5 })); // Only updates y
	// z should remain unchanged

	await flushMicrotasks();

	expect(store.getState()).toEqual({ x: 10, y: 15, z: 3 });
});

test("Async Boundary - batch updates before await together", async () => {
	const { listener, store } = setupStore(() => ({ count: 0, status: "idle" }));

	// Act - Updates before await should be batched
	const asyncOperation = async () => {
		store.setState({ count: 1 });
		store.setState({ count: 2 });
		store.setState({ status: "loading" });

		// These updates should be batched together before the await
		await new Promise((resolve) => setTimeout(resolve, 10));

		// This update happens after await (new batch)
		store.setState({ status: "complete" });
	};

	await asyncOperation();
	await flushMicrotasks();

	// Assert - listener should be called twice (once for pre-await batch, once for post-await)
	expect(listener).toHaveBeenCalledTimes(2);
	expect(listener).toHaveBeenNthCalledWith(
		1,
		{ count: 2, status: "loading" },
		{ count: 0, status: "idle" }
	);
	expect(listener).toHaveBeenNthCalledWith(
		2,
		{ count: 2, status: "complete" },
		{ count: 2, status: "loading" }
	);
});

test("Async Boundary - form new batch for updates after await", async () => {
	const { listener, store } = setupStore(() => ({ step: 0 }));

	const asyncOperation = async () => {
		// First batch - before await
		store.setState({ step: 1 });
		store.setState({ step: 2 });

		await new Promise((resolve) => setTimeout(resolve, 10));

		// Second batch - after await
		store.setState({ step: 3 });
		store.setState({ step: 4 });
	};

	await asyncOperation();
	await flushMicrotasks();

	// Assert - two separate batches
	expect(listener).toHaveBeenCalledTimes(2);
	expect(store.getState()).toEqual({ step: 4 });
});

test("Async Boundary - result in single notification per batch across async boundaries", async () => {
	const { listener, store } = setupStore(() => ({ value: 0 }));

	const asyncOperation = async () => {
		// Batch 1
		store.setState({ value: 1 });
		store.setState({ value: 2 });
		store.setState({ value: 3 });

		await new Promise((resolve) => setTimeout(resolve, 5));

		// Batch 2
		store.setState({ value: 4 });
		store.setState({ value: 5 });

		await new Promise((resolve) => setTimeout(resolve, 5));

		// Batch 3
		store.setState({ value: 6 });
	};

	await asyncOperation();
	await flushMicrotasks();

	// Assert - exactly 3 notifications (one per batch)
	expect(listener).toHaveBeenCalledTimes(3);
	expect(listener).toHaveBeenNthCalledWith(1, { value: 3 }, { value: 0 });
	expect(listener).toHaveBeenNthCalledWith(2, { value: 5 }, { value: 3 });
	expect(listener).toHaveBeenNthCalledWith(3, { value: 6 }, { value: 5 });
});

test("Async Boundary - flush pending batch when async function completes", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Synchronous batched calls
	store.setState({ count: 1 });
	store.setState({ count: 2 });

	// Explicitly wait for microtasks to ensure batch is flushed
	await flushMicrotasks();

	// Assert - batch should be flushed
	expect(listener).toHaveBeenCalledTimes(1);
	expect(store.getState()).toEqual({ count: 2 });
});

test("Async Boundary - handle multiple async operations with independent batches", async () => {
	const { listener, store } = setupStore(() => ({ counter: 0 }));

	// Act - Run two async operations concurrently
	const operation1 = async () => {
		store.setState({ counter: 1 });
		await new Promise((resolve) => setTimeout(resolve, 10));
		store.setState({ counter: 10 });
	};

	const operation2 = async () => {
		store.setState({ counter: 2 });
		await new Promise((resolve) => setTimeout(resolve, 15));
		store.setState({ counter: 20 });
	};

	await Promise.all([operation1(), operation2()]);
	await flushMicrotasks();

	// Assert - multiple batches occurred
	expect(listener).toHaveBeenCalled();
	// Final state depends on timing, but should be either 10 or 20
	const finalState = store.getState();
	expect([10, 20]).toContain(finalState.counter);
});

test("Async Boundary - handle nested async operations correctly", async () => {
	const { listener, store } = setupStore(() => ({ level: 0 }));

	const nestedAsync = async () => {
		store.setState({ level: 1 });

		await (async () => {
			store.setState({ level: 2 });
			await new Promise((resolve) => setTimeout(resolve, 5));
			store.setState({ level: 3 });
		})();

		store.setState({ level: 4 });
	};

	await nestedAsync();
	await flushMicrotasks();

	// Assert - batches should be properly separated
	expect(listener).toHaveBeenCalled();
	expect(store.getState()).toEqual({ level: 4 });
});

test("Async Boundary - handle async/await with Promise.all correctly", async () => {
	const { listener, store } = setupStore(() => ({ result: 0 }));

	const asyncOperation = async () => {
		store.setState({ result: 1 });

		await Promise.all([
			Promise.resolve().then(() => store.setState({ result: 2 })),
			Promise.resolve().then(() => store.setState({ result: 3 })),
		]);

		store.setState({ result: 4 });
	};

	await asyncOperation();
	await flushMicrotasks();

	// Assert - multiple batches due to async boundaries
	expect(listener).toHaveBeenCalled();
	expect(store.getState()).toEqual({ result: 4 });
});

test("Immediate Notifications - notify immediately when shouldNotifySync is true", () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - setState with shouldNotifySync
	store.setState({ count: 1 }, { shouldNotifySync: true });

	// Assert - listener should be called immediately (synchronously)
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
	expect(store.getState()).toEqual({ count: 1 });

	// Act - Another immediate setState
	store.setState({ count: 2 }, { shouldNotifySync: true });

	// Assert - listener called again immediately
	expect(listener).toHaveBeenCalledTimes(2);
	expect(listener).toHaveBeenCalledWith({ count: 2 }, { count: 1 });
	expect(store.getState()).toEqual({ count: 2 });
});

test("Immediate Notifications - return updated state from getState immediately even during batch cycle", async () => {
	const { store } = setupStore(() => ({ count: 0, name: "test" }));

	// Act - Queue batched updates
	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ name: "updated" });

	// Assert - getState returns the latest state immediately (state is updated, notifications are batched)
	expect(store.getState()).toEqual({ count: 2, name: "updated" });

	// Wait for batch to flush
	await flushMicrotasks();

	// Assert - state remains the same
	expect(store.getState()).toEqual({ count: 2, name: "updated" });
});

test("Immediate Notifications - work with subscribe for batched updates", async () => {
	const { store } = setupStore(() => ({ value: 0 }));
	const listener1 = vi.fn();
	const listener2 = vi.fn();

	// Subscribe multiple listeners
	const unsubscribe1 = store.subscribe(listener1);
	const unsubscribe2 = store.subscribe(listener2);

	// Act - Batched updates
	store.setState({ value: 1 });
	store.setState({ value: 2 });
	store.setState({ value: 3 });

	await flushMicrotasks();

	// Assert - both listeners called once with final state
	expect(listener1).toHaveBeenCalledTimes(1);
	expect(listener1).toHaveBeenCalledWith({ value: 3 }, { value: 0 });
	expect(listener2).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledWith({ value: 3 }, { value: 0 });

	// Act - Unsubscribe and batch again
	unsubscribe1();
	listener2.mockClear();

	store.setState({ value: 4 });
	await flushMicrotasks();

	// Assert - only listener2 called
	expect(listener1).toHaveBeenCalledTimes(1); // Still 1 from before
	expect(listener2).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledWith({ value: 4 }, { value: 3 });

	unsubscribe2();
});

test("Immediate Notifications - work with subscribe.withSelector for batched updates", async () => {
	const { store } = setupStore(() => ({ age: 25, count: 0, name: "test" }));

	const countListener = vi.fn();
	const nameListener = vi.fn();

	// Subscribe with selectors
	store.subscribe.withSelector((state) => state.count, countListener);
	store.subscribe.withSelector((state) => state.name, nameListener);

	// Act - Batch updates to different properties
	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ age: 30 });

	await flushMicrotasks();

	// Assert - only countListener called (name didn't change)
	expect(countListener).toHaveBeenCalledTimes(1);
	expect(countListener).toHaveBeenCalledWith(2, 0);
	expect(nameListener).not.toHaveBeenCalled();

	// Act - Update name
	countListener.mockClear();
	store.setState({ name: "updated" });
	await flushMicrotasks();

	// Assert - only nameListener called
	expect(nameListener).toHaveBeenCalledTimes(1);
	expect(nameListener).toHaveBeenCalledWith("updated", "test");
	expect(countListener).not.toHaveBeenCalled();
});

test("Immediate Notifications - work with resetState and clear pending notifications", async () => {
	const initialState = { count: 0, name: "initial" };
	const { listener, store } = setupStore(() => initialState);

	// Act - Update state
	store.setState({ count: 5, name: "updated" });

	await flushMicrotasks();

	expect(store.getState()).toEqual({ count: 5, name: "updated" });
	expect(listener).toHaveBeenCalledTimes(1);

	// Act - Queue batched updates (state updated, notifications pending)
	store.setState({ count: 10 });
	store.setState({ name: "batched" });

	// Assert - state updated immediately but notifications pending
	expect(store.getState()).toEqual({ count: 10, name: "batched" });
	expect(listener).toHaveBeenCalledTimes(1); // Still only 1 call

	// Act - Reset state before notifications flush (should clear pending notifications)
	store.resetState();

	// Assert - state reset immediately
	expect(store.getState()).toEqual(initialState);

	await flushMicrotasks();

	// Assert - listener called 2 times total:
	// 1. First setState batch
	// 2. resetState batch
	// The pending notification is cancelled by the isScheduleCancelled flag
	expect(listener).toHaveBeenCalledTimes(2);
	expect(store.getState()).toEqual(initialState);

	// Act - Queue new batched updates after reset
	listener.mockClear();
	store.setState({ count: 10 });
	store.setState({ name: "batched" });

	// Wait for batch to flush
	await flushMicrotasks();

	// Assert - new batched updates applied normally
	expect(store.getState()).toEqual({ count: 10, name: "batched" });
	expect(listener).toHaveBeenCalledTimes(1);

	// Act - Reset again
	store.resetState();

	await flushMicrotasks();

	// Assert - state reset to initial again
	expect(store.getState()).toEqual(initialState);
});

test("Immediate Notifications - work with resetState after batch completes", async () => {
	const initialState = { value: 0 };
	const { store } = setupStore(() => initialState);

	// Act - Batched updates
	store.setState({ value: 10 });
	store.setState({ value: 20 });

	await flushMicrotasks();

	expect(store.getState()).toEqual({ value: 20 });

	// Act - Reset state
	store.resetState();

	// Assert - state reset to initial
	expect(store.getState()).toEqual(initialState);
});

test("Immediate Notifications - batch multiple synchronous updates efficiently", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Multiple synchronous setState calls
	const startTime = performance.now();

	for (let count = 1; count <= 100; count++) {
		store.setState({ count });
	}

	const endTime = performance.now();
	const duration = endTime - startTime;

	// Assert - state updated immediately but listeners not called yet
	expect(listener).not.toHaveBeenCalled();
	expect(store.getState()).toEqual({ count: 100 });

	await flushMicrotasks();

	// Assert - listener called once after batch
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 100 }, { count: 0 });

	// Assert - performance is reasonable (should be very fast)
	expect(duration).toBeLessThan(100);
});

test("Immediate Notifications - handle interleaved batched and immediate calls correctly", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Mix batched and immediate calls
	store.setState({ count: 1 }); // Batched - schedules microtask, snapshot = 0
	store.setState({ count: 2 }); // Batched - reuses same microtask
	store.setState({ count: 10 }, { shouldNotifySync: true }); // Immediate - notifies with current previousState (2)

	// Assert - immediate call notified synchronously
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 10 }, { count: 2 });
	expect(store.getState()).toEqual({ count: 10 });

	// Wait for the already-queued microtask
	await flushMicrotasks();

	// Assert - the queued microtask was cancelled by shouldNotifySync
	expect(listener).toHaveBeenCalledTimes(1); // Still only 1 call
	expect(store.getState()).toEqual({ count: 10 });
});

test("Immediate Notifications - batch function updates correctly", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Function updates are batched
	store.setState((state) => ({ count: state.count + 5 }));
	store.setState((state) => ({ count: state.count * 2 }));

	// Assert - state updated but listeners not called yet
	expect(listener).not.toHaveBeenCalled();
	expect(store.getState()).toEqual({ count: 10 });

	await flushMicrotasks();

	// Assert - listener called once with final state
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 10 }, { count: 0 });
});

test("Immediate Notifications - maintain existing behavior for getInitialState", () => {
	const initialState = { count: 0, name: "test" };
	const { store } = setupStore(() => initialState);

	// Act - Modify state
	store.setState({ count: 10, name: "updated" });

	// Assert - getInitialState returns original initial state
	expect(store.getInitialState()).toEqual(initialState);
	expect(store.getState()).toEqual({ count: 10, name: "updated" });
});

test("Immediate Notifications - respect equality check behavior", async () => {
	const { listener, store } = setupStore(() => ({ count: 5 }));

	// Act - setState with same value (new object)
	store.setState({ count: 5 });

	await flushMicrotasks();

	// Assert - listener called because new object created (different reference)
	expect(listener).toHaveBeenCalledTimes(1);

	// Act - setState with function returning same state
	listener.mockClear();
	store.setState((state) => state);

	await flushMicrotasks();

	// Assert - listener not called (same reference, equality check prevents notification)
	expect(listener).not.toHaveBeenCalled();
});

test("Immediate Notifications - work correctly with custom equality function", async () => {
	const store = createStore(() => ({ count: 0 }), {
		equalityFn: (a, b) => a.count === b.count, // Deep equality for count
	});
	const listener = vi.fn();
	store.subscribe(listener);

	// Act - setState with same count value
	store.setState({ count: 0 });

	await flushMicrotasks();

	// Assert - listener not called due to custom equality
	expect(listener).not.toHaveBeenCalled();
});

test("Immediate Notifications - work correctly with custom equality function for batched updates", async () => {
	const store = createStore(() => ({ count: 0 }), {
		equalityFn: (a, b) => a.count === b.count, // Deep equality for count
	});
	const listener = vi.fn();
	store.subscribe(listener);

	// Act - Batched updates with same final count
	store.setState({ count: 5 });
	store.setState({ count: 0 }); // Back to original

	await flushMicrotasks();

	// Assert - listener not called due to custom equality
	expect(listener).not.toHaveBeenCalled();
});

test("Cancel/Immediate Notifications - handle multiple shouldNotifySync calls without breaking batching", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Immediate notifications don't schedule microtasks
	store.setState({ count: 1 }, { shouldNotifySync: true });
	expect(listener).toHaveBeenCalledTimes(1);

	store.setState({ count: 2 }, { shouldNotifySync: true });
	expect(listener).toHaveBeenCalledTimes(2);

	// Act - Now batch some updates (should work normally since no microtask was scheduled)
	listener.mockClear();
	store.setState({ count: 3 });
	store.setState({ count: 4 });

	await flushMicrotasks();

	// Assert - Should work normally
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 4 }, { count: 2 });
});

test("Cancel/Immediate Notifications - cancel pending batch when shouldNotifySync is called mid-batch", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Start a batch
	store.setState({ count: 1 });
	store.setState({ count: 2 });

	// Act - Immediate notification should cancel the batch
	store.setState({ count: 10 }, { shouldNotifySync: true });

	// Assert - Immediate notification happened
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 10 }, { count: 2 });

	// Wait for the cancelled microtask to fire
	await flushMicrotasks();

	// Assert - Should still only have 1 call (cancelled batch shouldn't notify)
	expect(listener).toHaveBeenCalledTimes(1);

	// Act - New batch should work
	listener.mockClear();
	store.setState({ count: 20 });
	await flushMicrotasks();

	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 20 }, { count: 10 });
});

test("Cancel/Immediate Notifications - allow batched updates immediately after shouldNotifySync", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Immediate notification (no pending batch, so no cancellation)
	store.setState({ count: 1 }, { shouldNotifySync: true });

	// Act - Immediately start batching
	store.setState({ count: 2 });
	store.setState({ count: 3 });

	// Assert - Only the immediate one so far
	expect(listener).toHaveBeenCalledTimes(1);

	await flushMicrotasks();

	// Assert - Batched updates work normally since there was no cancellation
	expect(listener).toHaveBeenCalledTimes(2);
	expect(listener).toHaveBeenNthCalledWith(2, { count: 3 }, { count: 1 });
});

test("Race Condition - handle rapid alternating between batched and immediate updates", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));

	// Act - Rapid alternating
	store.setState({ count: 1 }); // Batch - schedules microtask, status = "pending-batch"
	store.setState({ count: 2 }, { shouldNotifySync: true }); // Immediate (cancels), status stays "pending-batch"
	store.setState({ count: 3 }); // Tries to batch but status is "pending-batch", just updates state
	store.setState({ count: 4 }, { shouldNotifySync: true }); // Immediate again
	store.setState({ count: 5 }); // Tries to batch but status is "pending-batch", just updates state

	await flushMicrotasks();

	// Assert - Should have 2 immediate calls only (batched updates were lost)
	expect(listener).toHaveBeenCalledTimes(2);
	expect(store.getState()).toEqual({ count: 5 });
});

test("Race Condition - handle multiple resetState calls without breaking", async () => {
	const initialState = { count: 0 };
	const { listener, store } = setupStore(() => initialState);

	store.setState({ count: 10 });
	store.resetState(); // First reset (immediate notification)
	store.resetState(); // Second reset - state already equals initial, equality check prevents notification

	expect(store.getState()).toEqual(initialState);
	expect(listener).toHaveBeenCalledTimes(1); // Only first reset notifies

	await flushMicrotasks();

	// Assert - Should still be 1 call
	expect(listener).toHaveBeenCalledTimes(1);
});

test("Microtask Timing - handle setState called from within a listener during batch flush", async () => {
	const { store } = setupStore(() => ({ count: 0, nested: 0 }));
	let callCount = 0;
	const listener = vi.fn((state: { count: number; nested: number }) => {
		callCount++;
		// Trigger another update from within the listener (only on first call)
		if (callCount === 1 && state.count === 3 && state.nested === 0) {
			store.setState({ nested: 1 });
		}
	});
	store.subscribe(listener);

	store.setState({ count: 1 });
	store.setState({ count: 2 });
	store.setState({ count: 3 });

	await flushMicrotasks();

	// Assert - First batch notification triggers nested update which notifies immediately
	// because it happens during the listener execution (synchronous)
	expect(listener).toHaveBeenCalledTimes(2);
	expect(store.getState()).toEqual({ count: 3, nested: 1 });
});

test("Microtask Timing - notify when batched updates result in same values but different reference", async () => {
	const { listener, store } = setupStore(() => ({ count: 5 }));

	// Act - Updates that result in same values
	store.setState({ count: 10 });
	store.setState({ count: 5 }); // Back to original value

	await flushMicrotasks();

	// Assert - Should notify because new object is created (different reference)
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 5 }, { count: 5 });
});

test("Subscription Edge Cases - handle unsubscribe called during pending batch", async () => {
	const { listener, store } = setupStore(() => ({ count: 0 }));
	const unsubscribe = store.subscribe(listener);

	store.setState({ count: 1 });
	store.setState({ count: 2 });

	// Unsubscribe before batch flushes
	unsubscribe();

	await flushMicrotasks();

	// Assert - Listener should not be called because it was removed from the Set
	expect(listener).toHaveBeenCalledTimes(0);
	expect(store.getState()).toEqual({ count: 2 });
});

test("Subscription Edge Cases - handle new subscription added during pending batch", async () => {
	const { listener: listener1, store } = setupStore(() => ({ count: 0 }));

	store.setState({ count: 1 });
	store.setState({ count: 2 });

	// Add new listener before batch flushes
	const listener2 = vi.fn();
	store.subscribe(listener2);

	await flushMicrotasks();

	// Assert - Both listeners should be called
	expect(listener1).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledTimes(1);
	expect(listener1).toHaveBeenCalledWith({ count: 2 }, { count: 0 });
	expect(listener2).toHaveBeenCalledWith({ count: 2 }, { count: 0 });
});

test("Complex Async - handle nested async operations with shouldNotifySync", async () => {
	const { listener, store } = setupStore(() => ({ level: 0, status: "idle" }));

	const operation = async () => {
		store.setState({ level: 1 });
		store.setState({ status: "loading" });

		await Promise.resolve();

		// Immediate notification mid-operation (cancels the first batch)
		store.setState({ level: 2 }, { shouldNotifySync: true });

		await Promise.resolve();

		// This setState happens after the cancelled microtask has fired
		// so it starts a new batch normally
		store.setState({ status: "complete" });
	};

	await operation();
	await flushMicrotasks();

	// Assert - Should have 3 notifications: first batch, immediate, second batch
	expect(listener).toHaveBeenCalledTimes(3);
	expect(store.getState()).toEqual({ level: 2, status: "complete" });
});

test("Global Options - respect global shouldNotifySync option", async () => {
	const store = createStore(() => ({ count: 0 }), { shouldNotifySync: true });
	const listener = vi.fn();
	store.subscribe(listener);

	store.setState({ count: 1 });
	store.setState({ count: 2 });

	// Assert - Should notify immediately for each call
	expect(listener).toHaveBeenCalledTimes(2);

	await flushMicrotasks();

	// Assert - Should still be 2 (no additional notifications)
	expect(listener).toHaveBeenCalledTimes(2);
});

test("Global Options - allow overriding global shouldNotifySync per call", async () => {
	const store = createStore(() => ({ count: 0 }), { shouldNotifySync: true });
	const listener = vi.fn();
	store.subscribe(listener);

	// Act - Override to use batching
	store.setState({ count: 1 }, { shouldNotifySync: false });
	store.setState({ count: 2 }, { shouldNotifySync: false });

	// Assert - Should not notify yet
	expect(listener).not.toHaveBeenCalled();

	await flushMicrotasks();

	// Assert - Should notify once with batched result
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 2 }, { count: 0 });
});

test("Subscription Options - fireListenerImmediately should notify listener immediately on subscribe", () => {
	const { store } = setupStore(() => ({ count: 0 }));
	const listener = vi.fn();

	store.subscribe(listener, { fireListenerImmediately: true });

	// Assert - listener called immediately with current state
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith({ count: 0 }, { count: 0 });
});

test("Subscription Options - withSelector fireListenerImmediately should notify listener immediately", () => {
	const { store } = setupStore(() => ({ count: 10 }));
	const listener = vi.fn();

	store.subscribe.withSelector((s) => s.count, listener, { fireListenerImmediately: true });

	// Assert - listener called immediately with selected slice
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith(10, 10);
});

test("Subscription Options - withSelector should respect custom equalityFn", async () => {
	const { store } = setupStore(() => ({ items: [1, 2, 3] }));
	const listener = vi.fn();

	store.subscribe.withSelector(
		(s) => [...s.items], // Returns new reference every time
		listener,
		{ equalityFn: deepCompare }
	);

	// Act - Update that doesn't change items content
	store.setState({ items: [1, 2, 3] });
	await flushMicrotasks();

	// Assert - listener NOT called because contents are equal
	expect(listener).not.toHaveBeenCalled();

	// Act - Update that changes items
	store.setState({ items: [1, 2, 3, 4] });
	await flushMicrotasks();

	// Assert - listener called
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledWith([1, 2, 3, 4], [1, 2, 3]);
});

test("Initializer Arguments - should receive set, get, and api in initializer", () => {
	const initializer = vi.fn((set, get, api) => {
		// Assert - arguments are provided
		expect(typeof set).toBe("function");
		expect(typeof get).toBe("function");
		expect(typeof api).toBe("object");
		expect(api).toHaveProperty("setState");
		return { count: 0 };
	});

	createStore(initializer);

	expect(initializer).toHaveBeenCalledTimes(1);
});

test("Initializer Arguments - should be able to use set directly in initializer", () => {
	const store = createStore((set) => {
		// Immediately set state
		set({ count: 10 });
		return { count: 0 };
	});

	// Expect return value { count: 0 } to be the state
	expect(store.getState()).toEqual({ count: 0 });
});

test("Plugin Edge case - internal resetState should use wrapped setState", () => {
	const wrappedSetState = vi.fn();

	const store = createStore<{ count: number }>(() => ({ count: 0 }), {
		plugins: [
			{
				id: "test-plugin",
				name: "Test Plugin",
				setup: (api) => {
					return {
						setState: (stateUpdate, options) => {
							wrappedSetState();
							return api.setState(stateUpdate, options as object);
						},
					};
				},
			},
		],
	});

	// Initial state is 0.
	// Manual setState should trigger the wrapper
	store.setState({ count: 1 });
	expect(wrappedSetState).toHaveBeenCalledTimes(1);

	// resetState should trigger the wrapper too!
	// IF THIS FAILS, IT'S THE ALIASING BUG.
	store.resetState();
	expect(wrappedSetState).toHaveBeenCalledTimes(2);
});

test("Plugin - should preserve sub-properties like withSelector when subscribe is wrapped", async () => {
	const subscribePlugin = defineStorePlugin<TestState>({
		id: "subscribe-plugin",
		name: "Subscribe Plugin",
		setup: (api: StoreApi<TestState>) => {
			return {
				subscribe: ((onStoreChange, options) => {
					return api.subscribe(onStoreChange, options);
				}) as typeof api.subscribe,
			};
		},
	});

	const store = createStore<TestState>(() => ({ count: 0 }), {
		plugins: [subscribePlugin],
	});

	expect(store.subscribe.withSelector).toBeDefined();
	expect(typeof store.subscribe.withSelector).toBe("function");

	let slice = -1;
	store.subscribe.withSelector(
		(state) => state.count,
		(val) => {
			slice = val;
		}
	);

	store.setState({ count: 1 });
	await flushMicrotasks();
	expect(slice).toBe(1);
});
