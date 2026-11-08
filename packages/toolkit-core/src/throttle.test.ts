import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { throttleByFrame, throttleByTimeout } from "./throttle";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

test("throttleByTimeout - invokes once per window with the latest arguments", () => {
	const callback = vi.fn();
	const throttled = throttleByTimeout(callback, 100);

	throttled("a");
	throttled("b");
	throttled("c");

	expect(callback).not.toHaveBeenCalled();

	vi.advanceTimersByTime(100);
	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith("c");
});

test("throttleByTimeout - keeps working after cancelTimeout", () => {
	const callback = vi.fn();
	const throttled = throttleByTimeout(callback, 100);

	throttled("cancelled");
	throttled.cancelTimeout();

	vi.advanceTimersByTime(100);
	expect(callback).not.toHaveBeenCalled();

	throttled("after-cancel");
	vi.advanceTimersByTime(100);
	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith("after-cancel");
});

test("throttleByFrame - invokes once per frame with the latest arguments", () => {
	const callback = vi.fn();
	const throttled = throttleByFrame(callback);

	throttled("a");
	throttled("b");

	vi.advanceTimersToNextFrame();
	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith("b");
});

test("throttleByFrame - keeps working after cancelAnimation", () => {
	const callback = vi.fn();
	const throttled = throttleByFrame(callback);

	throttled("cancelled");
	throttled.cancelAnimation();

	vi.advanceTimersToNextFrame();
	expect(callback).not.toHaveBeenCalled();

	throttled("after-cancel");
	vi.advanceTimersToNextFrame();
	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith("after-cancel");
});
