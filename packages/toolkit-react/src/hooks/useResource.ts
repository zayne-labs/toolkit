// import { use } from "react";
// import { useConstant } from "./useConstant";

// type ResourceKey = readonly unknown[];

// const hasObjectPrototype = (value: unknown) => Object.prototype.toString.call(value) === "[object Object]";

// // Copied from TanStack Query's isPlainObject
// export const isPlainObject = (o: any): o is Object => {
// 	if (!hasObjectPrototype(o)) {
// 		return false;
// 	}

// 	// If has no constructor
// 	const ctor = o.constructor;
// 	if (ctor === undefined) {
// 		return true;
// 	}

// 	// If has modified prototype
// 	const prot = ctor.prototype;
// 	if (!hasObjectPrototype(prot)) {
// 		return false;
// 	}

// 	// If constructor does not have an Object-specific method
// 	if (!prot.hasOwnProperty("isPrototypeOf")) {
// 		return false;
// 	}

// 	// Handles Objects created by Object.create(<arbitrary prototype>)
// 	if (Object.getPrototypeOf(o) !== Object.prototype) {
// 		return false;
// 	}

// 	// Most likely a plain Object
// 	return true;
// };

// /**
//  * @description Default resource key hash function.
//  * Hashes the value into a stable hash.
//  */
// const hashResourceKey = (key: ResourceKey): string => {
// 	return JSON.stringify(key, (_, val) =>
// 		isPlainObject(val)
// 			? Object.keys(val)
// 					.sort()
// 					.reduce((result, key) => {
// 						result[key] = val[key];
// 						return result;
// 					}, {})
// 			: val
// 	);
// };

// type ResourceOptions<T> = {
// 	/** Optional custom hash function for the resource key */
// 	hashFn?: (key: ResourceKey) => string;
// 	key: ResourceKey;
// 	loader: () => Promise<T>;
// };

// const useResource = <T>({ hashFn = hashResourceKey, key, loader }: ResourceOptions<T>): T => {
// 	const $ResourceCache = useConstant(() => new Map<string, Promise<T>>());
// 	const hashedKey = hashFn(key);

// 	const cachedResource = $ResourceCache.get(hashedKey);
// 	if (cachedResource) return use(cachedResource);

// 	const promise = loader();
// 	$ResourceCache.set(hashedKey, promise);

// 	return use(promise);
// };

// export { useResource, type ResourceKey, type ResourceOptions };

// eslint-disable-next-line unicorn/no-empty-file -- Will come back later
