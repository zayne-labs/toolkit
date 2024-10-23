export const shallowCompare = (objA: Record<string, unknown>, objB: Record<string, unknown>) => {
	const keysOfA = Object.keys(objA);

	if (keysOfA.length !== Object.keys(objB).length) {
		return false;
	}

	for (const keyInA of keysOfA) {
		if (!Object.hasOwn(objB, keyInA)) {
			return false;
		}
		if (!Object.is(objA[keyInA], objB[keyInA])) {
			return false;
		}
	}

	return true;
};
