import { createContext, use } from "react";

export class ContextError extends Error {
	override name = "ContextError";

	constructor(...args: Parameters<typeof Error>) {
		super(...args);

		Error.captureStackTrace(this, this.constructor);
	}
}

export const getErrorMessage = (hook: string, provider: string) => {
	return `${hook} returned "null". Did you forget to wrap the necessary components within ${provider}?`;
};

export type CustomContextOptions<TContextValue, TStrict extends boolean> = {
	defaultValue?: TContextValue | null;
	errorMessage?: string;
	extension?: (contextValue: NoInfer<TContextValue> | null) => TContextValue | null;
	hookName?: string;
	name?: string;
	providerName?: string;
	strict?: TStrict;
};

type UseCustomContextResult<TContextValue, TStrict extends boolean> = TStrict extends true
	? TContextValue
	: TContextValue | null;

const createCustomContext = <TContextValue, TStrict extends boolean = true>(
	options: CustomContextOptions<TContextValue, TStrict> = {}
) => {
	const {
		defaultValue = null,
		errorMessage,
		extension,
		hookName = "UnnamedContextHook",
		name = "UnnamedContext",
		providerName = "UnnamedContextProvider",
		strict = true,
	} = options;

	const Context = createContext<TContextValue | null>(defaultValue);

	Context.displayName = name;

	const useCustomContext = (): UseCustomContextResult<TContextValue, TStrict> => {
		const contextValue = use(Context);

		const extendedContextValue = extension?.(contextValue) ?? contextValue;

		if (strict && extendedContextValue === null) {
			throw new ContextError(errorMessage ?? getErrorMessage(hookName, providerName));
		}

		return extendedContextValue as NonNullable<typeof extendedContextValue>;
	};

	return [Context.Provider, useCustomContext] as const;
};

export { createCustomContext };
