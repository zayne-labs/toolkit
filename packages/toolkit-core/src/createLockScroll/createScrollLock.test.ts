import { afterEach, beforeEach, expect, test } from "vitest";
import { createScrollLock, getActiveScrollLockCount } from "./createScrollLock";
import type { ScrollLockController, ScrollLockOptions } from "./types";
import { getBodyGapLockCount } from "./utils";

const setReadonlyNumber = (element: object, property: string, value: number) => {
	Object.defineProperty(element, property, {
		configurable: true,
		value,
	});
};

const setElementScrollBox = (
	element: HTMLElement,
	options: Partial<{
		clientHeight: number;
		clientWidth: number;
		scrollHeight: number;
		scrollLeft: number;
		scrollTop: number;
		scrollWidth: number;
	}> = {}
) => {
	const {
		clientHeight = 100,
		clientWidth = 100,
		scrollHeight = 300,
		scrollLeft = 0,
		scrollTop = 0,
		scrollWidth = 300,
	} = options;

	setReadonlyNumber(element, "clientHeight", clientHeight);
	setReadonlyNumber(element, "clientWidth", clientWidth);
	setReadonlyNumber(element, "scrollHeight", scrollHeight);
	setReadonlyNumber(element, "scrollLeft", scrollLeft);
	setReadonlyNumber(element, "scrollTop", scrollTop);
	setReadonlyNumber(element, "scrollWidth", scrollWidth);
};

const dispatchWheel = (target: HTMLElement, options: WheelEventInit = {}) => {
	const { ctrlKey = false, deltaX = 0, deltaY = 10 } = options;
	const event = new Event("wheel", {
		bubbles: true,
		cancelable: true,
	}) as WheelEvent;

	Object.defineProperties(event, {
		ctrlKey: { configurable: true, value: ctrlKey },
		deltaX: { configurable: true, value: deltaX },
		deltaY: { configurable: true, value: deltaY },
	});

	target.dispatchEvent(event);

	return event;
};

let controllers: ScrollLockController[] = [];

const createTestScrollLock = (options?: ScrollLockOptions) => {
	const controller = createScrollLock(options);

	controllers.push(controller);

	return controller;
};

beforeEach(() => {
	document.body.innerHTML = "";
	document.head.innerHTML = "";
	document.body.removeAttribute("class");
	document.body.removeAttribute("style");
	document.documentElement.removeAttribute("style");

	setReadonlyNumber(globalThis, "innerWidth", 120);
	setElementScrollBox(document.documentElement, {
		clientHeight: 100,
		clientWidth: 100,
		scrollHeight: 300,
		scrollWidth: 120,
	});
});

afterEach(() => {
	for (const controller of controllers) {
		controller.dispose();
	}

	controllers = [];

	expect(getActiveScrollLockCount()).toBe(0);
	expect(getBodyGapLockCount()).toBe(0);
});

test("createScrollLock - applies and restores body gap styles", () => {
	const controller = createTestScrollLock();

	controller.activate();

	expect(document.body.style.overflow).toBe("hidden");
	expect(document.body.style.marginRight).toBe("20px");
	expect(document.body.style.position).toBe("relative");

	controller.dispose();

	expect(document.body.style.overflow).toBe("");
	expect(document.body.style.marginRight).toBe("");
	expect(document.body.style.position).toBe("");
});

test("createScrollLock - uses defaults when optional values are explicitly undefined", () => {
	const controller = createTestScrollLock({
		allowPinchZoom: undefined,
		gapMode: undefined,
		inert: undefined,
		noIsolation: undefined,
		noRelative: undefined,
		removeScrollBar: undefined,
	});

	controller.activate();

	expect(document.body.style.overflow).toBe("hidden");
	expect(document.body.style.marginRight).toBe("20px");

	controller.dispose();
});

test("createScrollLock - falls back to body when a lazy lock element resolves to null", () => {
	const controller = createTestScrollLock({
		inert: true,
		lockElement: { current: null },
	});

	controller.activate();

	expect(document.body.className).toContain("scroll-lock-block-interactivity");
	expect(document.body.className).toContain("scroll-lock-allow-interactivity");

	controller.dispose();
});

test("createScrollLock - keeps body gap while another scrollbar-removing lock is active", () => {
	const firstController = createTestScrollLock();
	const secondController = createTestScrollLock();

	firstController.activate();
	secondController.activate();
	secondController.dispose();

	expect(document.body.style.overflow).toBe("hidden");
	expect(document.body.style.marginRight).toBe("20px");

	firstController.dispose();

	expect(document.body.style.overflow).toBe("");
	expect(document.body.style.marginRight).toBe("");
});

