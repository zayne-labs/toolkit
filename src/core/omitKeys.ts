export const omitKeys = <
	TObject extends Record<string, unknown>,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const arrayFromFilteredObject = Object.entries(initialObject).filter(
		([key]) => !keysToOmit.includes(key)
	);

	const updatedObject = Object.fromEntries(arrayFromFilteredObject);

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};

export const omitKeysWithDelete = <
	TObject extends Record<string, unknown>,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const updatedObject = { ...initialObject };

	for (const key of keysToOmit) {
		Reflect.deleteProperty(updatedObject, key);
	}

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};

export const omitKeysWithReduce = <
	TObject extends Record<string, unknown>,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const arrayFromObject = Object.entries(initialObject);

	const updatedObject = arrayFromObject.reduce<Record<string, unknown>>((accumulator, [key, value]) => {
		!keysToOmit.includes(key) && (accumulator[key] = value);

		return accumulator;
	}, {});

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};

export const omitKeysWithLoop = <
	TObject extends Record<string, unknown>,
	const TOmitArray extends Array<keyof TObject>,
>(
	initialObject: TObject,
	keysToOmit: TOmitArray
) => {
	const updatedObject: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(initialObject)) {
		!keysToOmit.includes(key) && (updatedObject[key] = value);
	}

	return updatedObject as Omit<TObject, TOmitArray[number]>;
};
