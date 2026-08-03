import { isBrowser } from "../constants";
import { acquireBodyGapLock, type BodyGapLockController } from "./bodyGap";
import {
	eventPathContains,
	getEventTarget,
	getNearestHTMLElement,
	getNonPassiveOptions,
	resolveElement,
	resolveShards,
} from "./dom";
import { createInertLock } from "./inert";
import { locationCouldBeScrolled, shouldCancelScroll } from "./scrollBoundary";
import type { ScrollLockAxis, ScrollLockController, ScrollLockOptions, ScrollLockResolvedOptions } from "./types";

type ActiveLock = {
	allowPinchZoom: boolean;
	lockElement: () => HTMLElement | null;
	noIsolation: boolean;
	shards: () => HTMLElement[];
};

let activeLocks: ActiveLock[] = [];
let documentListenersCount = 0;
let touchStart = [0, 0] as [number, number];
let activeAxis: ScrollLockAxis | undefined;

const getTopLock = () => activeLocks.at(-1) ?? null;

const getTouchXY = (event: TouchEvent | WheelEvent): [number, number] =>
	"changedTouches" in event ?
		[event.changedTouches[0]?.clientX ?? 0, event.changedTouches[0]?.clientY ?? 0]
	:	[0, 0];

const isRangeInput = (target: EventTarget | null) =>
	target instanceof HTMLInputElement && target.type === "range";

const isTouchingSelection = (target: EventTarget | null) => {
	if (!(target instanceof Node)) return false;

	const selection = globalThis.getSelection();
	const anchorNode = selection?.anchorNode;

	return anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
};

const getLockTarget = (lock: ActiveLock, event: Event) => {
	const lockElement = lock.lockElement();
	const shards = lock.shards();

	if (lockElement && eventPathContains(lockElement, event)) return lockElement;

	return shards.find((shard) => eventPathContains(shard, event)) ?? null;
};

const getEventAxis = (deltaX: number, deltaY: number): ScrollLockAxis =>
	Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";

const shouldCancelEvent = (lock: ActiveLock, event: TouchEvent | WheelEvent, lockTarget: HTMLElement) => {
	if (("touches" in event && event.touches.length === 2) || (event.type === "wheel" && (event as WheelEvent).ctrlKey)) {
		return !lock.allowPinchZoom;
	}

	const touch = getTouchXY(event);
	const deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
	const deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
	const moveDirection = getEventAxis(deltaX, deltaY);
	const eventTarget = getEventTarget(event);

	if ("touches" in event && moveDirection === "h" && isRangeInput(eventTarget)) {
		return false;
	}

	if (isTouchingSelection(eventTarget)) {
		return false;
	}

	const eventElement = getNearestHTMLElement(eventTarget);

	if (!eventElement) return true;

	const canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, eventElement);

	if (!canBeScrolledInMainDirection) return true;

	if (!activeAxis && "changedTouches" in event && (deltaX || deltaY)) {
		activeAxis = moveDirection;
	}

	const cancelingAxis = activeAxis ?? moveDirection;

	return shouldCancelScroll(cancelingAxis, lockTarget, event, cancelingAxis === "h" ? deltaX : deltaY, true);
};

const handleDocumentWheelOrTouchMove = (event: Event) => {
	const lock = getTopLock();

	if (!lock) return;

	const lockTarget = getLockTarget(lock, event);
	const shouldPrevent =
		lockTarget ?
			shouldCancelEvent(lock, event as TouchEvent | WheelEvent, lockTarget)
		:	!lock.noIsolation;

	if (shouldPrevent && event.cancelable) {
		event.preventDefault();
	}
};

const handleDocumentTouchStart = (event: Event) => {
	touchStart = getTouchXY(event as TouchEvent);
	activeAxis = undefined;
};

