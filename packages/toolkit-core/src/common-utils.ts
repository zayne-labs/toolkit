import { isArray, isBoolean, type AnyFunction } from "@zayne-labs/toolkit-type-helpers";

/**
 * @description Wraps a value in an array if it's not already an array.
 * @param value - The value to ensure is an array.
 * @returns An array containing the value(s).
 */
export const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

/**
 * @description Converts a condition to a data attribute value ("true" or undefined).
 * @param condition - The condition to evaluate.
 * @returns "true" if the condition is truthy, otherwise undefined.
 */
export const dataAttr = (condition: unknown) => (condition ? "true" : undefined) as unknown as boolean;

/**
 * @description A tagged template literal for CSS strings. Joins the template strings and values into a raw string, then trims it.
 */
export const css = (
	strings: TemplateStringsArray,
	...values: Array<boolean | number | string | null | undefined>
) => {
	return String.raw(
		{ raw: strings },
		...values.map((value) => (value == null || isBoolean(value) ? "" : value))
	).trim();
};

/**
 * @description A tagged template literal for Tailwind CSS classes.
 * Interpolations are NOT allowed in 'tw' to maintain static analysis compatibility.
 * Use the `css` utility if you need dynamic values.
 */
export const tw = (
	strings: TemplateStringsArray,
	..._values: Array<"Interpolations are NOT allowed in 'tw' tag. Use 'css' instead.">
) => {
	return String.raw({ raw: strings }).trim();
};

/**
 * @description A utility for chaining function transformations in a type-safe way.
 * @param value - The initial value to start the pipeline.
 * @param functions - A sequence of functions to apply to the value.
 * @returns The final result after applying all functions.
 */
export const pipeline: PipelineFn = (value: unknown, ...functions: AnyFunction[]) => {
	let result = value;

	for (const func of functions) {
		result = func(result);
	}

	return result;
};

type PipelineFn = {
	<A>(data: A): A;
	<A, B>(data: A, funcA: (input: A) => B): B;
	<A, B, C>(data: A, funcA: (input: A) => B, funcB: (input: B) => C): C;
	<A, B, C, D>(data: A, funcA: (input: A) => B, funcB: (input: B) => C, funcC: (input: C) => D): D;
	<A, B, C, D, E>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E
	): E;
	<A, B, C, D, E, F>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F
	): F;
	<A, B, C, D, E, F, G>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G
	): G;
	<A, B, C, D, E, F, G, H>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H
	): H;
	<A, B, C, D, E, F, G, H, I>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I
	): I;
	<A, B, C, D, E, F, G, H, I, J>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J
	): J;
	<A, B, C, D, E, F, G, H, I, J, K>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K
	): K;
	<A, B, C, D, E, F, G, H, I, J, K, L>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K,
		funcK: (input: K) => L
	): L;
	<A, B, C, D, E, F, G, H, I, J, K, L, M>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K,
		funcK: (input: K) => L,
		funcL: (input: L) => M
	): M;
	<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K,
		funcK: (input: K) => L,
		funcL: (input: L) => M,
		funcM: (input: M) => N
	): N;
	<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K,
		funcK: (input: K) => L,
		funcL: (input: L) => M,
		funcM: (input: M) => N,
		funcN: (input: N) => O
	): O;
	<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
		data: A,
		funcA: (input: A) => B,
		funcB: (input: B) => C,
		funcC: (input: C) => D,
		funcD: (input: D) => E,
		funcE: (input: E) => F,
		funcF: (input: F) => G,
		funcG: (input: G) => H,
		funcH: (input: H) => I,
		funcI: (input: I) => J,
		funcJ: (input: J) => K,
		funcK: (input: K) => L,
		funcL: (input: L) => M,
		funcM: (input: M) => N,
		funcN: (input: N) => O,
		funcO: (input: O) => P
	): P;
};
