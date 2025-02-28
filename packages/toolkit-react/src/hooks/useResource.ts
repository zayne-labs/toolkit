import { type UnknownObject, isFunction, isPlainObject } from "@zayne-labs/toolkit-type-helpers";
import { use, useEffect } from "react";

const replacer = (_: unknown, value: unknown) => {
	if (!isPlainObject(value)) {
		return value;
	}

	const transformedObject = Object.keys(value)
		.sort()
		.reduce<UnknownObject>((accumulator, key) => {
			accumulator[key] = value[key];

			return accumulator;
		}, {});

	return transformedObject;
};

type ResourceKey = readonly unknown[];

/**
 * @description Default resource key hash function. Hashes the value into a stable hash.
 *
 * Copied from TanStack Query
 */
const hashResourceKey = (resourceKey: ResourceKey) => JSON.stringify(resourceKey, replacer);

type ResourceFnContext = {
	resourceKey: ResourceKey;
};

type ResourceOptions<T> = {
	/**
	 * Function that returns the resource
	 */
	fn: (context: ResourceFnContext) => Promise<T>;
	/**
	 * Optional custom hash function for the resource key
	 */
	hashFn?: (key: ResourceKey) => string;
	/**
	 * Key that identifies the resource
	 */
	key?: ResourceKey | (() => ResourceKey);
};

const $PromiseCache = new Map<string, Promise<unknown>>();

/**
 * @description Hook that enables the consumption of a promise during render via the `use` api.
 */
const useResource = <TResource>(options: ResourceOptions<TResource>) => {
	const { fn, hashFn = hashResourceKey, key = () => [fn.toString()] } = options;

	const computedResourceKey = isFunction(key) ? key() : key;

	const hashedKey = hashFn(computedResourceKey);

	const fetchResourceAndSetCache = () => {
		const promise = fn({ resourceKey: computedResourceKey }).catch(($error) => {
			return $error;
		});

		$PromiseCache.set(hashedKey, promise);
	};

	if (!$PromiseCache.has(hashedKey)) {
		fetchResourceAndSetCache();
	}

	// eslint-disable-next-line ts-eslint/no-non-null-assertion -- It's fine
	const cachedPromise = $PromiseCache.get(hashedKey)!;

	const result = use(cachedPromise);

	useEffect(() => {
		$PromiseCache.delete(hashedKey);
	}, [hashedKey]);

	return { data: result as TResource, refetch: fetchResourceAndSetCache };
};

export { useResource };
