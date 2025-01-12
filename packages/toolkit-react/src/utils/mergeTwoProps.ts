import { mergeClassNames, mergeFunctions } from "@zayne-labs/toolkit-core";
import { isFunction, isPlainObject } from "@zayne-labs/toolkit-type-helpers";

type UnknownProps = Record<never, never>;

const mergeTwoProps = <TProps extends UnknownProps>(
	slotProps: TProps | undefined,
	childProps: TProps | undefined
): TProps => {
	if (!slotProps || !childProps) {
		return childProps ?? slotProps ?? ({} as TProps);
	}

	// == all child props should override slotProps
	const overrideProps = { ...childProps } as Record<string, unknown>;

	for (const propName of Object.keys(slotProps)) {
		const slotPropValue = (slotProps as Record<string, unknown>)[propName];
		const childPropValue = (childProps as Record<string, unknown>)[propName];

		// == if it's `style`, we merge them
		if (propName === "style" && isPlainObject(slotPropValue) && isPlainObject(childPropValue)) {
			overrideProps[propName] = { ...slotPropValue, ...childPropValue };
			continue;
		}

		// == if it's `className` or `class`, we merge them
		if (propName === "className" || propName === "class") {
			overrideProps[propName] = mergeClassNames(slotPropValue as string, childPropValue as string);
			continue;
		}

		const isHandler = propName.startsWith("on");

		// == if the handler exists on both, we compose them
		if (isHandler && isFunction(slotPropValue) && isFunction(childPropValue)) {
			overrideProps[propName] = mergeFunctions(childPropValue, slotPropValue);
		}
	}

	return { ...slotProps, ...overrideProps };
};

export { mergeTwoProps };
