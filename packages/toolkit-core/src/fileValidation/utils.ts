import { defineEnum, isFile, isNumber, isString } from "@zayne-labs/toolkit-type-helpers";
import type { FileValidationOptions, ValidationSettings } from "./types";

export const isValidFileType = (
	file: File,
	allowedFileTypes: Required<Required<FileValidationOptions>["settings"]>["allowedFileTypes"]
) => {
	return allowedFileTypes.some((type) => {
		// == Check if it's a MIME type (contains '/')
		if (type.includes("/")) {
			return file.type === type;
		}

		const fileExtension = file.name.includes(".") ? file.name.split(".").at(-1)?.toLowerCase() : null;

		if (!fileExtension) {
			return false;
		}

		const typeWithoutDot = type.startsWith(".") ? type.toLowerCase().slice(1) : type.toLowerCase();

		return fileExtension === typeWithoutDot;
	});
};

export const isDuplicateFile = (
	file: File,
	existingFiles: NonNullable<FileValidationOptions["existingFiles"]>
) => {
	return existingFiles.some((existingFile) => {
		if (isFile(existingFile)) {
			return existingFile.name === file.name && existingFile.size === file.size;
		}

		if (isNumber(existingFile.size)) {
			return existingFile.name === file.name && existingFile.size === file.size;
		}

		return existingFile.name === file.name;
	});
};

export const isMaxFileCountReached = (
	maxFileCount: Required<ValidationSettings>["maxFileCount"],
	existingFiles: Required<FileValidationOptions>["existingFiles"],
	validFiles: Required<FileValidationOptions>["newFiles"]
) => {
	return existingFiles.length === maxFileCount || validFiles.length === maxFileCount;
};

const UNIT_MULTIPLIERS = defineEnum({
	gb: 3,
	kb: 1,
	mb: 2,
	tb: 4,
}) satisfies Record<keyof Extract<ValidationSettings["maxFileSize"], object>, number>;

/**
 * @description Converts various size formats to bytes
 * @param size - Size in bytes (number) or object specifying size in bytes, kb, mb, or gb
 * @returns Size in bytes
 * @throws {Error} If size is invalid or missing required properties
 *
 * @example
 * ### Usage
 * ```ts
 * toBytes(5000) // 5000 bytes
 * toBytes({ mb: 5 }) // 5MB = 5,242,880 bytes
 * toBytes({ gb: 1 }) // 1GB = 1,073,741,824 bytes
 * toBytes({ tb: 1 }) // 1TB = 1,099,511,627,776 bytes
 * toBytes({ kb: 500 }) // 500KB = 512,000 bytes
 * ```
 */
export const toBytes = (size: Required<ValidationSettings>["maxFileSize"] | undefined) => {
	if (size === undefined) return;

	// Handle number input (default: bytes)
	if (isNumber(size)) {
		return size;
	}

	const sizeEntries = Object.entries(size) as Array<[keyof typeof size, number]>;

	const [unit, value] = sizeEntries[0] ?? [];

	if (!isString(unit) || !isNumber(value)) return;

	if (!Object.hasOwn(UNIT_MULTIPLIERS, unit)) {
		throw new Error("Given unit is not handled");
	}

	const multiplier = UNIT_MULTIPLIERS[unit];

	const bytesPerUnit = 1024;

	return value * bytesPerUnit ** multiplier;
};

/**
 * @description Formats a number of bytes into a human readable string with appropriate unit
 * @param bytes - Number of bytes to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string with unit
 *
 * @example
 * ### Usage
 * ```ts
 * formatBytes(1234) // "1.21 KB"
 * formatBytes(1234567) // "1.18 MB"
 * formatBytes(1234567890) // "1.15 GB"
 * formatBytes(1234, 0) // "1 KB"
 * formatBytes(1234, 3) // "1.205 KB"
 * ```
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
	if (bytes === 0) return "0 Bytes";

	const bytesPerUnit = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const resolvedDecimals = Math.max(decimals, 0);

	// Get the appropriate unit index by calculating log base 1024
	const unitIndex = Math.floor(Math.log(bytes) / Math.log(bytesPerUnit));

	// Convert to the unit and format with specified decimals
	const formattedSize = Number.parseFloat((bytes / bytesPerUnit ** unitIndex).toFixed(resolvedDecimals));

	return `${formattedSize} ${sizes[unitIndex]}`;
};
