import type { AnyObject } from "@/type-helpers";

export const pickKeys = <TObject extends AnyObject, const TPickArray extends Array<keyof TObject>>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const updatedObject: AnyObject = {};

	for (const key of keysToPick) {
		if (!Object.hasOwn(initialObject, key)) continue;

		updatedObject[key as string] = initialObject[key];
	}

	return updatedObject as Pick<TObject, TPickArray[number]>;
};

export const pickKeysWithReduce = <
	TObject extends AnyObject,
	const TPickArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const arrayFromObject = Object.entries(initialObject);

	const keysToPickSet = new Set(keysToPick);

	const updatedObject = arrayFromObject.reduce<AnyObject>((accumulator, [key, value]) => {
		if (!keysToPickSet.has(key)) {
			accumulator[key] = value;
		}

		return accumulator;
	}, {});

	return updatedObject as Pick<TObject, TPickArray[number]>;
};

export const pickKeysWithFilter = <
	TObject extends AnyObject,
	const TPickArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const keysToPickSet = new Set(keysToPick);

	// prettier-ignore
	const arrayFromFilteredObject = Object.entries(initialObject).filter(([key]) => keysToPickSet.has(key));

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Pick<TObject, TPickArray[number]>;
};
