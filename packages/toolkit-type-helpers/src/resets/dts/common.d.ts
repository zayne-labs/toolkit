interface BooleanConstructor {
	// eslint-disable-next-line ts-eslint/prefer-function-type -- Required to override the built-in Boolean constructor
	<T>(value?: T | null): value is T;
}
