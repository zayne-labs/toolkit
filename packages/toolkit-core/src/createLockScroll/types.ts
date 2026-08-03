export type ScrollLockAxis = "h" | "v";

export type ScrollLockGapMode = "margin" | "padding";

export type ScrollLockElementResolver = HTMLElement | (() => HTMLElement | null | undefined) | null | undefined;

export type ScrollLockShard = ScrollLockElementResolver | { current: HTMLElement | null | undefined };

export type ScrollLockOptions = {
	allowPinchZoom?: boolean;
	enabled?: boolean;
	gapMode?: ScrollLockGapMode;
	inert?: boolean;
	lockElement?: ScrollLockElementResolver | { current: HTMLElement | null | undefined };
	noIsolation?: boolean;
	noRelative?: boolean;
	removeScrollBar?: boolean;
	shards?: ScrollLockShard[] | (() => ScrollLockShard[] | null | undefined);
};

export type ScrollLockResolvedOptions = Required<
	Pick<
		ScrollLockOptions,
		"allowPinchZoom" | "enabled" | "gapMode" | "inert" | "noIsolation" | "noRelative" | "removeScrollBar"
	>
> & {
	lockElement?: ScrollLockOptions["lockElement"];
	shards?: ScrollLockOptions["shards"];
};

export type ScrollLockController = {
	activate: () => void;
	deactivate: () => void;
	dispose: () => void;
	isActive: () => boolean;
	update: (options: Partial<ScrollLockOptions>) => void;
};
