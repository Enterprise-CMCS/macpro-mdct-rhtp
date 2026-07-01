import { Box, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { UploadListProp } from "@rhtp/shared";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/fileMethods";
import {
  acceptedFileTypes,
  downloadFile,
  getFileWithSafeName,
  uploadListRender,
} from "utils/other/fileUtils";
import { parseHtml, useStore } from "utils";

interface Props {
  answer: UploadListProp[];
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport: (file: UploadListProp) => void;
  uploadAreaHidden?: boolean;
  subLabel: { upload?: string; uploaded?: string };
  multiple?: boolean;
}

export const UploadArea = ({
  answer,
  saveToReport,
  deleteFromReport,
  uploadAreaHidden = false,
  subLabel,
  multiple = true,
}: Props) => {
  const { report } = useStore();
  const { id, state, type: reportType } = report!;
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
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

  const hideUploadArea = () => {
    return !multiple && (answer.length > 0 || filesToUpload.length > 0);
  };

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
    if (hideUploadArea()) return;

    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file != null);

    if (files.length > 1 && !multiple) {
      setUploadErrors(["File is limited to 1"]);
    } else {
      setUploadErrors([]);
      filterFilesAndStartUpload(files);
    }
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
            {subLabel.upload && (
              <Text mb="spacer2">{parseHtml(subLabel.upload)}</Text>
            )}
            <Text sx={sx.uploadedLabel}>
              Select a {multiple ? "file or files" : "file"} to upload
            </Text>
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
            className={hideUploadArea() ? "disabled" : ""}
          >
            <span>
              Drag {multiple ? "files" : "file"} here or
              <label id="drop-zone">
                Choose from folder
                <input
                  type="file"
                  id="file-input"
                  multiple={multiple}
                  accept={acceptedFileTypes.join(",")}
                  onChange={onFileChange}
                  disabled={hideUploadArea()}
                />
              </label>
            </span>
          </Box>
          {uploadErrors.length > 0 && (
            <Box>
              {uploadErrors.map((error, index) => (
                <Text sx={sx.uploadErrorLabel} key={`upload-error-${index}`}>
                  {error}
                </Text>
              ))}
            </Box>
          )}

          <Text sx={sx.uploadedLabel}>
            Selected {multiple ? "Files" : "File"}
          </Text>
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
        <Text sx={sx.uploadedLabel}>
          Uploaded {multiple ? "Files" : "File"}
        </Text>
        {subLabel.uploaded && (
          <Text sx={sx.uploadedSubLabel}>{subLabel.uploaded}</Text>
        )}
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

    "&.disabled": {
      opacity: "0.4",
    },
  },
};
