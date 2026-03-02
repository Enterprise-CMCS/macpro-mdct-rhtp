import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { AttachmentAreaTemplate, UploadData } from "types";
import {
  deleteUploadedFile,
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/upload";
import {
  acceptedFileTypes,
  downloadFile,
  retrieveUploadedFiles,
  UploadListProp,
  uploadListRender,
} from "utils/other/upload";

interface Props {
  state: string;
  year: string;
  answer: UploadData[];
  updatedElement: (updatedElement: Partial<AttachmentAreaTemplate>) => void;
}

export const Upload = ({ state, year, answer, updatedElement }: Props) => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>();

  useEffect(() => {
    if (filesToUpload && filesToUpload.length > 0) {
      const fetchData = async () =>
        await onUploadFiles().then(() => {
          retrieveUploadedFiles(year, state).then((response) => {
            setFilesToUpload([]);
            updatedElement({ answer: response });
          });
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

  const onRemove = async (file: UploadListProp) => {
    await deleteUploadedFile(year, state, file.fileId);
  };

  const onUploadFiles = async () => {
    if (!year || !state) {
      throw new Error("Undefined year or state parameter");
    }
    const files = filesToUpload ?? [];
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const presignedPostData = await recordFileInDatabaseAndGetUploadUrl(
        year,
        state,
        file
      );
      await uploadFileToS3(presignedPostData, file);
    }
  };

  return (
    <VStack sx={sx.container} gap="1rem" alignItems="flex-start">
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
      {uploadListRender(filesToUpload ?? [], year, state, onRemove)}
      <div>
        <Text sx={sx.uploadedLabel}>Uploaded Files</Text>
        <Text sx={sx.uploadedSubLabel}>
          These files have been attached to the stage and checkpoint selected
          above.
        </Text>
      </div>
      {uploadListRender(answer ?? [], year, state, onRemove, downloadFile)}
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
