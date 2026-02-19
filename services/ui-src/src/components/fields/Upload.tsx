import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/other/fileApi";

export const Upload = () => {
  const [_isDragOver, setIsDragOver] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>();
  const { state, year } = useParams();

  const acceptedFileTypes = [
    ".ppt",
    ".pdf",
    ".doc",
    ".docx",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    //filter to only accepted file types
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

  const onRemove = (index: number) => {
    if (!filesToUpload) return;

    const files = [...filesToUpload];
    files.splice(index, 1);
    setFilesToUpload(files);
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
        file,
      );

      await uploadFileToS3(presignedPostData, file);
    }
  };

  return (
    <Box sx={sx.container}>
      <Text sx={sx.uploadedLabel}>Select a file or files to upload</Text>
      <Box
        sx={sx.uploadBox}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <span>
          Drag & drop files or
          <label id="drop-zone">
            Browse
            <input
              type="file"
              id="file-input"
              multiple
              accept={acceptedFileTypes.join(",")}
              onChange={onFileChange}
            />
          </label>
        </span>
        <span> Supported formats: JPEG, PNG, PDF, CSV, Word, PPT</span>
      </Box>
      <Text sx={sx.uploadedLabel}>Selected Files</Text>
      <ul>
        {filesToUpload?.map((file, fileIdx) => (
          <li>
            {file?.name}{" "}
            <Button variant="unstyled" onClick={() => onRemove(fileIdx)}>
              x
            </Button>
          </li>
        ))}
      </ul>
      <Text sx={sx.uploadedLabel}>Uploaded Files</Text>
      <Box sx={sx.containerButtons}>
        <Button onClick={onUploadFiles}>Upload Files</Button>
        <Button variant="link">Cancel</Button>
      </Box>
    </Box>
  );
};

const sx = {
  container: {
    h2: {
      margin: "1.5rem 0",
      fontWeight: "700",
    },

    ul: {
      padding: "0",
      margin: "0",
    },
    li: {
      display: "flex",
      justifyContent: "space-between",
      listStyle: "none",
      width: "100%",
      border: "1px solid #0071bc",
      padding: ".5rem",
      borderRadius: "6px",

      button: {
        width: "content",
        height: "auto",
        color: "red",
      },
    },
  },

  containerButtons: {
    margin: "2rem 0",
    button: {
      marginRight: "2rem",
    },
  },

  uploadedLabel: {
    marginBottom: ".75rem",
    fontWeight: "600",
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
