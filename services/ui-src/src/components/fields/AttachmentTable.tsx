import { Button, Stack, Image, HStack, Text } from "@chakra-ui/react";
import { UploadDrawer } from "components/drawers/UploadDrawer";
import { AttachmentCommentDrawer } from "components/drawers/AttachmentCommentDrawer";
import { PageElementProps } from "components/report/Elements";
import { JSX, useEffect, useState } from "react";
import {
  AttachmentTableTemplate,
  InitiativePageTemplate,
  UploadListProp,
  AlertTypes,
  InitiativeAnswerProp,
  AttachmentStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import { downloadFile, removeFile } from "utils/other/fileUtils";
import { checkpointList } from "verbiage/checkpoints";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { ManageDrawer } from "components/drawers/ManageDrawer";
import { StageCheckpointDropdown } from "./attachments/StageCheckpointDropdown";

export const AttachmentTable = (
  props: PageElementProps<AttachmentTableTemplate>
) => {
  const { disabled } = props;
  const { answer } = props.element;
  const displayValue = structuredClone(answer) ?? [];
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [isManageOpen, setManageOpen] = useState<boolean>(false);
  const { report } = useStore();
  const { id, state, type: reportType } = report!;

  const initiatives = (report?.pages.filter(
    (page) => "initiativeNumber" in page
  ) || []) as InitiativePageTemplate[];
  const [initiativeOptions, setInitiativeOptions] = useState<string[]>([]);
  const [checkpoint, setCheckpoint] = useState("");
  const [tableRows, setTableRows] = useState<
    (string | JSX.Element | undefined)[][]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadListProp[]>([]);

  if (!state || !id || !reportType) {
    console.error("Can't retrieve uploads with missing state, id or type");
    return;
  }

  useEffect(() => {
    //set initial sort to filter unfilled initiatives from filled initiatives
    sortRows("", SORT_TYPE.DEFAULT);
  }, [report]);

  const saveToReport = (uploads: UploadListProp[]) => {
    const formattedUploads = uploads.map((upload) => ({
      attachment: upload,
      initiatives: initiativeOptions,
      checkpoint: checkpoint,
      status: AttachmentStatus.PENDING_REVIEW,
      comments: [],
      canDelete: true,
    }));

    const newValues = [...displayValue, ...formattedUploads];

    props.updateElement({ answer: newValues });
    setUploadedFiles([...uploadedFiles, ...uploads]);
  };

  const removeAttachment = (file: UploadListProp) => {
    const newUploadedFiles = uploadedFiles.filter(
      (upload) => upload.fileId !== file.fileId
    );
    setUploadedFiles(newUploadedFiles);

    const newAnswerValue = displayValue.filter(
      (item) => item.attachment.fileId !== file.fileId
    );
    props.updateElement({ answer: newAnswerValue });
    removeFile(reportType, state, id, file);
  };

  const onDrawerClick = (type: string, selectedFile: InitiativeAnswerProp) => {
    switch (type) {
      case "MANAGE":
        setManageOpen(true);
        break;
      case "COMMENT":
        setCommentsOpen(true);
        break;
      default:
        onClose();
    }
    setUploadedFiles([selectedFile.attachment]);
  };

  const onAddClick = () => {
    setModalOpen(true);
    setUploadedFiles([]);
  };

  const setInitativeAndCheckpoint = (
    initatives: string[],
    checkpoint: string
  ) => {
    setInitiativeOptions(initatives);
    setCheckpoint(checkpoint);
  };

  const onClose = () => {
    setModalOpen(false);
    setUploadedFiles([]);
    setInitiativeOptions([]);
    setCheckpoint("");
  };

  const getCheckpointDisplayName = (
    answer: { checkpoint: string } | InitiativeAnswerProp
  ) => {
    const checkpoint = checkpointList.find(
      ({ id }) => id === answer.checkpoint
    );
    return checkpoint
      ? `${checkpoint.checkpointNumber} ${checkpoint.label}`
      : "";
  };

  const rows = (values: InitiativeAnswerProp[]) => {
    return values.map((row) => {
      const columnAttachmentName = (
        <Button
          variant="link"
          onClick={() => downloadFile(reportType, state, id, row.attachment)}
          fontWeight="bold"
        >
          {row.attachment.name}
        </Button>
      );
      const columnInitiatives =
        row.initiatives.length === 0
          ? "N/A"
          : row.initiatives
              .map(
                (id) =>
                  `#${initiatives.find((opt) => opt.id === id)?.initiativeNumber}`
              )
              .join(", ");
      const columnCheckpoint =
        row.checkpoint == "" ? "N/A" : getCheckpointDisplayName(row);
      const columnActions = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => onDrawerClick("MANAGE", row)}
            aria-label={`Manage file or info for ${row.attachment.name}`}
            disabled={disabled}
          >
            Manage
          </Button>
          <Button
            variant="link"
            onClick={() => onDrawerClick("COMMENT", row)}
            aria-label={`Comment on ${row.attachment.name}`}
            fontWeight="bold"
            disabled={disabled}
          >
            <Image src={commentIcon} alt="Remove" minWidth="24px" />
          </Button>
        </HStack>
      );

      return [
        columnAttachmentName,
        columnInitiatives,
        columnCheckpoint,
        row.status,
        columnActions,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: InitiativeAnswerProp, type: string) => {
      switch (type) {
        case "Attachment name":
          return answer.attachment.name;
        case "Initiatives":
          const initNumber = initiatives.find(
            (opt) => opt.id === answer.initiatives[0]
          )?.initiativeNumber;
          return initNumber ?? "";
        case "Checkpoint":
          return getCheckpointDisplayName(answer);
        case "Status":
          return answer.status;
        default:
          return "";
      }
    };

    const runSort = (arr: InitiativeAnswerProp[]) => {
      return type == SORT_TYPE.DEFAULT
        ? arr
        : arr.toSorted((a, b) => {
            const valueA = getValue(a, row);
            const valueB = getValue(b, row);
            if (type === SORT_TYPE.DESCENDING) {
              return valueA < valueB ? -1 : 1;
            } else {
              return valueB < valueA ? -1 : 1;
            }
          });
    };

    const sortedValues = runSort(displayValue);
    setTableRows(rows(sortedValues));
  };

  const getNotification = () => {
    const checkedInit = initiativeOptions
      .map(
        (opt) =>
          initiatives.find((initative) => initative.id === opt)
            ?.initiativeNumber
      )
      .join(", ");

    const check = getCheckpointDisplayName({ checkpoint: checkpoint });

    const instruction =
      initiativeOptions.length === 0 || !checkpoint
        ? {
            type: AlertTypes.WARNING,
            text: "Select initiative and checkpoint to enable upload.",
          }
        : {
            type: AlertTypes.INFO,
            text: `Attaching to: Initiatives(s): ${checkedInit}; ${check}`,
          };

    return {
      instruction: instruction,
      success: `Initiatives(s): ${checkedInit}; ${check}`,
    };
  };

  return (
    <Stack width="100%" gap="1.5rem">
      <Button
        aria-label="Add Attachment"
        variant="outline"
        alignSelf="flex-start"
        leftIcon={
          <Image src={disabled ? addGray : addPrimary} alt="Add icon" />
        }
        onClick={onAddClick}
        disabled={disabled}
      >
        Add Attachment
      </Button>
      {ResponsiveTable(
        [
          { label: "Attachment name", sortable: true },
          { label: "Initiatives", sortable: true },
          { label: "Checkpoint", sortable: true },
          { label: "Status", sortable: true },
          { label: "Actions" },
        ],
        tableRows,
        "",
        sortRows
      )}
      {tableRows.length === 0 && (
        <Text variant="tableEmpty">
          No attachments found. Select “Add Attachment” to get started.
        </Text>
      )}
      <UploadDrawer
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onClose,
        }}
        answer={uploadedFiles}
        selections={
          <StageCheckpointDropdown
            onDropdownHandler={setInitativeAndCheckpoint}
          />
        }
        saveToReport={saveToReport}
        actionButtonText={"Done"}
        modalHeading="Upload Initiative Attachments"
        deleteFromReport={removeAttachment}
        disabled={initiativeOptions.length === 0 || !checkpoint}
        notification={getNotification()}
      />
      <ManageDrawer
        modalDisclosure={{
          isOpen: isManageOpen,
          onClose: () => {
            setManageOpen(false);
          },
        }}
        onModalDelete={() => {
          removeAttachment(uploadedFiles[0]);
          setManageOpen(false);
        }}
        answer={uploadedFiles[0]}
        files={displayValue}
        updateElement={props.updateElement}
      ></ManageDrawer>
      <AttachmentCommentDrawer
        modalDisclosure={{
          isOpen: isCommentsOpen,
          onClose: () => {
            setCommentsOpen(false);
          },
        }}
        selectedFile={uploadedFiles[0]}
        updateElement={props.updateElement}
        allFiles={displayValue}
      />
    </Stack>
  );
};
