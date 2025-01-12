import { mergeClassNames, mergeFunctions } from "@zayne-labs/toolkit-core";
import { isFunction, isPlainObject } from "@zayne-labs/toolkit-type-helpers";

// const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;

// const serialize = (style: string): Record<string, string> => {
// 	const res: Record<string, string> = {};
// 	let match: RegExpExecArray | null;
// 	while ((match = CSS_REGEX.exec(style))) {
// 		res[match[1]!] = match[2]!;
// 	}
// 	return res;
// };

// const css = (
// 	a: Record<string, string> | string | undefined,
// 	b: Record<string, string> | string | undefined
// ): Record<string, string> | string => {
// 	if (isString(a)) {
// 		if (isString(b)) return `${a};${b}`;
// 		a = serialize(a);
// 	} else if (isString(b)) {
// 		b = serialize(b);
// 	}
// 	return Object.assign({}, a ?? {}, b ?? {});
// };

type UnionToIntersection<TUnion> = (TUnion extends unknown ? (param: TUnion) => void : "") extends (
	param: infer TParam
) => void
	? TParam
	: "";

/* eslint-disable no-param-reassign -- Mutation is fine here since it's an internally managed object */
const handleMergePropsIntoResult = (
	mergedResult: Record<string, unknown>,
	propsObject: Record<string, unknown>
) => {
	for (const propName of Object.keys(mergedResult)) {
		const mergedResultValue = mergedResult[propName];
		const propsObjectValue = propsObject[propName];

		if (propName === "className" || propName === "class") {
			mergedResult[propName] = mergeClassNames(mergedResultValue as string, propsObjectValue as string);
			continue;
		}

		if (propName === "style" && isPlainObject(mergedResultValue) && isPlainObject(propsObjectValue)) {
			// mergedResult[propName] = css(mergedResultValue, propsObjectValue);
			mergedResult[propName] = { ...mergedResultValue, ...propsObjectValue };
			continue;
		}

		const isHandler = propName.startsWith("on");

		if (isHandler && isFunction(mergedResultValue) && isFunction(propsObjectValue)) {
			mergedResult[propName] = mergeFunctions(propsObjectValue, mergedResultValue);
			continue;
		}

		mergedResult[propName] = propsObjectValue !== undefined ? propsObjectValue : mergedResultValue;
	}
};

const addMissingPropsToResult = (
	mergedResult: Record<string, unknown>,
	propsObject: Record<string, unknown>
) => {
	for (const propName of Object.keys(propsObject)) {
		if (mergedResult[propName] === undefined) {
			mergedResult[propName] = propsObject[propName];
		}
	}
};
/* eslint-enable no-param-reassign -- Mutation is fine here since it's an internally managed object */

type UnknownProps = Record<never, never>;

const mergeProps = <TProps extends UnknownProps>(
	...parameters: Array<TProps | undefined>
): UnionToIntersection<TProps> => {
	const mergedResult: Record<string, unknown> = {};

	for (const propsObject of parameters) {
		if (!propsObject) continue;

		handleMergePropsIntoResult(mergedResult, propsObject);

		// == Add props from propsObject that are not in the mergedResult
		addMissingPropsToResult(mergedResult, propsObject);
	}

	return mergedResult as never;
};

export { mergeProps };
