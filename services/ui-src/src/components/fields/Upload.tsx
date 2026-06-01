import { Box, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { UploadListProp } from "@rhtp/shared";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/upload";
import {
  acceptedFileTypes,
  downloadFile,
  getFileWithSafeName,
  uploadListRender,
} from "utils/other/upload";
import { useStore } from "utils";

interface Props {
  answer: UploadListProp[];
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport: (file: UploadListProp) => void;
  uploadAreaHidden?: boolean;
  uploadedSubLabel: string;
}

export const Upload = ({
  answer,
  saveToReport,
  deleteFromReport,
  uploadAreaHidden = false,
  uploadedSubLabel,
}: Props) => {
  const { report } = useStore();
  const { id, state, type: reportType } = report!;
  const [filesToUpload, setFilesToUpload] = useState<File[]>();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  useEffect(() => {
    if (filesToUpload && filesToUpload.length > 0) {
      const fetchData = async () =>
        await onUploadFiles().then((response) => {
          setFilesToUpload([]);
          saveToReport(response);
        });
      fetchData();
    }
  }, [filesToUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const filterFilesAndStartUpload = (files: File[]) => {
    const filteredFiles = files.filter((file) => {
      if (file === null) return false;
      const splitName = file.name.split(".");

      if (splitName.at(0)?.trim() === "") {
        setUploadErrors((prevErrors) => [
          ...(prevErrors ?? []),
          `File ${file.name} has an invalid name and was not uploaded`,
        ]);
        return false;
      }

      const fileType = splitName.at(-1)?.toLowerCase();

      if (!fileType || !acceptedFileTypes.includes(`.${fileType}`)) {
        setUploadErrors((prevErrors) => [
          ...(prevErrors ?? []),
          `File ${file.name} has unsupported file type and was not uploaded`,
        ]);
        return false;
      }

      return true;
    });

    const prevFiles = filesToUpload ?? [];
    setFilesToUpload([...prevFiles, ...filteredFiles]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file != null);
    filterFilesAndStartUpload(files);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      filterFilesAndStartUpload([...event.target.files]);
    }
  };

  const onUploadFiles = async () => {
    const files = filesToUpload ?? [];
    const savedFiles = [];
    for (var i = 0; i < files.length; i++) {
      const displayName = files[i].name;
      const file = getFileWithSafeName(files[i]);
      const { presignedUploadUrl, fileId } =
        await recordFileInDatabaseAndGetUploadUrl(reportType, state, id, file);
      savedFiles.push({ name: displayName, fileId: fileId, size: file.size });
      await uploadFileToS3({ presignedUploadUrl }, file);
    }
    return savedFiles;
  };

  return (
    <VStack sx={sx.container} gap="1rem" alignItems="flex-start">
      {!uploadAreaHidden && (
        <>
          <div>
            <Text sx={sx.uploadedLabel}>Select a file or files to upload</Text>
            <Text sx={sx.uploadedSubLabel}>
              Supported formats: JPEG, PNG, PDF, CSV, Word, PPT
            </Text>
          </div>
          <Box
            sx={sx.uploadBox}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            width="100%"
            aria-label="file drop area"
          >
            <span>
              Drag files here or
              <label id="drop-zone">
                Choose from folder
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept={acceptedFileTypes.join(",")}
                  onChange={onFileChange}
                />
              </label>
            </span>
          </Box>
          {uploadErrors.length > 0 && (
            <Box>
              {uploadErrors.map((error) => (
                <Text sx={sx.uploadErrorLabel}>{error}</Text>
              ))}
            </Box>
          )}

          <Text sx={sx.uploadedLabel}>Selected Files</Text>
          {uploadListRender(
            reportType,
            state,
            id,
            filesToUpload ?? [],
            deleteFromReport
          )}
        </>
      )}
      <div>
        <Text sx={sx.uploadedLabel}>Uploaded Files</Text>
        <Text sx={sx.uploadedSubLabel}>{uploadedSubLabel}</Text>
      </div>
      {uploadListRender(
        reportType,
        state,
        id,
        answer ?? [],
        deleteFromReport,
        downloadFile,
        uploadAreaHidden
      )}
    </VStack>
  );
};

const sx = {
  container: {
    h2: {
      margin: "1.5rem 0",
      fontWeight: "700",
    },
  },

  uploadedLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
  },

  uploadErrorLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
    color: "error",
  },

  uploadedSubLabel: {
    fontSize: "14px",
  },

  uploadBox: {
    display: "flex",
    flexDir: "column",
    border: "1px dashed #0071bc",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",

    span: {
      display: "flex",
      margin: ".50rem",
    },

    label: {
      paddingLeft: ".25rem",
      marginBlock: 0,
      color: "primary",
      textDecoration: "underline",
      fontWeight: "700",
    },

    "#file-input": {
      display: "none",
    },
  },
};
