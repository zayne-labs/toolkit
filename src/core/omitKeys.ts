import type { AnyObject } from "@/type-helpers";

export const omitKeys = <TObject extends AnyObject, const TOmitArray extends Array<keyof TObject>>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const updatedObject = { ...initialObject };

	for (const key of keysToOmit) {
		if (!Object.hasOwn(initialObject, key)) continue;

		Reflect.deleteProperty(updatedObject, key);
	}

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};

export const omitKeysWithReduce = <
	TObject extends AnyObject,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const arrayFromObject = Object.entries(initialObject);

	const keysToPickSet = new Set(keysToOmit);

	const updatedObject = arrayFromObject.reduce<AnyObject>((accumulator, [key, value]) => {
		if (!keysToPickSet.has(key)) {
			accumulator[key] = value;
		}

		return accumulator;
	}, {});

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};

export const omitKeysWithFilter = <
	TObject extends AnyObject,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const keysToPickSet = new Set(keysToOmit);

	const arrayFromFilteredObject = Object.entries(initialObject).filter(
		([key]) => !keysToPickSet.has(key)
	);

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};
