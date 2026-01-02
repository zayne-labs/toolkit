import { isFunction, isObject, isString } from "@zayne-labs/toolkit-type-helpers";
import { cnMerge } from "@/lib/utils/cn";
import { composeTwoEventHandlers } from "../composeEventHandlers";
import { isEventHandler } from "./utils";

export const mergeTwoProps = <TProps extends Record<never, never>>(
	formerProps: TProps | undefined,
	latterProps: TProps | undefined
): TProps => {
	// == If no props are provided, return an empty object
	if (!latterProps || !formerProps) {
		return latterProps ?? formerProps ?? ({} as TProps);
	}

	const propsAccumulator: Record<string, unknown> = {
		...formerProps,
	};

	for (const [latterPropName, latterPropValue] of Object.entries(latterProps)) {
		const accumulatedPropValue = propsAccumulator[latterPropName];

		if (
			(latterPropName === "className" || latterPropName === "class")
			&& isString(latterPropValue)
			&& isString(accumulatedPropValue)
		) {
			propsAccumulator[latterPropName] = cnMerge(accumulatedPropValue, latterPropValue);
			continue;
		}

		if (latterPropName === "style" && isObject(latterPropValue) && isObject(accumulatedPropValue)) {
			propsAccumulator[latterPropName] = {
				...accumulatedPropValue,
				...latterPropValue,
			};
			continue;
		}

		if (
			isFunction(latterPropValue)
			&& isFunction(accumulatedPropValue)
			&& isEventHandler(latterPropName)
		) {
			propsAccumulator[latterPropName] = composeTwoEventHandlers(accumulatedPropValue, latterPropValue);

			continue;
		}

		// == latterProps override by default
		propsAccumulator[latterPropName] =
			latterPropValue !== undefined ? latterPropValue : accumulatedPropValue;
	}

	return propsAccumulator as TProps;
};
