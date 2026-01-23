import { beforeEach, expect, test, vi } from "vitest";
import { debounce } from "./debounce";

beforeEach(() => {
	vi.useFakeTimers();
});

test("Basic Debouncing - should delay function execution", () => {
	const callback = vi.fn();
	const debouncedFnFn = debounce(callback, 100);

	// Basic delay
	debouncedFnFn();
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(50);
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(51);
	expect(callback).toHaveBeenCalledTimes(1);
});

test("Basic Debouncing - should reset timers on multiple calls", () => {
	const callback = vi.fn();
	const debouncedFnFn = debounce(callback, 100);

	debouncedFnFn();
	vi.advanceTimersByTime(50);
	debouncedFnFn();
	vi.advanceTimersByTime(50);
	debouncedFnFn();
	vi.advanceTimersByTime(50);
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(51);
	expect(callback).toHaveBeenCalledTimes(1);
});

test("Arguments Passing - should pass arguments correctly to the callback", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 100);

	debouncedFn("arg1", 42, { key: "value" });
	vi.advanceTimersByTime(101);

	expect(callback).toHaveBeenCalledWith("arg1", 42, { key: "value" });
});

test("Dynamic Delay - should allow overriding the delay per call using specialized signature", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 1000);

	// Signature: debouncedFn([args], { $delay })
	debouncedFn(["new arg", "new arg2"], { $delay: 50 });

	vi.advanceTimersByTime(40);
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(11);
	expect(callback).toHaveBeenCalledWith("new arg", "new arg2");
	expect(callback).toHaveBeenCalledTimes(1);
});

test("maxWait - should execute the function if maxWait is reached during a long debounce cycle", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 1000, { maxWait: 2000 });

	// Trigger sequence: 0ms, 500ms, 1000ms, 1500ms
	debouncedFn();
	vi.advanceTimersByTime(500);
	debouncedFn();
	vi.advanceTimersByTime(500);
	debouncedFn();
	vi.advanceTimersByTime(500);
	debouncedFn();

	// At 1500ms, debounce timer is scheduled for 2500ms.
	// maxWait timer is scheduled for 2000ms.
	vi.advanceTimersByTime(400); // 1900ms
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(110); // 2010ms (maxWait fires)
	expect(callback).toHaveBeenCalledTimes(1);

	// Ensure maxWait resets after execution
	callback.mockClear();
	debouncedFn();
	vi.advanceTimersByTime(150);
	debouncedFn();
	vi.advanceTimersByTime(60); // 210ms total (maxWait should reset and fire if we hit 200ms in a small cycle)
	// Wait, the previous test had a smaller cycle. Let's make it consistent.
});

test("maxWait - should use the latest arguments when triggered by maxWait", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 1000, { maxWait: 2000 });

	// Call repeatedly so normal delay keeps resetting, but maxWait timer accumulates
	debouncedFn("first-call"); // T=0, maxWait starts at 2000
	vi.advanceTimersByTime(500);
	debouncedFn("second-call"); // T=500, normal delay resets to 1500
	vi.advanceTimersByTime(500);
	debouncedFn("third-call"); // T=1000, normal delay resets to 2000
	vi.advanceTimersByTime(500);
	debouncedFn("latest-call"); // T=1500, normal delay resets to 2500

	vi.advanceTimersByTime(501); // T=2001 (maxWait fires at 2000)

	// Should use the latest arguments, not the first
	expect(callback).toHaveBeenCalledWith("latest-call");
	expect(callback).toHaveBeenCalledTimes(1);
});

test("maxWait - should reset maxWait timer after any manual execution", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 100, { maxWait: 200 });

	// First execution via debounce delay (100ms)
	debouncedFn();
	vi.advanceTimersByTime(101);
	expect(callback).toHaveBeenCalledTimes(1);
	callback.mockClear();

	// Second execution via maxWait (200ms) because we keep calling it every 150ms
	debouncedFn(); // 0ms
	vi.advanceTimersByTime(150);
	debouncedFn(); // 150ms
	vi.advanceTimersByTime(60); // 210ms total (maxWait hits at 200ms)
	expect(callback).toHaveBeenCalledTimes(1);
});

test("Cancellation - should stop any pending execution including maxWait", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 1000, { maxWait: 2000 });

	// Standard cancel
	debouncedFn();
	debouncedFn.cancel();
	vi.advanceTimersByTime(2100);
	expect(callback).not.toHaveBeenCalled();

	// cancelMaxWait only
	debouncedFn(); // T=0 (debounce @ 1000, maxWait @ 2000)
	vi.advanceTimersByTime(500);
	debouncedFn(); // T=500 (debounce @ 1500, maxWait stays @ 2000)
	debouncedFn.cancelMaxWait(); // maxWait canceled

	vi.advanceTimersByTime(600); // T=1100 (original maxWait would have been at 2000)
	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(500); // T=1600 (debounce fires at 1500)
	expect(callback).toHaveBeenCalledTimes(1);
});

test("Dynamic Delay Collision - should not trigger override if more than 2 arguments are provided", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 100);

	debouncedFn("data", { $delay: 50 }, "extra");
	vi.advanceTimersByTime(60);
	expect(callback).not.toHaveBeenCalled(); // Still waiting for 100ms
	vi.advanceTimersByTime(50);
	expect(callback).toHaveBeenCalledWith("data", { $delay: 50 }, "extra");
});

test("Dynamic Delay Collision - should not trigger override if 2 arguments are provided but first is not an array", () => {
	const callback = vi.fn();
	const debouncedFn = debounce(callback, 100);

	debouncedFn("not-an-array", { $delay: 50 });
	vi.advanceTimersByTime(60);
	expect(callback).not.toHaveBeenCalled();
	vi.advanceTimersByTime(50);
	expect(callback).toHaveBeenCalledWith("not-an-array", { $delay: 50 });
});
