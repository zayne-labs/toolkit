import { resolveElement, resolveShards } from "./dom";
import type { ScrollLockResolvedOptions } from "./types";

let inertIdCounter = 0;

export type InertLock = {
	activate: () => void;
	dispose: () => void;
	update: (options: ScrollLockResolvedOptions) => void;
};

const createStyleElement = (id: number) => {
	const styleElement = document.createElement("style");

	styleElement.dataset.scrollLockInert = String(id);
	styleElement.textContent = `
.scroll-lock-block-interactivity-${id} { pointer-events: none; }
.scroll-lock-allow-interactivity-${id} { pointer-events: all; }
`;

	return styleElement;
};

export const createInertLock = (options: ScrollLockResolvedOptions): InertLock => {
	let id: number | null = null;
	let currentOptions = options;
	let styleElement: HTMLStyleElement | null = null;
	let allowedElements: HTMLElement[] = [];
	let isActive = false;

	const getId = () => {
		id ??= inertIdCounter++;

		return id;
	};

	const getBlockClassName = () => `scroll-lock-block-interactivity-${getId()}`;
	const getAllowClassName = () => `scroll-lock-allow-interactivity-${getId()}`;

	const getAllowedElements = () => {
		const lockElement = resolveElement(currentOptions.lockElement) ?? document.body;

		return [lockElement, ...resolveShards(currentOptions.shards)];
	};

	const cleanupClasses = () => {
		if (id === null) return;

		document.body.classList.remove(getBlockClassName());

		for (const element of allowedElements) {
			element.classList.remove(getAllowClassName());
		}

		allowedElements = [];
	};

	const activate = () => {
		if (!currentOptions.inert || isActive) return;

		isActive = true;

		styleElement = createStyleElement(getId());
		document.head.append(styleElement);

		document.body.classList.add(getBlockClassName());
		allowedElements = getAllowedElements();

		for (const element of allowedElements) {
			element.classList.add(getAllowClassName());
		}
	};

	const dispose = () => {
		if (!isActive) return;

		isActive = false;
		cleanupClasses();
		styleElement?.remove();
		styleElement = null;
	};

	const update = (optionsUpdate: ScrollLockResolvedOptions) => {
		currentOptions = optionsUpdate;

		if (!isActive) return;

		cleanupClasses();
		allowedElements = getAllowedElements();

		document.body.classList.add(getBlockClassName());

		for (const element of allowedElements) {
			element.classList.add(getAllowClassName());
		}
	};

	return { activate, dispose, update };
};
