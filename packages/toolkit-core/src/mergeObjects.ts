import { isArray, isPlainObject } from "@zayne-labs/toolkit-type-helpers";

/**
 * @description Decides the merged value for a single key.
 * With `undefinedValues: "ignore"` (the default), it's only called when `latterValue` is not `undefined`,
 * or when the key doesn't exist on the former object yet.
 */
export type MergeValueFn = (key: string, formerValue: unknown, latterValue: unknown) => unknown;

export type MergeObjectsOptions = {
	/**
	 * Custom per-key merge strategy. Replaces {@link mergeValueDefault} entirely,
	 * so call it yourself as a fallback if you want to keep the default behavior for other keys.
	 *
	 * @default mergeValueDefault
	 */
	mergeValue?: MergeValueFn;

	/**
	 * What to do with `undefined` values in the latter object:
	 * - `"ignore"`: they never overwrite existing values, so conditional or forwarded optional values
	 *   (`{ entry: cond ? [...] : undefined }`) can't wipe earlier ones.
	 * - `"overwrite"`: an explicit `undefined` replaces (unsets) the earlier value, like `Object.assign` / spread.
	 *   The value goes through `mergeValue`, so custom strategies see it too.
	 *
	 * @default "ignore"
	 */
	undefinedValues?: "ignore" | "overwrite";
};

/**
 * @description The default per-key merge strategy:
 * - Arrays are concatenated.
 * - Plain objects are shallowly merged.
 * - Everything else is overwritten by the latter value.
 */
export const mergeValueDefault: MergeValueFn = (_key, formerValue, latterValue) => {
	if (isArray(latterValue) && isArray(formerValue)) {
		return [...formerValue, ...latterValue];
	}

	if (isPlainObject(latterValue) && isPlainObject(formerValue)) {
		return { ...formerValue, ...latterValue };
	}

	return latterValue;
};

/**
 * @description Merges two objects into a new object, key by key, using a merge strategy.
 * - `undefined` values in the latter object don't overwrite existing values, unless `undefinedValues` is `"overwrite"`.
 * - Neither input is mutated.
 *
 * @see {@link mergeValueDefault} for the default strategy.
 */
export const mergeTwoObjects = <TObject extends object>(
	formerObject: TObject | undefined,
	latterObject: TObject | undefined,
	options: MergeObjectsOptions = {}
): TObject => {
	// == If either object is missing, return the other one (or an empty object)
	if (!latterObject || !formerObject) {
		return latterObject ?? formerObject ?? ({} as TObject);
	}

	const { mergeValue = mergeValueDefault, undefinedValues = "ignore" } = options;

	const accumulator = { ...formerObject } as Record<string, unknown>;

	for (const key of Object.keys(latterObject)) {
		const latterValue = (latterObject as Record<string, unknown>)[key];

		// == By default, `undefined` doesn't overwrite an existing value
		if (undefinedValues === "ignore" && latterValue === undefined && Object.hasOwn(accumulator, key))
			// eslint-disable-next-line curly -- Remove later
			continue;

		accumulator[key] = mergeValue(key, accumulator[key], latterValue);
	}

	return accumulator as TObject;
};

/**
 * @description Merges any number of objects from left to right, skipping `undefined` entries.
 * Rightmost values win, following the {@link mergeTwoObjects} rules.
 */
export const mergeObjects = <TObject extends object>(
	objectArray: Array<TObject | undefined>,
	options?: MergeObjectsOptions
): TObject => {
	let accumulatedObject = {} as TObject;

	for (const object of objectArray) {
		if (!object) continue;

		accumulatedObject = mergeTwoObjects(accumulatedObject, object, options);
	}

	return accumulatedObject;
};