test("createScrollLock - keeps the latest body gap options when a lower lock is released", () => {
	const firstController = createTestScrollLock({ gapMode: "margin" });
	const secondController = createTestScrollLock({ gapMode: "padding", noRelative: true });

	firstController.activate();
	secondController.activate();
	firstController.dispose();

	expect(document.body.style.overflow).toBe("hidden");
	expect(document.body.style.marginRight).toBe("");
	expect(document.body.style.paddingRight).toBe("20px");
	expect(document.body.style.position).toBe("");

	secondController.dispose();
});

test("createScrollLock - updates active body gap options and restores existing styles", () => {
	document.body.style.marginRight = "4px";
	document.body.style.paddingRight = "6px";
	document.body.style.position = "absolute";

	const controller = createTestScrollLock({ gapMode: "margin" });

	controller.activate();

	expect(document.body.style.marginRight).toBe("24px");
	expect(document.body.style.paddingRight).toBe("6px");
	expect(document.body.style.position).toBe("absolute");

	controller.update({ gapMode: "padding" });

	expect(document.body.style.marginRight).toBe("4px");
	expect(document.body.style.paddingRight).toBe("26px");

	controller.dispose();

	expect(document.body.style.marginRight).toBe("4px");
	expect(document.body.style.paddingRight).toBe("6px");
	expect(document.body.style.position).toBe("absolute");
});

test("createScrollLock - toggles scrollbar removal while active", () => {
	const controller = createTestScrollLock({ removeScrollBar: false });

	controller.activate();
	expect(document.body.style.overflow).toBe("");

	controller.update({ removeScrollBar: true });
	expect(document.body.style.overflow).toBe("hidden");

	controller.update({ removeScrollBar: false });
	expect(document.body.style.overflow).toBe("");

	controller.dispose();
});

test("createScrollLock - only the latest active lock controls isolation", () => {
	const firstElement = document.createElement("div");
	const secondElement = document.createElement("div");

	document.body.append(firstElement, secondElement);

	const firstController = createTestScrollLock({ lockElement: firstElement });
	const secondController = createTestScrollLock({ lockElement: secondElement });

	firstController.activate();
	secondController.activate();

	const firstEvent = dispatchWheel(firstElement);
	expect(firstEvent.defaultPrevented).toBe(true);

	secondController.dispose();

	const secondEvent = dispatchWheel(firstElement);
	expect(secondEvent.defaultPrevented).toBe(true);

	firstController.dispose();
});

test("createScrollLock - allows internal scroll until boundary and prevents overscroll", () => {
	const lockElement = document.createElement("div");
	const scrollableElement = document.createElement("div");

	lockElement.append(scrollableElement);
	document.body.append(lockElement);

	setElementScrollBox(lockElement, { scrollHeight: 100, scrollWidth: 100 });
	setElementScrollBox(scrollableElement, { scrollTop: 50 });

	const controller = createTestScrollLock({ lockElement });

	controller.activate();

	const scrollEvent = dispatchWheel(scrollableElement);
	expect(scrollEvent.defaultPrevented).toBe(false);

	setElementScrollBox(scrollableElement, { scrollTop: 200 });

	const overscrollEvent = dispatchWheel(scrollableElement);
	expect(overscrollEvent.defaultPrevented).toBe(true);

	controller.dispose();
});

test("createScrollLock - allows outside scroll when noIsolation is true", () => {
	const lockElement = document.createElement("div");
	const outsideElement = document.createElement("div");

	document.body.append(lockElement, outsideElement);

	const controller = createTestScrollLock({ lockElement, noIsolation: true });

	controller.activate();

	const event = dispatchWheel(outsideElement);
	expect(event.defaultPrevented).toBe(false);

	controller.dispose();
});

test("createScrollLock - treats shards as part of the active lock", () => {
	const lockElement = document.createElement("div");
	const shardElement = document.createElement("div");

	document.body.append(lockElement, shardElement);
	setElementScrollBox(shardElement, { scrollTop: 50 });

	const controller = createTestScrollLock({ lockElement, shards: [shardElement] });

	controller.activate();

	const event = dispatchWheel(shardElement);
	expect(event.defaultPrevented).toBe(false);

	controller.dispose();
});

test("createScrollLock - handles SVG event targets inside a scrollable lock", () => {
	const lockElement = document.createElement("div");
	const scrollableElement = document.createElement("div");
	const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	scrollableElement.append(svgElement);
	lockElement.append(scrollableElement);
	document.body.append(lockElement);

	setElementScrollBox(lockElement, { scrollHeight: 100, scrollWidth: 100 });
	setElementScrollBox(scrollableElement, { scrollTop: 50 });

	const controller = createTestScrollLock({ lockElement });

	controller.activate();

	const event = dispatchWheel(svgElement as unknown as HTMLElement);
	expect(event.defaultPrevented).toBe(false);

	controller.dispose();
});

