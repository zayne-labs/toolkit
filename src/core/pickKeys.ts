export const pickKeys = <
	TObject extends Record<string, unknown>,
	const TPickArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const keysToPickSet = new Set(keysToPick);

	const arrayFromInitObject = Object.entries(initialObject);

	const filteredArray = arrayFromInitObject.filter(([objectKey]) => keysToPickSet.has(objectKey));

	const updatedObject = Object.fromEntries(filteredArray);

	return updatedObject as Pick<TObject, TPickArray[number]>;
};

export const pickKeysWithReduce = <
	TObject extends Record<string, unknown>,
	const TPickArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const arrayFromObject = Object.entries(initialObject);

	const updatedObject = arrayFromObject.reduce<Record<string, unknown>>((accumulator, [key, value]) => {
		keysToPick.includes(key) && (accumulator[key] = value);

		return accumulator;
	}, {});

	return updatedObject as Pick<TObject, TPickArray[number]>;
};

export const pickKeysWithLoop = <
	TObject extends Record<string, unknown>,
	const TPickArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToPick: TPickArray
) => {
	const updatedObject: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(initialObject)) {
		keysToPick.includes(key) && (updatedObject[key] = value);
	}

	return updatedObject as Pick<TObject, TPickArray[number]>;
};
