import { isBoolean } from "@zayne-labs/toolkit-type-helpers";

/**
 * @description A tagged template literal for CSS strings. Joins the template strings and values into a raw string, then trims it.
 */
export const css = (
	strings: TemplateStringsArray,
	...values: Array<boolean | number | string | null | undefined>
) => {
	return String.raw(
		{ raw: strings },
		...values.map((value) => (value == null || isBoolean(value) ? "" : value))
	).trim();
};

/**
 * @description A tagged template literal for Tailwind CSS classes.
 * Interpolations are NOT allowed in 'tw' to maintain static analysis compatibility.
 * Use the `css` utility if you need dynamic values.
 */
export const tw = (
	strings: TemplateStringsArray,
	..._values: Array<"Interpolations are NOT allowed in 'tw' tag. Use 'css' instead.">
) => {
	return String.raw({ raw: strings }).trim();
};
