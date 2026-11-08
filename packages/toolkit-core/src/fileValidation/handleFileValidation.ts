import { runAsync, runSync, validationSteps } from "./executeValidation";
import type { FileValidationErrorContextEach, FileValidationOptions, FileValidationResult } from "./types";

/**
 * @description Validates files synchronously against the provided settings
 * @param options - Configuration options for file validation
 * @returns Object containing validation errors and valid files
 */
export const handleFileValidation = (options: FileValidationOptions): FileValidationResult => {
	const validFiles: FileValidationResult["validFiles"] = [];

	const errors: FileValidationErrorContextEach[] = [];

	runSync(validationSteps({ ...options, errors, validFiles }));

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
	const validFiles: FileValidationResult["validFiles"] = [];

	const errors: FileValidationErrorContextEach[] = [];

	await runAsync(validationSteps({ ...options, errors, validFiles }));

	return { errors, validFiles };
};
