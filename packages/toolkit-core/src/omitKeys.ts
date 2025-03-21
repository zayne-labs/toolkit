import type { UnknownObject } from "@zayne-labs/toolkit-type-helpers";

type OmitKeys<TKeys extends keyof TObject, TObject extends UnknownObject> = Omit<TObject, TKeys>;

export const omitKeys = <TObject extends UnknownObject, const TOmitArray extends Array<keyof TObject>>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const updatedObject = {} as UnknownObject;

	const keysToOmitSet = new Set(keysToOmit);

	for (const [key, value] of Object.entries(initialObject)) {
		if (!keysToOmitSet.has(key)) {
			updatedObject[key] = value;
		}
	}

	return updatedObject as OmitKeys<TOmitArray[number], TObject>;
};

export const omitKeysWithReduce = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToOmitSet = new Set(keysToOmit);

	const updatedObject = Object.entries(initialObject).reduce<UnknownObject>(
		(accumulator, [key, value]) => {
			if (!keysToOmitSet.has(key)) {
				accumulator[key] = value;
			}

			return accumulator;
		},
		{}
	);

	return updatedObject as OmitKeys<TOmitArray[number], TObject>;
};

export const omitKeysWithFilter = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToOmitSet = new Set(keysToOmit);

	const arrayFromFilteredObject = Object.entries(initialObject).filter(
		([key]) => !keysToOmitSet.has(key)
	);

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as OmitKeys<TOmitArray[number], TObject>;
};

export const omitKeysWithDelete = <
	TObject extends UnknownObject,
	const TOmitArray extends Array<keyof TObject>,
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

	return updatedObject as OmitKeys<TOmitArray[number], TObject>;
};
