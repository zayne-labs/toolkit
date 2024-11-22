import { isPlainObject } from "@/type-helpers";
import { useState } from "react";
import { useAfterMountEffect } from "./effects/useAfterMountEffect";
import { useDebouncedFn } from "./useDebounce";

const isSerializable = (item: unknown): item is boolean | number | string =>
	typeof item === "string" || typeof item === "number" || typeof item === "boolean";

const checkObjectPropsForQuery = (item: Record<string, unknown>, query: string): boolean => {
	for (const value of Object.values(item)) {
		if (isSerializable(value) && value.toString().toLowerCase().includes(query)) {
			return true;
		}
	}
	return false;
};

const useSearch = <TData>(initialData: TData[], delay?: number) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredData, setFilteredData] = useState(initialData);
	const [isLoading, setIsLoading] = useState(false);

	const handleDebouncedSearch = useDebouncedFn(() => {
		const query = searchQuery.toLowerCase();

		const filteredResults = initialData.filter((item) => {
			if (isSerializable(item)) {
				return item.toString().toLowerCase().includes(query);
			}

			if (isPlainObject(item)) {
				return checkObjectPropsForQuery(item, query);
			}

			return false;
		});

		setFilteredData(filteredResults);
		setIsLoading(false);
	}, delay);

	useAfterMountEffect(() => {
		setIsLoading(true);
		handleDebouncedSearch();
	}, [searchQuery]);

	return { data: filteredData, isLoading, query: searchQuery, setQuery: setSearchQuery };
};

export { useSearch };
