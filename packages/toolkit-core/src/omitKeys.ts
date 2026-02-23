import type { ExtractUnion, Prettify, UnknownObject } from "@zayne-labs/toolkit-type-helpers";

export const omitKeys = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
	TOmittedKeys extends ExtractUnion<TOmitArray> = ExtractUnion<TOmitArray>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const updatedObject = {} as UnknownObject;

	const keysToOmitSet = new Set(keysToOmit);

	for (const key of Object.keys(initialObject)) {
		if (!keysToOmitSet.has(key)) {
			updatedObject[key] = initialObject[key];
		}
	}

	return updatedObject as Prettify<Omit<TObject, TOmittedKeys>>;
};

export const omitKeysWithReduce = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
	TOmittedKeys extends ExtractUnion<TOmitArray> = ExtractUnion<TOmitArray>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToOmitSet = new Set(keysToOmit);

	const updatedObject = Object.keys(initialObject).reduce<UnknownObject>((accumulator, key) => {
		if (!keysToOmitSet.has(key)) {
			accumulator[key] = initialObject[key];
		}

		return accumulator;
	}, {});

	return updatedObject as Prettify<Omit<TObject, TOmittedKeys>>;
};

export const omitKeysWithFilter = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
	TOmittedKeys extends ExtractUnion<TOmitArray> = ExtractUnion<TOmitArray>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToOmitSet = new Set(keysToOmit);

	const arrayFromFilteredObject = Object.entries(initialObject).filter(
		([key]) => !keysToOmitSet.has(key)
	);

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Prettify<Omit<TObject, TOmittedKeys>>;
};

export const omitKeysWithDelete = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
	TOmittedKeys extends ExtractUnion<TOmitArray> = ExtractUnion<TOmitArray>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToOmitSet = new Set(keysToOmit);

	const updatedObject = { ...initialObject };

	for (const key of Object.keys(updatedObject)) {
		if (keysToOmitSet.has(key)) {
			Reflect.deleteProperty(updatedObject, key);
		}
	}

	return updatedObject as Prettify<Omit<TObject, TOmittedKeys>>;
};
