"use client";

import { createScrollLock, type ScrollLockOptions, type ScrollLockShard } from "@zayne-labs/toolkit-core";
import { useEffect, useRef } from "react";
import { useUnmountEffect } from "./effects";
import { useConstant } from "./useConstant";

export type UseScrollLockOptions<TElement extends HTMLElement = HTMLElement> = Omit<
	ScrollLockOptions,
	"lockElement" | "shards"
> & {
	ref?: React.RefObject<TElement | null>;
	shards?: Array<React.RefObject<HTMLElement | null> | ScrollLockShard>;
};

export const useScrollLock = <TElement extends HTMLElement = HTMLElement>(
	options: UseScrollLockOptions<TElement> = {}
) => {
	const {
		allowPinchZoom,
		enabled = true,
		gapMode,
		inert,
		noIsolation,
		noRelative,
		ref: externalRef,
		removeScrollBar,
		shards,
	} = options;

	const internalRef = useRef<TElement>(null);

	const lockRef = externalRef ?? internalRef;

	const controller = useConstant(() => {
		return createScrollLock({
			allowPinchZoom,
			enabled,
			gapMode,
			inert,
			lockElement: lockRef,
			noIsolation,
			noRelative,
			removeScrollBar,
			shards,
		});
	});

	useEffect(() => {
		controller.update({
			allowPinchZoom,
			enabled,
			gapMode,
			inert,
			lockElement: lockRef,
			noIsolation,
			noRelative,
			removeScrollBar,
			shards,
		});

		enabled ? controller.activate() : controller.deactivate();
	}, [
		allowPinchZoom,
		controller,
		enabled,
		gapMode,
		inert,
		lockRef,
		noIsolation,
		noRelative,
		removeScrollBar,
		shards,
	]);

	useUnmountEffect(() => {
		controller.dispose();
	});

	return { ref: lockRef };
};