test("createScrollLock - handles scroll targets inside an open shadow root", () => {
	const lockElement = document.createElement("div");
	const shadowRoot = lockElement.attachShadow({ mode: "open" });
	const scrollableElement = document.createElement("div");

	shadowRoot.append(scrollableElement);
	document.body.append(lockElement);

	setElementScrollBox(lockElement, { scrollHeight: 100, scrollWidth: 100 });
	setElementScrollBox(scrollableElement, { scrollTop: 50 });

	const controller = createTestScrollLock({ lockElement });

	controller.activate();

	const event = dispatchWheel(scrollableElement);
	expect(event.defaultPrevented).toBe(false);

	controller.dispose();
});

test("createScrollLock - handles horizontal and RTL scroll boundaries", () => {
	const lockElement = document.createElement("div");
	const scrollableElement = document.createElement("div");

	lockElement.append(scrollableElement);
	document.body.append(lockElement);

	setElementScrollBox(lockElement, { scrollHeight: 100, scrollWidth: 100 });
	setElementScrollBox(scrollableElement, { scrollLeft: 50 });

	const controller = createTestScrollLock({ lockElement });

	controller.activate();

	expect(dispatchWheel(scrollableElement, { deltaX: 10, deltaY: 0 }).defaultPrevented).toBe(false);

	setElementScrollBox(scrollableElement, { scrollLeft: 200 });
	expect(dispatchWheel(scrollableElement, { deltaX: 10, deltaY: 0 }).defaultPrevented).toBe(true);

	lockElement.style.direction = "rtl";
	setElementScrollBox(scrollableElement, { scrollLeft: -50 });
	expect(dispatchWheel(scrollableElement, { deltaX: 10, deltaY: 0 }).defaultPrevented).toBe(false);

	setElementScrollBox(scrollableElement, { scrollLeft: 0 });
	expect(dispatchWheel(scrollableElement, { deltaX: 10, deltaY: 0 }).defaultPrevented).toBe(true);

	controller.dispose();
});

test("createScrollLock - allowPinchZoom controls ctrl wheel prevention", () => {
	const lockedElement = document.createElement("div");

	document.body.append(lockedElement);

	const blockedController = createTestScrollLock({ allowPinchZoom: false, lockElement: lockedElement });

	blockedController.activate();

	const blockedEvent = dispatchWheel(lockedElement, { ctrlKey: true });
	expect(blockedEvent.defaultPrevented).toBe(true);

	blockedController.dispose();

	const allowedController = createTestScrollLock({ allowPinchZoom: true, lockElement: lockedElement });

	allowedController.activate();

	const allowedEvent = dispatchWheel(lockedElement, { ctrlKey: true });
	expect(allowedEvent.defaultPrevented).toBe(false);

	allowedController.dispose();
});

test("createScrollLock - inert mode blocks outside interactivity and allows lock and shard nodes", () => {
	const lockElement = document.createElement("div");
	const shardElement = document.createElement("div");

	document.body.append(lockElement, shardElement);

	const controller = createTestScrollLock({ inert: true, lockElement, shards: [shardElement] });

	controller.activate();

	expect(document.body.className).toContain("scroll-lock-block-interactivity");
	expect(lockElement.className).toContain("scroll-lock-allow-interactivity");
	expect(shardElement.className).toContain("scroll-lock-allow-interactivity");
	expect(document.head.querySelector("[data-scroll-lock-inert]")).not.toBeNull();

	controller.dispose();

	expect(document.body.className).toBe("");
	expect(lockElement.className).toBe("");
	expect(shardElement.className).toBe("");
	expect(document.head.querySelector("[data-scroll-lock-inert]")).toBeNull();
});

test("createScrollLock - toggles inert mode while active", () => {
	const lockElement = document.createElement("div");

	document.body.append(lockElement);

	const controller = createTestScrollLock({ inert: false, lockElement });

	controller.activate();
	expect(document.head.querySelector("[data-scroll-lock-inert]")).toBeNull();

	controller.update({ inert: true });
	expect(document.head.querySelector("[data-scroll-lock-inert]")).not.toBeNull();
	expect(lockElement.className).toContain("scroll-lock-allow-interactivity");

	controller.update({ inert: false });
	expect(document.head.querySelector("[data-scroll-lock-inert]")).toBeNull();
	expect(lockElement.className).toBe("");

	controller.dispose();
});

test("createScrollLock - lifecycle methods are idempotent", () => {
	const controller = createTestScrollLock();

	controller.activate();
	controller.activate();
	controller.deactivate();
	controller.deactivate();
	controller.dispose();
	controller.dispose();

	expect(document.body.style.overflow).toBe("");
});
