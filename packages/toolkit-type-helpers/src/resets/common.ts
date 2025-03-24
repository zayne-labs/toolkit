declare global {
	// eslint-disable-next-line ts-eslint/consistent-type-definitions -- Allow
	interface BooleanConstructor {
		<T>(value?: T | null): value is T;
	}
}
