import type { AnyObject } from "@/type-helpers";

export const pickKeys = <TObject extends AnyObject, const TPickArray extends Array<keyof TObject>>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const updatedObject = {} as AnyObject;

	const keysToPickSet = new Set(keysToPick);

	for (const [key, value] of Object.entries(initialObject)) {
		if (keysToPickSet.has(key)) {
			updatedObject[key] = value;
		}
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
	const keysToPickSet = new Set(keysToPick);

	const updatedObject = Object.entries(initialObject).reduce<AnyObject>((accumulator, [key, value]) => {
		if (keysToPickSet.has(key)) {
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

	const arrayFromFilteredObject = Object.entries(initialObject).filter(([key]) => keysToPickSet.has(key));

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Pick<TObject, TPickArray[number]>;
};
