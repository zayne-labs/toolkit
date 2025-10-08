import { type AnyFunction, isFunction } from "@zayne-labs/toolkit-type-helpers";
import { cnMerge } from "@/lib/utils/cn";
import { composeTwoEventHandlers } from "./composeEventHandlers";

// == This approach is more efficient than using a regex.
const isEventHandler = (key: string, value: unknown): value is AnyFunction => {
	const thirdCharCode = key.codePointAt(2);

	if (!isFunction(value) || thirdCharCode === undefined) {
		return false;
	}

	const isHandler = key.startsWith("on") && thirdCharCode >= 65 /* A */ && thirdCharCode <= 90; /* Z */

	return isHandler;
};

// const mergeTwoClassNames = (formerClassName: string | undefined, latterClassName: string | undefined) => {
// 	if (!latterClassName || !formerClassName) {
// 		// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- Logical OR is fit for this case
// 		return latterClassName || formerClassName;
// 	}

// 	// eslint-disable-next-line prefer-template -- String concatenation is more performant than template literals in this case
// 	return formerClassName + " " + latterClassName;
// };

export const mergeTwoProps = <TProps extends Record<never, never>>(
	formerProps: TProps | undefined,
	latterProps: TProps | undefined
): TProps => {
	// == If no props are provided, return an empty object
	if (!latterProps || !formerProps) {
		return latterProps ?? formerProps ?? ({} as TProps);
	}

	const propsAccumulator = { ...formerProps } as Record<string, unknown>;

	for (const latterPropName of Object.keys(latterProps)) {
		const formerPropValue = (formerProps as Record<string, unknown>)[latterPropName];
		const latterPropValue = (latterProps as Record<string, unknown>)[latterPropName];

		// == If the prop is `className` or `class`, we merge them
		if (latterPropName === "className" || latterPropName === "class") {
			propsAccumulator[latterPropName] = cnMerge(formerPropValue as string, latterPropValue as string);
			continue;
		}

		// == If the prop is `style`, we merge them
		if (latterPropName === "style") {
			propsAccumulator[latterPropName] = {
				...(formerPropValue as object),
				...(latterPropValue as object),
			};
			continue;
		}

		// == If the handler exists on both, we compose them
		if (isEventHandler(latterPropName, latterPropValue)) {
			propsAccumulator[latterPropName] = composeTwoEventHandlers(
				formerPropValue as AnyFunction | undefined,
				latterPropValue
			);

			continue;
		}

		// == latterProps override by default
		propsAccumulator[latterPropName] = latterPropValue;
	}

	return propsAccumulator as TProps;
};
