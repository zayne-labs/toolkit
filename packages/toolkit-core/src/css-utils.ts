export const mergeClassNames = (...args: Array<string | undefined>) => args.filter(Boolean).join(" ");

export const tw = (strings: TemplateStringsArray, ...values: Array<"Not-Allowed">) => {
	const twClassString = strings.reduce(
		(accumulatedString, string, index) => `${accumulatedString}${string}${values[index] ?? ""}`,
		""
	);

	return twClassString.trim();
};

export const css = (strings: TemplateStringsArray, ...values: Array<number | string | undefined>) => {
	const cssString = strings.reduce(
		(accumulatedString, string, index) => `${accumulatedString}${string}${values[index] ?? ""}`,
		""
	);

	return cssString.trim();
};
