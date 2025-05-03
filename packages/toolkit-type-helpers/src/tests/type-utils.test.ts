import type { Writeable } from "@/type-utils";
import { expectTypeOf, test } from "vitest";

// Type tests
type Expect<T extends true> = T;

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// Basic Type Level Tests
// eslint-disable-next-line ts-eslint/no-unused-vars -- Need them for type tests
type TypeTestsForWritable = [
	// Test 1: Basic object
	Expect<Equal<Writeable<{ readonly a: string }>, { a: string }>>,

	// Test 2: Nested object (shallow)
	Expect<Equal<Writeable<{ readonly a: { readonly b: string } }>, { a: { readonly b: string } }>>,

	// Test 3: Nested object (deep)
	Expect<Equal<Writeable<{ readonly a: { readonly b: string } }, "deep">, { a: { b: string } }>>,

	// Test 4: Array
	Expect<Equal<Writeable<readonly string[]>, string[]>>,

	// Test 5: Union type
	Expect<
		Equal<Writeable<{ readonly a: string } | { readonly b: number }>, { a: string } | { b: number }>
	>,

	// Test 6: Type with functions
	Expect<
		Equal<
			Writeable<{ readonly a: string; readonly b: () => string }, "deep">,
			{ a: string; b: () => string }
		>
	>,

	// Test 6: Tuple
	Expect<Equal<Writeable<readonly [string, number]>, [string, number]>>,

	// Test 7: ReadonlyArray
	Expect<Equal<Writeable<readonly string[]>, string[]>>,

	// Test 8: Object with optional and literal types
	Expect<
		Equal<
			Writeable<{ readonly id: "test"; readonly optional?: number }>,
			{ id: "test"; optional?: number }
		>
	>,
];

// Vitest version of the tests
test("The writeable type works properly", () => {
	// Test 1: Basic object
	expectTypeOf<Writeable<{ readonly a: string }>>().toEqualTypeOf<{ a: string }>();

	// Test 2: Nested object (shallow)
	expectTypeOf<Writeable<{ readonly a: { readonly b: string } }>>().toEqualTypeOf<{
		a: { readonly b: string };
	}>();

	// Test 3: Nested object (deep)
	expectTypeOf<Writeable<{ readonly a: { readonly b: string } }, "deep">>().toEqualTypeOf<{
		a: { b: string };
	}>();

	// Test 4: Array
	expectTypeOf<Writeable<readonly string[]>>().toEqualTypeOf<string[]>();

	// Test 5: Union type
	expectTypeOf<Writeable<{ readonly a: string } | { readonly b: number }>>().toEqualTypeOf<
		{ a: string } | { b: number }
	>();

	// Test 6: Tuple
	expectTypeOf<Writeable<readonly [string, number]>>().toEqualTypeOf<[string, number]>();

	// Test 7: ReadonlyArray
	expectTypeOf<Writeable<readonly string[]>>().toEqualTypeOf<string[]>();

	// Test 8: Object with optional and literal types
	expectTypeOf<Writeable<{ readonly id: "test"; readonly optionalId?: number }>>().toEqualTypeOf<{
		id: "test";
		optionalId?: number;
	}>();
});
