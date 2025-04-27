import { mergeTwoProps } from "./mergeTwoProps";

type UnionToIntersection<TUnion> = (TUnion extends unknown ? (param: TUnion) => void : "") extends (
	param: infer TParam
) => void
	? TParam
	: "";

/**
 * Merges multiple sets of React props.
 *
 * - It follows the Object.assign pattern where the rightmost object's fields overwrite
 * the conflicting ones from others. This doesn't apply to event handlers, `className` and `style` props.
 * - Event handlers are merged such that they are called in sequence (the rightmost one being called first),
 * and allows the user to prevent the previous event handlers from being executed by calling the `preventDefault` method.
 * - It also merges the `className` and `style` props, whereby the classes are concatenated
 * and the rightmost styles overwrite the previous ones.
 *
 * @important **`ref` is not merged.**
 * @param props props to merge.
 * @returns the merged props.
 */

const mergeProps = <TProps extends Record<never, never>>(
	...propsObjectArray: Array<TProps | undefined>
): UnionToIntersection<TProps> => {
	if (propsObjectArray.length === 0) {
		return {} as never;
	}

	if (propsObjectArray.length === 1) {
		return propsObjectArray[0] as never;
	}

	let accumulatedProps: Record<string, unknown> = {};

	for (const propsObject of propsObjectArray) {
		if (!propsObject) continue;

		accumulatedProps = mergeTwoProps(accumulatedProps, propsObject);
	}

	return accumulatedProps as never;
};

export { mergeProps };
