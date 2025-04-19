type ValidationSettings = {
	allowedFileTypes?: string[];
	disallowDuplicates?: boolean;
	maxFileCount?: number;
	maxFileSize?: number;
};

type FileValidationErrorContext = {
	cause: {
		file: File;
		setting: keyof ValidationSettings;
	};
	message: string;
};

type FileValidationSuccessContext = {
	acceptedFiles: File[];
	message: string;
};

export type FileValidationOptions = {
	existingFileArray?: File[];
	newFileList: FileList;
	onError?: (context: FileValidationErrorContext) => void;
	onSuccess?: (context: FileValidationSuccessContext) => void;
	validationSettings?: ValidationSettings;
	validator?: (context: { existingFileArray: File[] | undefined; newFileList: FileList }) => File[];
};

const toMegaByte = (size: number) => size * 1024 * 1024;

const handleFileValidation = (options: FileValidationOptions) => {
	const {
		existingFileArray = [],
		newFileList,
		onError,
		onSuccess,
		validationSettings = {},
		validator,
	} = options;

	const { allowedFileTypes, disallowDuplicates, maxFileCount, maxFileSize } = validationSettings;

	const validFilesArray: File[] = [];

	const isFileUnique = (file: File) => {
		return existingFileArray.every((fileItem) => fileItem.name !== file.name);
	};

	const isFileLimitReached = (limit: number) => {
		return existingFileArray.length === limit || validFilesArray.length === limit;
	};

	//	== Loop through fileList and validate each file
	for (const file of newFileList) {
		if (maxFileCount && isFileLimitReached(maxFileCount)) {
			const message = `Maximum file count of ${maxFileCount} files has been reached`;

			onError?.({ cause: { file, setting: "maxFileCount" }, message });

			break;
		}

		if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const message = `File type must be of: ${acceptedFilesString}`;

			onError?.({ cause: { file, setting: "allowedFileTypes" }, message });

			continue;
		}

		if (maxFileSize && file.size > toMegaByte(maxFileSize)) {
			const message = `Cannot upload a file larger than ${maxFileSize}mb`;

			onError?.({ cause: { file, setting: "maxFileSize" }, message });

			continue;
		}

		if (disallowDuplicates && !isFileUnique(file)) {
			const message = `File: "${file.name}" has already been selected`;

			onError?.({ cause: { file, setting: "disallowDuplicates" }, message });

			continue;
		}

		validFilesArray.push(file);
	}

	if (validFilesArray.length > 0) {
		onSuccess?.({
			acceptedFiles: validFilesArray,
			message: `Uploaded ${validFilesArray.length} file${validFilesArray.length > 1 ? "s" : ""}!`,
		});
	}

	const validatorFnFileArray = validator?.({ existingFileArray, newFileList }) ?? [];

	return [...validFilesArray, ...validatorFnFileArray];
};

export { handleFileValidation };
