import type {
	ExtractUnion,
	Prettify,
	UnknownObject,
	UnknownObjectWithAnyValue,
} from "@zayne-labs/toolkit-type-helpers";

export const pickKeys = <
	TObject extends UnknownObjectWithAnyValue,
	const TPickArray extends Array<keyof TObject>,
	TPickedKeys extends ExtractUnion<TPickArray> = ExtractUnion<TPickArray>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const updatedObject = {} as UnknownObject;

	const keysToPickSet = new Set(keysToPick);

	for (const key of Object.keys(initialObject)) {
		if (keysToPickSet.has(key)) {
			updatedObject[key] = initialObject[key];
		}
	}

	return updatedObject as Prettify<Pick<TObject, TPickedKeys>>;
};

export const pickKeysWithReduce = <
	TObject extends UnknownObjectWithAnyValue,
	const TPickArray extends Array<keyof TObject>,
	TPickedKeys extends ExtractUnion<TPickArray> = ExtractUnion<TPickArray>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const keysToPickSet = new Set(keysToPick);

	const updatedObject = Object.keys(initialObject).reduce<UnknownObject>((accumulator, key) => {
		if (keysToPickSet.has(key)) {
			accumulator[key] = initialObject[key];
		}

		return accumulator;
	}, {});

	return updatedObject as Prettify<Pick<TObject, TPickedKeys>>;
};

export const pickKeysWithFilter = <
	TObject extends UnknownObjectWithAnyValue,
	const TPickArray extends Array<keyof TObject>,
	TPickedKeys extends ExtractUnion<TPickArray> = ExtractUnion<TPickArray>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const keysToPickSet = new Set(keysToPick);

	const arrayFromFilteredObject = Object.entries(initialObject).filter(([key]) => keysToPickSet.has(key));

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Prettify<Pick<TObject, TPickedKeys>>;
};
