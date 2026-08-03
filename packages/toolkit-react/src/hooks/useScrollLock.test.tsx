import { getActiveScrollLockCount } from "@zayne-labs/toolkit-core";
import { act, createElement, createRef, Fragment, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";
import { useDisclosure } from "./useDisclosure";
import { useScrollLock, type UseScrollLockOptions } from "./useScrollLock";

const ScrollLockHarness = (options: UseScrollLockOptions<HTMLDivElement>) => {
	const { ref } = useScrollLock(options);

	return createElement("div", { "data-lock-root": "", ref });
};

const DisclosureHarness = () => {
	const disclosure = useDisclosure({ hasScrollControl: true });

	return createElement(
		Fragment,
		null,
		createElement("div", { ref: disclosure.scrollLockRef }),
		createElement("button", { "data-close": "", onClick: disclosure.onClose, type: "button" }, "Close"),
		createElement("button", { "data-open": "", onClick: disclosure.onOpen, type: "button" }, "Open")
	);
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

	document.body.innerHTML = "";
	document.body.removeAttribute("class");
	document.body.removeAttribute("style");

	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();

	expect(getActiveScrollLockCount()).toBe(0);
	expect(document.body.style.overflow).toBe("");
});

test("useScrollLock - activates, updates, and disposes with React lifecycle", () => {
	act(() => root.render(createElement(ScrollLockHarness, { enabled: true })));

	expect(getActiveScrollLockCount()).toBe(1);
	expect(document.body.style.overflow).toBe("hidden");

	act(() => root.render(createElement(ScrollLockHarness, { enabled: false })));

	expect(getActiveScrollLockCount()).toBe(0);
	expect(document.body.style.overflow).toBe("");

	act(() => root.render(createElement(ScrollLockHarness, { enabled: true, removeScrollBar: false })));

	expect(getActiveScrollLockCount()).toBe(1);
	expect(document.body.style.overflow).toBe("");
});

test("useScrollLock - remains balanced under StrictMode effect replay", () => {
	act(() =>
		root.render(
			createElement(StrictMode, null, createElement(ScrollLockHarness, { enabled: true }))
		)
	);

	expect(getActiveScrollLockCount()).toBe(1);
	expect(document.body.style.overflow).toBe("hidden");
});

test("useScrollLock - supports external lock and shard refs", () => {
	const lockRef = createRef<HTMLDivElement>();
	const shardRef = createRef<HTMLDivElement>();

	const Harness = () => {
		useScrollLock({ ref: lockRef, shards: [shardRef] });

		return createElement(
			Fragment,
			null,
			createElement("div", { "data-lock-root": "", ref: lockRef }),
			createElement("div", { "data-shard": "", ref: shardRef })
		);
	};

	act(() => root.render(createElement(Harness)));

	expect(lockRef.current).toBe(container.querySelector("[data-lock-root]"));
	expect(shardRef.current).toBe(container.querySelector("[data-shard]"));
	expect(getActiveScrollLockCount()).toBe(1);
});

test("useDisclosure - locks while open and unlocks while closed", () => {
	act(() => root.render(createElement(DisclosureHarness)));

	expect(document.body.style.overflow).toBe("");

	act(() => container.querySelector<HTMLButtonElement>("[data-open]")?.click());
	expect(document.body.style.overflow).toBe("hidden");

	act(() => container.querySelector<HTMLButtonElement>("[data-close]")?.click());
	expect(document.body.style.overflow).toBe("");
});
