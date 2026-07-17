import { Button, Stack, Image, HStack, Text } from "@chakra-ui/react";
import { ChoiceList, Dropdown } from "@cmsgov/design-system";
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
  PageStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import {
  downloadFile,
  removeFile,
  canEditAttachment,
} from "utils/other/fileUtils";
import {
  checkpointAttachableOptions,
  checkpointList,
  getStageIdByCheckpointId,
} from "verbiage/checkpoints";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { ManageDrawer } from "components/drawers/ManageDrawer";

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
  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >([]);
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

  const onChoiceChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const choices = [...initiativeOptions];
    const choiceIndex = initiativeOptions.findIndex(
      (option) => option.value === value
    );
    choices[choiceIndex].checked = !choices[choiceIndex].checked;
    setInitiativeOptions(choices);

    //if no checkbox is checked, we want to reset any options selected into the stage and checkpoint
    if (choices.every((choice) => !choice.checked)) {
      setCheckpoint("");
    }
  };

  const saveToReport = (uploads: UploadListProp[]) => {
    const formattedUploads = uploads.map((upload) => ({
      attachment: upload,
      initiatives: [],
      stage: "",
      checkpoint: "",
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

  const onModalSubmit = () => {
    const formattedUploadsToSave = uploadedFiles.map((upload) => ({
      attachment: upload,
      initiatives: initiativeOptions
        .filter((options) => options.checked)
        .map((option) => option.value),
      stage: getStageIdByCheckpointId(checkpoint),
      checkpoint,
      status: AttachmentStatus.PENDING_REVIEW,
    }));

    const newValues = displayValue.map((item) => {
      const updatedItem = formattedUploadsToSave.find(
        (upload) => upload.attachment.fileId === item.attachment.fileId
      );
      if (updatedItem) {
        return {
          ...item,
          ...updatedItem,
        };
      } else {
        return item;
      }
    });

    props.updateElement({ answer: newValues });
    onClose();
  };

  const getInitiativeOptions = (selectedFile?: InitiativeAnswerProp) => {
    return initiatives.map(({ id, initiativeNumber, status, title }) => {
      const isAbandoned = status === PageStatus.ABANDONED;
      const isChecked = selectedFile?.initiatives?.includes(id);
      return {
        label: `${initiativeNumber}: ${title}${isAbandoned ? " (abandoned)" : ""}`,
        value: id,
        checked: !!isChecked,
        disabled: isAbandoned,
      };
    });
  };

  const onAddClick = () => {
    setModalOpen(true);
    setCheckpoint("");
    setUploadedFiles([]);
    setInitiativeOptions(getInitiativeOptions());
  };

  const setCurrentValues = (selectedFile: InitiativeAnswerProp) => {
    setCheckpoint(selectedFile.checkpoint ?? "");
    setUploadedFiles([selectedFile.attachment]);
    setInitiativeOptions(getInitiativeOptions(selectedFile));
  };

  const onManagedClick = (selectedFile: InitiativeAnswerProp) => {
    setManageOpen(true);
    setCurrentValues(selectedFile);
  };

  const onCommentClick = (selectedFile: InitiativeAnswerProp) => {
    setCommentsOpen(true);
    setCurrentValues(selectedFile);
  };

  const onClose = () => {
    setModalOpen(false);
    setCheckpoint("");
    setUploadedFiles([]);
  };

  const isStageEnabled = () => {
    return initiativeOptions.every((option) => option.checked != true);
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
            onClick={() => onManagedClick(row)}
            aria-label={`Edit file or info for ${row.attachment.name}`}
            disabled={!canEditAttachment(row.status) || disabled}
          >
            Manage
          </Button>
          <Button
            variant="link"
            onClick={() => onCommentClick(row)}
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
    const filteredValues = sortedValues.reduce(
      (prev: InitiativeAnswerProp[][], curr) => {
        if (
          curr.initiatives.length === 0 &&
          (curr.stage == "" || curr.stage == undefined)
        )
          prev[0].push(curr);
        else if (
          curr.initiatives.length > 0 &&
          (curr.stage == "" || curr.stage == undefined)
        )
          prev[1].push(curr);
        else prev[2].push(curr);

        return prev;
      },
      [[], [], []]
    );

    setTableRows(rows(filteredValues.flat()));
  };

  const getNotification = () => {
    const checkedInit = initiativeOptions
      .filter((opt) => opt.checked)
      .map((opt) => opt.label.split(":")[0])
      .join(", ");
    const check = getCheckpointDisplayName({ checkpoint: checkpoint });

    const instruction = !checkpoint
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

  const selections = () => {
    return (
      <Stack gap="1.5rem">
        <ChoiceList
          choices={initiativeOptions}
          name={"initiative-choice-list"}
          type={"checkbox"}
          label={"Which initiative does this attachment apply to?"}
          onChange={onChoiceChangeHandler}
          disabled={disabled}
        />
        <Dropdown
          name={"checkpoint"}
          label={"Which stage/checkpoint does this attachment apply to?"}
          options={checkpointAttachableOptions}
          value={checkpoint}
          onChange={(event) => setCheckpoint(event.target.value)}
          disabled={isStageEnabled()}
        />
      </Stack>
    );
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
        selections={selections()}
        saveToReport={saveToReport}
        onModalSubmit={onModalSubmit}
        actionButtonText={"Done"}
        modalHeading="Upload Initiative Attachments"
        deleteFromReport={removeAttachment}
        disabled={!checkpoint}
        notification={getNotification()}
      />
      <ManageDrawer
        modalDisclosure={{
          isOpen: isManageOpen,
          onClose: () => {
            setManageOpen(false);
          },
        }}
        content={selections()}
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
