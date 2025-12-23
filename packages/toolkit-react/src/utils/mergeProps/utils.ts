// == This approach is more efficient than using a regex.
export const isEventHandler = (key: string) => {
	const thirdCharCode = key.codePointAt(2);

	if (thirdCharCode === undefined) {
		return false;
	}

	const isHandler =
		// eslint-disable-next-line ts-eslint/prefer-string-starts-ends-with -- Ignore
		key[0] === "o" && key[1] === "n" && thirdCharCode >= 65 /* A */ && thirdCharCode <= 90; /* Z */

	return isHandler;
};

// const mergeTwoClassNames = (formerClassName: string | undefined, latterClassName: string | undefined) => {
// 	if (!latterClassName || !formerClassName) {
// 		// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- Logical OR is fit for this case
// 		return latterClassName || formerClassName;
// 	}

// 	// eslint-disable-next-line prefer-template -- String concatenation is more performant than template literals in this case
// 	return formerClassName + " " + latterClassName;
// };
