import type { CreateStoreOptions, StoreApi } from "@/createStore";
import type { PartialURLInfo, URLInfoObject } from "@/navigation";

export type LocationStoreInfo = URLInfoObject;

export type LocationStoreOptions = Pick<
	CreateStoreOptions<string | LocationStoreInfo>,
	"equalityFn" | "shouldNotifySync"
> & {
	defaultValues?: Omit<PartialURLInfo, "searchString">;
	/**
	 * A custom logger for error reporting.
	 * @default console.error
	 */
	logger?: (error: unknown) => void;
};

type NavigationOptions = {
	shouldNotifySync?: boolean;
	state?: PartialURLInfo["state"];
};

export type LocationStoreApi = Omit<StoreApi<LocationStoreInfo>, "resetState" | "setState"> & {
	push: (newURL: string | PartialURLInfo, options?: NavigationOptions) => void;
	replace: LocationStoreApi["push"];
	triggerPopstateEvent: (nextLocationState?: LocationStoreInfo["state"]) => void;
};
