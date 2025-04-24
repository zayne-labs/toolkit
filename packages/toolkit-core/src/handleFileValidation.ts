export type FileMeta = {
	id: string;
	name: string;
	size: number;
	type: string;
	url: string;
};

export type ValidationSettings = {
	/**
	 * Array of allowed file types
	 */
	allowedFileTypes?: string[];
	/**
	 * Prevent duplicate files from being uploaded
	 */
	disallowDuplicates?: boolean;
	/**
	 * Maximum number of files that can be uploaded.
	 */
	maxFileCount?: number;
	/**
	 * Maximum file size in MB
	 */
	maxFileSize?: number;
};

export type FileValidationErrorContext = {
	/**
	 * Name of the validation setting that caused the error
	 */
	code: keyof ValidationSettings;
	/**
	 * File that caused the validation error
	 */
	errorFile: File;
	/**
	 * Error message
	 */
	message: string;
};

export type FileValidationSuccessContext = {
	/**
	 * Success message
	 */
	message: string;
	/**
	 * Array of successfully validated files
	 */
	validFiles: File[];
};

export type FileValidationOptions = {
	/**
	 * Array of existing files
	 */
	existingFiles?: Array<File | FileMeta>;
	/**
	 * FileList uploaded by user
	 */
	newFiles: File[] | FileList;
	/**
	 * Callback function to be called on each file upload as they occur
	 */
	onError?: (context: FileValidationErrorContext) => void;

	/**
	 * Callback function to be called once after all file upload errors have occurred
	 */
	onErrors?: (contextArray: FileValidationErrorContext[]) => void;
	/**
	 * Callback function to be called on validation success
	 */
	onSuccess?: (context: FileValidationSuccessContext) => void;
	/**
	 * Validation settings
	 */
	validationSettings?: ValidationSettings;
	/**
	 * Custom validation function
	 */
	validator?: (context: {
		existingFiles: FileValidationOptions["existingFiles"];
		newFiles: FileValidationOptions["newFiles"];
	}) => File[];
};

const megaByteToByte = (size: number) => size * 1024 * 1024;

const handleFileValidation = (options: FileValidationOptions) => {
	const {
		existingFiles = [],
		newFiles,
		onError,
		onErrors,
		onSuccess,
		validationSettings,
		validator,
	} = options;

	const validFilesArray: File[] = [];

	const errors: FileValidationErrorContext[] = [];

	const isDuplicateFile = (file: File) => {
		return existingFiles.some(
			(existingFile) => existingFile.name === file.name && existingFile.size === file.size
		);
	};

	const isMaxFileCountReached = (maximumFileCount: number) => {
		return existingFiles.length === maximumFileCount || validFilesArray.length === maximumFileCount;
	};

	const { allowedFileTypes, disallowDuplicates, maxFileCount, maxFileSize } = validationSettings ?? {};

	//	== Loop through the uploaded fileList and validate each file
	for (const file of newFiles) {
		if (maxFileCount && isMaxFileCountReached(maxFileCount)) {
			const message = `You can only upload a maximum of ${maxFileCount} files`;

			const context: FileValidationErrorContext = { code: "maxFileCount", errorFile: file, message };

			errors.push(context);

			onError?.(context);

			break;
		}

		if (disallowDuplicates && isDuplicateFile(file)) {
			const message = `File: "${file.name}" has already been selected`;

			const context: FileValidationErrorContext = {
				code: "disallowDuplicates",
				errorFile: file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const message = `File "${file.name}" is not an accepted file type. File must be of type: ${acceptedFilesString}`;

			const context: FileValidationErrorContext = {
				code: "allowedFileTypes",
				errorFile: file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		if (maxFileSize && file.size > megaByteToByte(maxFileSize)) {
			const message = `File "${file.name}" exceeds the maximum size of ${maxFileSize}mb`;

			const context: FileValidationErrorContext = {
				code: "maxFileSize",
				errorFile: file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		validFilesArray.push(file);
	}

	if (errors.length > 0) {
		onErrors?.(errors);
	}

	if (validFilesArray.length > 0) {
		const message = `Uploaded ${validFilesArray.length} file${validFilesArray.length > 1 ? "s" : ""}!`;

		onSuccess?.({ message, validFiles: validFilesArray });
	}

	const validatorFnFileArray = validator?.({ existingFiles, newFiles }) ?? [];

	return { errors, validFiles: [...validFilesArray, ...validatorFnFileArray] };
};

export { handleFileValidation };
