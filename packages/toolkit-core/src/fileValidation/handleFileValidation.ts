import { executeValidation } from "./executeValidation";
import type {
	FileValidationErrorSingleContext,
	FileValidationOptions,
	FileValidationResult,
} from "./types";

/**
 * @description Validates files synchronously against the provided settings
 * @param options - Configuration options for file validation
 * @returns Object containing validation errors and valid files
 */
export const handleFileValidation = (options: FileValidationOptions): FileValidationResult => {
	const validFiles: File[] = [];

	const errors: FileValidationErrorSingleContext[] = [];

	void executeValidation({ ...options, errors, validFiles });

	return { errors, validFiles };
};

/**
 * @description Validates files asynchronously against the provided settings
 * Similar to handleFileValidation but supports async validators and hooks
 *
 * @param options - Configuration options for async file validation
 * @returns Object containing validation errors and valid files
 */

export const handleFileValidationAsync = async (
	options: FileValidationOptions<"async">
): Promise<FileValidationResult> => {
	const validFiles: File[] = [];

	const errors: FileValidationErrorSingleContext[] = [];

	await executeValidation({ ...options, errors, validFiles });

	return { errors, validFiles };
};
