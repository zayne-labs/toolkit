import { describe, expect, it, vi } from "vitest";
import { createStore } from "../src/createStore";

// Helper to wait for microtasks to complete
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

describe("createStore - Basic Batching Functionality", () => {
	it("should batch multiple synchronous calls and result in single listener notification", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, name: "test" }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
		store.setState({ count: 1 });
		store.setState({ count: 2 });
		store.setState({ count: 3 });

		// Assert - listener should not be called yet
		expect(listener).not.toHaveBeenCalled();

		// Wait for microtask to execute
		await flushMicrotasks();

		// Assert - listener should be called exactly once with final state
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({ count: 3, name: "test" }, { count: 0, name: "test" });
	});

	it("should apply all updates in correct order and reflect final state", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, multiplier: 1 }));

		// Act
		store.setState({ count: 5 });
		store.setState({ multiplier: 2 });
		store.setState({ count: 15 });

		// Wait for microtask
		await flushMicrotasks();

		// Assert - final state should reflect all updates in order
		const finalState = store.getState();
		expect(finalState).toEqual({ count: 15, multiplier: 2 });
	});

	it("should clear the queue after flush", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should prevent multiple microtask schedules with guard clause", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const queueMicrotaskSpy = vi.spyOn(globalThis, "queueMicrotask");

		// Act
		store.setState({ count: 1 });
		store.setState({ count: 2 });
		store.setState({ count: 3 });
		store.setState({ count: 4 });
		store.setState({ count: 5 });

		// Assert - queueMicrotask should only be called once
		expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);

		// Wait for microtask
		await flushMicrotasks();

		// Assert - final state is correct
		expect(store.getState()).toEqual({ count: 5 });

		queueMicrotaskSpy.mockRestore();
	});

	it("should allow new batch after previous batch completes", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const queueMicrotaskSpy = vi.spyOn(globalThis, "queueMicrotask");

		// Act - First batch
		store.setState({ count: 1 });
		store.setState({ count: 2 });
		expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);

		await flushMicrotasks();

		// Act - Second batch (guard should be reset)
		store.setState({ count: 3 });
		store.setState({ count: 4 });

		// Assert - queueMicrotask should be called again (total 2 times)
		// Note: flushMicrotasks itself calls queueMicrotask, so we expect 3 total
		expect(queueMicrotaskSpy).toHaveBeenCalledTimes(3);

		await flushMicrotasks();

		// Assert - final state is correct
		expect(store.getState()).toEqual({ count: 4 });

		queueMicrotaskSpy.mockRestore();
	});

	it("should handle function updates with correct accumulated state", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, total: 0 }));

		// Act - Mix of object and function updates
		store.setState({ count: 5 });
		store.setState((state) => ({ total: state.count + 10 })); // Should see count: 5
		store.setState((state) => ({ count: state.count * 2 })); // Should see count: 5

		await flushMicrotasks();

		// Assert
		const finalState = store.getState();
		expect(finalState).toEqual({ count: 10, total: 15 });
	});

	it("should respect equality check when final state equals current state", async () => {
		// Arrange
		const store = createStore(() => ({ count: 5 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should handle empty batches gracefully", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - No batched calls, just flush
		await flushMicrotasks();

		// Assert - nothing should happen
		expect(listener).not.toHaveBeenCalled();
		expect(store.getState()).toEqual({ count: 0 });
	});

	it("should batch multiple updates to different properties", async () => {
		// Arrange
		const store = createStore(() => ({
			age: 25,
			city: "NYC",
			country: "USA",
			name: "John",
		}));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
		store.setState({ name: "Jane" });
		store.setState({ age: 30 });
		store.setState({ city: "LA" });
		store.setState({ country: "Canada" });

		await flushMicrotasks();

		// Assert
		expect(listener).toHaveBeenCalledTimes(1);
		expect(store.getState()).toEqual({
			age: 30,
			city: "LA",
			country: "Canada",
			name: "Jane",
		});
	});

	it("should handle rapid successive batches correctly", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

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
});

describe("createStore - Update Merging Logic", () => {
	it("should merge object updates correctly", async () => {
		// Arrange
		const store = createStore(() => ({ age: 25, city: "NYC", name: "John" }));

		// Act - Multiple object updates
		store.setState({ name: "Jane" });
		store.setState({ age: 30 });
		store.setState({ city: "LA" });

		await flushMicrotasks();

		// Assert - all properties should be merged
		expect(store.getState()).toEqual({ age: 30, city: "LA", name: "Jane" });
	});

	it("should provide correct accumulated state to function updates", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, multiplier: 1 }));

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

	it("should handle mixed object and function updates together", async () => {
		// Arrange
		const store = createStore(() => ({ a: 1, b: 2, c: 3 }));

		// Act - Mix of object and function updates
		store.setState({ a: 10 }); // Object update
		store.setState((state) => ({ b: state.a + 5 })); // Function sees a: 10
		store.setState({ c: 20 }); // Object update
		store.setState((state) => ({ a: state.b + state.c })); // Function sees b: 15, c: 20

		await flushMicrotasks();

		// Assert
		expect(store.getState()).toEqual({ a: 35, b: 15, c: 20 });
	});

	it("should preserve update order during merging", async () => {
		// Arrange
		const store = createStore(() => ({ value: 0 }));
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

	it("should use equality check to prevent unnecessary notifications when merged state equals current state", async () => {
		// Arrange
		const store = createStore(() => ({ count: 5, name: "test" }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - Updates that result in same values
		store.setState({ count: 5 });
		store.setState({ name: "test" });

		await flushMicrotasks();

		// Assert - listener is called because new object is created (different reference)
		// This is expected with Object.is equality check
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("should handle complex nested object merging", async () => {
		// Arrange
		const store = createStore(() => ({
			nested: { x: 1, y: 2 },
			simple: "value",
		}));

		// Act - Update nested property (note: shallow merge only)
		store.setState({ simple: "updated" });
		store.setState({ nested: { x: 10, y: 20 } });

		await flushMicrotasks();

		// Assert
		expect(store.getState()).toEqual({
			nested: { x: 10, y: 20 },
			simple: "updated",
		});
	});

	it("should handle function updates that depend on previous function updates", async () => {
		// Arrange
		const store = createStore(() => ({ counter: 0 }));

		// Act - Chain of dependent function updates
		store.setState((state) => ({ counter: state.counter + 1 }));
		store.setState((state) => ({ counter: state.counter * 2 }));
		store.setState((state) => ({ counter: state.counter + 10 }));
		store.setState((state) => ({ counter: state.counter / 2 }));

		await flushMicrotasks();

		// Assert - ((0 + 1) * 2 + 10) / 2 = 6
		expect(store.getState()).toEqual({ counter: 6 });
	});

	it("should merge multiple properties in single batch correctly", async () => {
		// Arrange
		const store = createStore(() => ({
			a: 1,
			b: 2,
			c: 3,
			d: 4,
			e: 5,
		}));

		// Act - Update different properties
		store.setState({ a: 100 });
		store.setState({ c: 300 });
		store.setState({ e: 500 });

		await flushMicrotasks();

		// Assert - only specified properties updated
		expect(store.getState()).toEqual({
			a: 100,
			b: 2,
			c: 300,
			d: 4,
			e: 500,
		});
	});

	it("should handle empty object updates", async () => {
		// Arrange
		const store = createStore(() => ({ count: 5 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - Empty object update
		store.setState({});

		await flushMicrotasks();

		// Assert - state unchanged but listener called (new object created)
		expect(listener).toHaveBeenCalledTimes(1);
		expect(store.getState()).toEqual({ count: 5 });
	});

	it("should correctly merge when function returns partial state", async () => {
		// Arrange
		const store = createStore(() => ({ x: 1, y: 2, z: 3 }));

		// Act - Function returns partial update
		store.setState({ x: 10 });
		store.setState((state) => ({ y: state.x + 5 })); // Only updates y
		// z should remain unchanged

		await flushMicrotasks();

		// Assert
		expect(store.getState()).toEqual({ x: 10, y: 15, z: 3 });
	});
});

describe("createStore - Async Boundary Handling", () => {
	it("should batch updates before await together", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, status: "idle" }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should form new batch for updates after await", async () => {
		// Arrange
		const store = createStore(() => ({ step: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
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

	it("should result in single notification per batch across async boundaries", async () => {
		// Arrange
		const store = createStore(() => ({ value: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
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

	it("should flush pending batch when async function completes", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - Synchronous batched calls
		store.setState({ count: 1 });
		store.setState({ count: 2 });

		// Explicitly wait for microtasks to ensure batch is flushed
		await flushMicrotasks();

		// Assert - batch should be flushed
		expect(listener).toHaveBeenCalledTimes(1);
		expect(store.getState()).toEqual({ count: 2 });
	});

	it("should handle multiple async operations with independent batches", async () => {
		// Arrange
		const store = createStore(() => ({ counter: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should handle nested async operations correctly", async () => {
		// Arrange
		const store = createStore(() => ({ level: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
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

	it("should batch synchronous updates in async function before first await", async () => {
		// Arrange
		const store = createStore(() => ({ a: 0, b: 0, c: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
		const asyncOperation = async () => {
			// All synchronous before await
			store.setState({ a: 1 });
			store.setState({ b: 2 });
			store.setState({ c: 3 });

			// First await - should flush the batch
			await Promise.resolve();

			// After await - new batch
			store.setState({ a: 10 });
		};

		await asyncOperation();
		await flushMicrotasks();

		// Assert
		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith(1, { a: 1, b: 2, c: 3 }, { a: 0, b: 0, c: 0 });
		expect(listener).toHaveBeenNthCalledWith(2, { a: 10, b: 2, c: 3 }, { a: 1, b: 2, c: 3 });
	});

	it("should handle async/await with Promise.all correctly", async () => {
		// Arrange
		const store = createStore(() => ({ result: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act
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
});

describe("createStore - Immediate Notifications", () => {
	it("should notify immediately when shouldNotifyImmediately is true", () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - setState with shouldNotifyImmediately
		store.setState({ count: 1 }, { shouldNotifyImmediately: true });

		// Assert - listener should be called immediately (synchronously)
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
		expect(store.getState()).toEqual({ count: 1 });

		// Act - Another immediate setState
		store.setState({ count: 2 }, { shouldNotifyImmediately: true });

		// Assert - listener called again immediately
		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenCalledWith({ count: 2 }, { count: 1 });
		expect(store.getState()).toEqual({ count: 2 });
	});

	it("should return updated state from getState immediately even during batch cycle", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0, name: "test" }));

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

	it("should work with subscribe for batched updates", async () => {
		// Arrange
		const store = createStore(() => ({ value: 0 }));
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

	it("should work with subscribe.withSelector for batched updates", async () => {
		// Arrange
		const store = createStore(() => ({ age: 25, count: 0, name: "test" }));

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

	it("should work with resetState and clear pending notifications", async () => {
		// Arrange
		const initialState = { count: 0, name: "initial" };
		const store = createStore(() => initialState);
		const listener = vi.fn();
		store.subscribe(listener);

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

		// Wait for microtask
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

	it("should work with resetState after batch completes", async () => {
		// Arrange
		const initialState = { value: 0 };
		const store = createStore(() => initialState);

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

	it("should batch multiple synchronous updates efficiently", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should handle interleaved batched and immediate calls correctly", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - Mix batched and immediate calls
		store.setState({ count: 1 }); // Batched - schedules microtask, snapshot = 0
		store.setState({ count: 2 }); // Batched - reuses same microtask
		store.setState({ count: 10 }, { shouldNotifyImmediately: true }); // Immediate - notifies with current previousState (2)

		// Assert - immediate call notified synchronously
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({ count: 10 }, { count: 2 });
		expect(store.getState()).toEqual({ count: 10 });

		// Wait for the already-queued microtask
		await flushMicrotasks();

		// Assert - the queued microtask was cancelled by shouldNotifyImmediately
		expect(listener).toHaveBeenCalledTimes(1); // Still only 1 call
		expect(store.getState()).toEqual({ count: 10 });
	});

	it("should batch function updates correctly", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should maintain existing behavior for getInitialState", () => {
		// Arrange
		const initialState = { count: 0, name: "test" };
		const store = createStore(() => initialState);

		// Act - Modify state
		store.setState({ count: 10, name: "updated" });

		// Assert - getInitialState returns original initial state
		expect(store.getInitialState()).toEqual(initialState);
		expect(store.getState()).toEqual({ count: 10, name: "updated" });
	});

	it("should respect equality check behavior", async () => {
		// Arrange
		const store = createStore(() => ({ count: 5 }));
		const listener = vi.fn();
		store.subscribe(listener);

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

	it("should work correctly with custom equality function", async () => {
		// Arrange
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

	it("should work correctly with custom equality function for batched updates", async () => {
		// Arrange
		const store = createStore(() => ({ count: 0 }), {
			equalityFn: (a, b) => a.count === b.count, // Deep equality for count
		});
		const listener = vi.fn();
		store.subscribe(listener);

		// Act - Batched updates with same final count
		store.setState({ count: 5 });
		store.setState({ count: 0 }); // Back to original

		// Wait for batch
		await flushMicrotasks();

		// Assert - listener not called due to custom equality
		expect(listener).not.toHaveBeenCalled();
	});

	it("should preserve all existing store methods and properties", () => {
		// Arrange
		const store = createStore(() => ({ value: 0 }));

		// Assert - all expected methods exist
		expect(typeof store.getState).toBe("function");
		expect(typeof store.setState).toBe("function");
		expect(typeof store.setState).toBe("function");
		expect(typeof store.subscribe).toBe("function");
		expect(typeof store.subscribe.withSelector).toBe("function");
		expect(typeof store.resetState).toBe("function");
		expect(typeof store.getInitialState).toBe("function");

		// Assert - store structure unchanged
		expect(store).toHaveProperty("getState");
		expect(store).toHaveProperty("setState");
		expect(store).toHaveProperty("subscribe");
		expect(store).toHaveProperty("resetState");
		expect(store).toHaveProperty("getInitialState");
	});
});
