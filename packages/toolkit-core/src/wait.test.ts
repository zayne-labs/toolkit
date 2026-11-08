import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { waitFor } from "./wait";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

test("resolves after the given delay", async () => {
	const onResolve = vi.fn();

	void waitFor(100).then(onResolve);

	await vi.advanceTimersByTimeAsync(99);
	expect(onResolve).not.toHaveBeenCalled();

	await vi.advanceTimersByTimeAsync(1);
	expect(onResolve).toHaveBeenCalledTimes(1);
});

test("supports { seconds } and { milliseconds }", async () => {
	const onSeconds = vi.fn();
	const onMilliseconds = vi.fn();

	void waitFor({ seconds: 1 }).then(onSeconds);
	void waitFor({ milliseconds: 500 }).then(onMilliseconds);

	await vi.advanceTimersByTimeAsync(500);
	expect(onMilliseconds).toHaveBeenCalledTimes(1);
	expect(onSeconds).not.toHaveBeenCalled();

	await vi.advanceTimersByTimeAsync(500);
	expect(onSeconds).toHaveBeenCalledTimes(1);
});

test("returns a resolved promise for a zero delay", async () => {
	const result = waitFor(0);

	expect(result).toBeInstanceOf(Promise);
	await expect(result).resolves.toBeUndefined();
});
