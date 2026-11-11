import { expect, test, vi } from "vitest";
import { mergeProps } from "./mergeProps";
import { mergeTwoProps } from "./mergeTwoProps";

type TestProps = Record<string, unknown>;

const renderFormer = () => "former";
const renderLatter = () => "latter";

test("mergeProps: rightmost plain props win", () => {
	expect(mergeProps<TestProps>({ id: "a", title: "x" }, { id: "b" })).toEqual({ id: "b", title: "x" });
});

test("mergeProps: className and class are merged with tailwind-merge", () => {
	const result = mergeProps<TestProps>(
		{ class: "p-2", className: "p-2 text-red-500" },
		{ class: "p-4", className: "p-4" }
	);

	expect(result).toEqual({ class: "p-4", className: "text-red-500 p-4" });
});

test("mergeProps: style objects are shallowly merged", () => {
	expect(
		mergeProps<TestProps>({ style: { color: "red", margin: 0 } }, { style: { color: "blue" } })
	).toEqual({ style: { color: "blue", margin: 0 } });
});

test("mergeProps: event handlers are composed, rightmost called first", () => {
	const calls: string[] = [];

	const { onClick } = mergeProps<TestProps>(
		{ onClick: () => calls.push("former") },
		{ onClick: () => calls.push("latter") }
	) as { onClick: (event: unknown) => void };

	onClick({});

	expect(calls).toEqual(["latter", "former"]);
});

test("mergeProps: preventDefault on a synthetic event stops the former handler", () => {
	const former = vi.fn();

	const { onClick } = mergeProps<TestProps>(
		{ onClick: former },
		{ onClick: (event: { preventDefault: () => void }) => event.preventDefault() }
	) as { onClick: (event: unknown) => void };

	const syntheticEvent = {
		defaultPrevented: false,
		nativeEvent: {},
		preventDefault: () => {
			syntheticEvent.defaultPrevented = true;
		},
	};

	onClick(syntheticEvent);

	expect(former).not.toHaveBeenCalled();
});

test("mergeProps: non-handler functions are overwritten, not composed", () => {
	expect(mergeProps<TestProps>({ render: renderFormer }, { render: renderLatter }).render).toBe(
		renderLatter
	);
});

test("mergeProps: arrays and other objects are overwritten, not merged", () => {
	expect(mergeProps<TestProps>({ data: { a: 1 }, items: [1] }, { data: { b: 2 }, items: [2] })).toEqual({
		data: { b: 2 },
		items: [2],
	});
});

test("mergeProps: undefined values don't overwrite existing props", () => {
	expect(mergeProps<TestProps>({ id: "a" }, { id: undefined })).toEqual({ id: "a" });
});

test("mergeProps: handles zero, one and undefined inputs", () => {
	const single = { id: "a" };

	expect(mergeProps()).toEqual({});
	expect(mergeProps(single)).toBe(single);
	expect(mergeProps<TestProps>(undefined, { id: "a" }, undefined)).toEqual({ id: "a" });
});

test("mergeTwoProps: falls back to the other props when one is missing", () => {
	expect(mergeTwoProps<TestProps>(undefined, { id: "a" })).toEqual({ id: "a" });
	expect(mergeTwoProps<TestProps>({ id: "a" }, undefined)).toEqual({ id: "a" });
	expect(mergeTwoProps<TestProps>(undefined, undefined)).toEqual({});
});
