import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { uploadToBucket } from "utils/other/upload";

export const Upload = () => {
  const [_isDragOver, setIsDragOver] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>();
  const { state } = useParams();

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
    const files = filesToUpload ?? [];
    await uploadToBucket(files, state!);
  };

  return (
    <Box sx={sx.container}>
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
      <Heading>Uploading</Heading>
      <Text sx={sx.uploadedLabel}>Uploaded</Text>
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
      <Box sx={sx.containerButtons}>
        <Button onClick={onUploadFiles}>Upload Files</Button>
        <Button variant="link">Cancel</Button>
      </Box>
    </Box>
  );
};

const sx = {
  container: {
    border: "1px solid black",
    padding: "2rem",
    margin: "4rem",

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