const attachDocumentListeners = () => {
	if (!isBrowser()) return;

	documentListenersCount += 1;

	if (documentListenersCount > 1) return;

	const nonPassiveOptions = getNonPassiveOptions();

	document.addEventListener("wheel", handleDocumentWheelOrTouchMove, nonPassiveOptions);
	document.addEventListener("touchmove", handleDocumentWheelOrTouchMove, nonPassiveOptions);
	document.addEventListener("touchstart", handleDocumentTouchStart, nonPassiveOptions);
};

const detachDocumentListeners = () => {
	if (!isBrowser() || documentListenersCount === 0) return;

	documentListenersCount -= 1;

	if (documentListenersCount > 0) return;

	const nonPassiveOptions = getNonPassiveOptions() as boolean | EventListenerOptions;

	document.removeEventListener("wheel", handleDocumentWheelOrTouchMove, nonPassiveOptions);
	document.removeEventListener("touchmove", handleDocumentWheelOrTouchMove, nonPassiveOptions);
	document.removeEventListener("touchstart", handleDocumentTouchStart, nonPassiveOptions);
};

const defaultLockElement = () => (isBrowser() ? document.body : null);

const normalizeOptions = ({
	allowPinchZoom = false,
	enabled = true,
	gapMode = "margin",
	inert = false,
	lockElement = defaultLockElement,
	noIsolation = false,
	noRelative = false,
	removeScrollBar = true,
	shards,
}: ScrollLockOptions): ScrollLockResolvedOptions => ({
	allowPinchZoom,
	enabled,
	gapMode,
	inert,
	lockElement,
	noIsolation,
	noRelative,
	removeScrollBar,
	shards,
});

export const createScrollLock = (initialOptions: ScrollLockOptions = {}): ScrollLockController => {
	let options = normalizeOptions(initialOptions);
	let isActive = false;
	let bodyGapLock: BodyGapLockController | null = null;
	const inertLock = createInertLock(options);

	const lock: ActiveLock = {
		allowPinchZoom: options.allowPinchZoom,
		lockElement: () => resolveElement(options.lockElement) ?? defaultLockElement(),
		noIsolation: options.noIsolation,
		shards: () => resolveShards(options.shards),
	};

	const syncLockOptions = () => {
		lock.allowPinchZoom = options.allowPinchZoom;
		lock.noIsolation = options.noIsolation;
		inertLock.update(options);
	};

	const controller: ScrollLockController = {
		activate: () => {
			if (!isBrowser() || isActive || !options.enabled) return;

			isActive = true;
			activeLocks = [...activeLocks.filter((activeLock) => activeLock !== lock), lock];
			attachDocumentListeners();
			syncLockOptions();

			if (options.removeScrollBar) {
				bodyGapLock = acquireBodyGapLock({ gapMode: options.gapMode, noRelative: options.noRelative });
			}

			inertLock.activate();
		},
		deactivate: () => {
			if (!isActive) return;

			isActive = false;
			activeLocks = activeLocks.filter((activeLock) => activeLock !== lock);
			detachDocumentListeners();
			inertLock.dispose();

			bodyGapLock?.release();
			bodyGapLock = null;
		},
		dispose: () => {
			controller.deactivate();
		},
		isActive: () => isActive,
		update: (nextOptions) => {
			const wasEnabled = options.enabled;

			options = normalizeOptions({ ...options, ...nextOptions });
			syncLockOptions();

			if (!isActive) return;

			if (wasEnabled && !options.enabled) {
				controller.deactivate();
				return;
			}

			if (!bodyGapLock && options.removeScrollBar) {
				bodyGapLock = acquireBodyGapLock({ gapMode: options.gapMode, noRelative: options.noRelative });
			}

			if (bodyGapLock && !options.removeScrollBar) {
				bodyGapLock.release();
				bodyGapLock = null;
			}

			if (bodyGapLock) {
				bodyGapLock.update({ gapMode: options.gapMode, noRelative: options.noRelative });
			}

			if (options.inert) {
				inertLock.activate();
			} else {
				inertLock.dispose();
			}
		},
	};

	return controller;
};

export const getActiveScrollLockCount = () => activeLocks.length;
