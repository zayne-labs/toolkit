import { isFunction, isPlainObject } from "@zayne-labs/toolkit-type-helpers";

type UnknownProps = Record<string, unknown>;

const mergeProps = <TProps extends UnknownProps>(
	slotProps: TProps | undefined,
	childProps: TProps | undefined
): TProps => {
	if (!slotProps || !childProps) {
		return childProps ?? slotProps ?? ({} as TProps);
	}

	// == all child props should override slotProps
	const overrideProps = { ...childProps } as UnknownProps;

	for (const propName of Object.keys(slotProps)) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];

		// == if it's `style`, we merge them
		if (propName === "style" && isPlainObject(slotPropValue) && isPlainObject(childPropValue)) {
			overrideProps[propName] = { ...slotPropValue, ...childPropValue };
		}

		if (propName === "className" || propName === "class") {
			overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
		}

		const isHandler = propName.startsWith("on");

		if (!isHandler) continue;

		// == if the handler exists on both, we compose them
		if (isFunction(slotPropValue) && isFunction(childPropValue)) {
			overrideProps[propName] = (...args: unknown[]) => {
				childPropValue(...args);
				slotPropValue(...args);
			};
		}

		// == but if it exists only on the slot, we use only that one
		if (isFunction(slotPropValue)) {
			overrideProps[propName] = slotPropValue;
		}
	}

	return { ...slotProps, ...overrideProps };
};

export { mergeProps };
