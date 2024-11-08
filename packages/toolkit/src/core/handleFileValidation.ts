type ValidationRules = {
	allowedFileTypes?: string[];
	disallowDuplicates?: boolean;
	fileLimit?: number;
	maxFileSize?: number;
};

type ErrorContext = {
	message: string;
};

type FileValidationOptions = {
	existingFileArray?: File[];
	newFileList: FileList;
	onError?: (errorContext: ErrorContext) => void;
	validationRules?: ValidationRules;
};

const toMegaByte = (size: number) => size * 1024 * 1024;

const handleFileValidation = (options: FileValidationOptions) => {
	const { existingFileArray = [], newFileList, onError, validationRules } = options;

	const { allowedFileTypes, disallowDuplicates, fileLimit, maxFileSize } = validationRules ?? {};

	const validFilesArray: File[] = [];

	const isFileUnique = (file: File) => {
		return existingFileArray.every((fileItem) => fileItem.name !== file.name);
	};

	const isFileLimitReached = (limit: number) => {
		return existingFileArray.length === limit || validFilesArray.length === limit;
	};

	//	== Loop through fileList and validate each file
	for (const file of newFileList) {
		if (fileLimit && isFileLimitReached(fileLimit)) {
			const message = `Maximum file limit of ${fileLimit} files has been reached`;

			onError?.({ message });

			break;
		}

		if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const message = `File type must be of: ${acceptedFilesString}`;

			onError?.({ message });

			continue;
		}

		if (maxFileSize && file.size > toMegaByte(maxFileSize)) {
			const message = `Cannot upload a file larger than ${maxFileSize}mb`;

			onError?.({ message });

			continue;
		}

		if (disallowDuplicates && !isFileUnique(file)) {
			const message = `File: "${file.name}" has already been selected`;

			onError?.({ message });

			continue;
		}

		validFilesArray.push(file);
	}

	return validFilesArray;
};

export { handleFileValidation };
