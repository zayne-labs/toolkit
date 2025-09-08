import type {
	AnyFunction,
	AnyString,
	Awaitable,
	UnionDiscriminator,
	UnmaskType,
} from "@zayne-labs/toolkit-type-helpers";

export type FileOrFileMeta = File | FileMeta;

export interface FileValidationOptions<TVariant extends "async" | "sync" = "sync"> {
	/**
	 * Array of existing files to check against for duplicates and maxFileCount
	 */
	existingFiles?: FileOrFileMeta[];
	/**
	 * Callbacks for handling validation events
	 */
	hooks?: TVariant extends "sync" ? FileValidationHooks : FileValidationHooksAsync;
	/**
	 * Files to validate
	 */
	newFiles: Array<FileOrFileMeta | undefined> | FileList | undefined;
	/**
	 * Settings to configure validation behavior
	 */
	settings?: TVariant extends "sync" ? FileValidationSettings : FileValidationSettingsAsync;
}

export type FileValidationResult = Pick<FileValidationErrorContextBatch, "errors">
	& Pick<FileValidationSuccessContextBatch, "validFiles">;

export interface BaseFileMeta {
	/**
	 * Unique identifier for the file
	 */
	id: string;
}

export interface FileMetaWithURL {
	/**
	 * Name of the file
	 */
	name: string;
	/**
	 * Size of the file in bytes, undefined if size cannot be determined
	 */
	size: number | undefined;
	/**
	 * MIME type of the file
	 */
	type: string;
	/**
	 * URL to access the file
	 */
	url: string;
}

export interface FileMetaWithFileObject {
	/**
	 * File object
	 */
	file: File;
}

export type FileMeta = BaseFileMeta & UnionDiscriminator<[FileMetaWithURL, FileMetaWithFileObject], null>;

type PossibleErrorCodes = UnmaskType<
	| "custom-validation-failed" // Custom validation failed
	| "duplicate-file" // File already exists when disallowDuplicates=true
	| "file-too-large" // File exceeds maxFileSize
	| "invalid-file-type" // File type not in allowedFileTypes
	| "too-many-files" // Files exceed maxFileCount
	| AnyString
>;

export type FileValidationErrorContextEach = UnionDiscriminator<
	[{ cause: "custom-error"; originalError: unknown }, { cause: keyof FileValidationSettings }],
	null
> & {
	/**
	 * Error code identifying the type of validation failure
	 */
	code: PossibleErrorCodes;
	/**
	 * The file that failed validation
	 */
	file: FileOrFileMeta;
	/**
	 * Human-readable error message
	 */
	message: string;
};

export interface FileValidationErrorContextBatch {
	/**
	 * Array of validation errors that occurred
	 */
	errors: FileValidationErrorContextEach[];
}

export interface FileValidationSuccessContextEach {
	/**
	 * Success message to display to user
	 */
	message: string;
	/**
	 * File that passed validation
	 */
	validFile: FileOrFileMeta;
}

export interface FileValidationSuccessContextBatch
	extends Pick<FileValidationSuccessContextEach, "message"> {
	/**
	 * Array of files that passed validation
	 */
	validFiles: Array<FileValidationSuccessContextEach["validFile"]>;
}

export interface FileValidationSettings {
	/**
	 * List of allowed file extensions/types (e.g. ['.jpg', '.png'])
	 */
	allowedFileTypes?: string[];

	/**
	 * Maximum number of files allowed (including existing files)
	 */
	maxFileCount?: number;

	/**
	 * Maximum file size
	 *
	 * By default, the value is in bytes, but you can also use an object with kb, mb, gb etc as properties
	 */
	maxFileSize?:
		| number
		| UnionDiscriminator<[{ kb: number }, { mb: number }, { gb: number }, { tb: number }]>;

	/**
	 * Whether to reject files that already exist in existingFiles
	 */
	rejectDuplicateFiles?: boolean;

	/**
	 * Custom validation function that runs after built-in validation
	 * Return an object with code/message to reject the file, or null/undefined to accept
	 */
	validator?: (context: { file: FileOrFileMeta }) =>
		| {
				code: FileValidationErrorContextEach["code"];
				message?: FileValidationErrorContextEach["message"];
		  }
		| {
				code?: FileValidationErrorContextEach["code"];
				message: FileValidationErrorContextEach["message"];
		  }
		| null
		| undefined
		// eslint-disable-next-line ts-eslint/no-invalid-void-type -- Allow
		| void;
}

export interface FileValidationHooks {
	/**
	 * Called after all validation is complete if any files failed
	 */
	onErrorBatch?: (context: FileValidationErrorContextBatch) => void;
	/**
	 * Called when an individual file fails validation
	 */
	onErrorEach?: (context: FileValidationErrorContextEach) => void;
	/**
	 * Called after all validation is complete if any files passed
	 */
	onSuccessBatch?: (context: FileValidationSuccessContextBatch) => void;
	/**
	 * Called when an individual file passes validation
	 */
	onSuccessEach?: (context: FileValidationSuccessContextEach) => void;
}

type ToAwaitableFn<TFunction> =
	TFunction extends AnyFunction ? (...params: Parameters<TFunction>) => Awaitable<ReturnType<TFunction>>
	:	TFunction;

export type FileValidationSettingsAsync = {
	[Key in keyof FileValidationSettings]: ToAwaitableFn<FileValidationSettings[Key]>;
};

export type FileValidationHooksAsync = {
	[Key in keyof FileValidationHooks]: ToAwaitableFn<FileValidationHooks[Key]>;
};
