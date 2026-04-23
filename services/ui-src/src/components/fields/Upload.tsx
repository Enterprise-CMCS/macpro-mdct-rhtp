import { Box, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ReportType, UploadListProp } from "@rhtp/shared";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/upload";
import {
  acceptedFileTypes,
  downloadFile,
  uploadListRender,
} from "utils/other/upload";

interface Props {
  id: string;
  state: string;
  reportType: ReportType;
  answer: UploadListProp[];
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport: (file: UploadListProp) => void;
  uploadAreaHidden?: boolean;
}

export const Upload = ({
  id,
  state,
  reportType,
  answer,
  saveToReport,
  deleteFromReport,
  uploadAreaHidden = false,
}: Props) => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>();

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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    /** TO DO: add filtering to upload only accepted file types */
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file != null);

    const prevFiles = filesToUpload ?? [];
    setFilesToUpload([...prevFiles, ...files]);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files;
      setFilesToUpload([...(filesToUpload ?? []), ...file]);
    }
  };

  const onUploadFiles = async () => {
    if (!state) {
      throw new Error("Undefined year or state parameter");
    }
    const files = filesToUpload ?? [];
    const savedFiles = [];
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const { presignedUploadUrl, fileId } =
        await recordFileInDatabaseAndGetUploadUrl(id, reportType, state, file);
      savedFiles.push({ name: file.name, fileId: fileId, size: file.size });
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
          <Text sx={sx.uploadedLabel}>Selected Files</Text>
          {uploadListRender(
            id,
            reportType,
            filesToUpload ?? [],
            state,
            deleteFromReport
          )}
        </>
      )}
      <div>
        <Text sx={sx.uploadedLabel}>Uploaded Files</Text>
        <Text sx={sx.uploadedSubLabel}>
          These files have been attached to the stage and checkpoint selected
          above.
        </Text>
      </div>
      {uploadListRender(
        id,
        reportType,
        answer ?? [],
        state,
        deleteFromReport,
        downloadFile
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
      color: "#0071bc",
      textDecoration: "underline",
      fontWeight: "700",
    },

    "#file-input": {
      display: "none",
    },
  },
};
