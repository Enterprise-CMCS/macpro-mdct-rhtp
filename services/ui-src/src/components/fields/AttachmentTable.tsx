import { Button, Stack, Image, HStack, Text } from "@chakra-ui/react";
import { ChoiceList, Dropdown } from "@cmsgov/design-system";
import { UploadModal } from "components/modals/UploadModal";
import { CommentModal } from "components/modals/CommentModal";
import { PageElementProps } from "components/report/Elements";
import { JSX, useEffect, useState } from "react";
import {
  AttachmentTableTemplate,
  InitiativePageTemplate,
  UploadListProp,
  AlertTypes,
  InitiativeAnswerProp,
  AttachmentStatus,
  dropdownEmptyOption,
} from "@rhtp/shared";
import { useStore } from "utils";
import {
  downloadFile,
  removeFile,
  canEditAttachment,
  canDeleteAttachment,
} from "utils/other/fileUtils";
import {
  checkpointAttachableOptions,
  checkpointList,
  getStageIdByCheckpointId,
  stageList,
} from "verbiage/checkpoints";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { Alert } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";

export const AttachmentTable = (
  props: PageElementProps<AttachmentTableTemplate>
) => {
  const { disabled } = props;
  const { answer } = props.element;
  const displayValue = structuredClone(answer) ?? [];
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const { report } = useStore();
  const { id, state, type: reportType } = report!;

  const initiatives = (report?.pages.filter(
    (page) => "initiativeNumber" in page
  ) || []) as InitiativePageTemplate[];
  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >([]);
  const stageOption = [
    dropdownEmptyOption,
    ...stageList.map((checks) => ({
      label: `${checks.stage} ${checks.label}`,
      value: checks.id,
    })),
  ];
  const [checkpoint, setCheckpoint] = useState("");
  const [tableRows, setTableRows] = useState<
    (string | JSX.Element | undefined)[][]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadListProp[]>([]);
  const [modalMode, setModalMode] = useState<"Upload" | "Edit" | "Delete">(
    "Upload"
  );
  const actionButtonText = {
    Upload: "Done",
    Edit: "Save",
    Delete: "Delete",
  };
  const modalHeading = {
    Upload: "Upload Initiative Attachments",
    Edit: "Edit Attachment",
    Delete: "Delete Attachment",
  };

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
    if (modalMode === "Delete") {
      removeAttachment(uploadedFiles[0]);
      return onClose();
    }

    const formattedUploadsToSave = uploadedFiles.map((upload) => ({
      attachment: upload,
      initiatives: initiativeOptions
        .filter((options) => options.checked)
        .map((option) => option.value),
      stage: getStageIdByCheckpointId(checkpoint),
      checkpoint,
      status: AttachmentStatus.PENDING_REVIEW,
      comments:
        displayValue.find((item) => item.attachment.fileId === upload.fileId)
          ?.comments ?? [],
    }));

    const newValues = displayValue.map((item) => {
      const updatedItem = formattedUploadsToSave.find(
        (upload) => upload.attachment.fileId === item.attachment.fileId
      );
      return updatedItem || item;
    });

    props.updateElement({ answer: newValues });
    onClose();
  };

  const onAddClick = () => {
    setModalMode("Upload");
    setModalOpen(true);
    setCheckpoint("");
    setUploadedFiles([]);
    setInitiativeOptions(
      initiatives.map((initiative) => ({
        label: `${initiative.initiativeNumber}: ${initiative.title}`,
        value: initiative.id,
        checked: false,
      }))
    );
  };

  const setCurrentValues = (selectedFile: InitiativeAnswerProp) => {
    setCheckpoint(selectedFile.checkpoint ?? "");
    setUploadedFiles([selectedFile.attachment]);

    const initiativeOptions = initiatives.map((initiative) => ({
      label: `${initiative.initiativeNumber}: ${initiative.title}`,
      value: initiative.id,
      checked: selectedFile.initiatives.includes(initiative.id),
    }));

    setInitiativeOptions(initiativeOptions);
  };

  const onEditClick = (selectedFile: InitiativeAnswerProp) => {
    setModalMode("Edit");
    setModalOpen(true);

    setCurrentValues(selectedFile);
  };

  const onCommentClick = (selectedFile: InitiativeAnswerProp) => {
    setCommentsOpen(true);
    setCurrentValues(selectedFile);
  };

  const onDeleteClick = (selectedFile: InitiativeAnswerProp) => {
    setModalMode("Delete");
    setModalOpen(true);

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
      const columnStage =
        row.stage == undefined || !("stage" in row)
          ? "N/A"
          : stageOption.find(({ value }) => value === row.stage)?.label;
      const columnCheckpoint =
        row.checkpoint == ""
          ? "N/A"
          : checkpointList.find(({ id }) => id === row.checkpoint)?.label;
      const columnActions = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => onEditClick(row)}
            aria-label={`Edit file or info for ${row.attachment.name}`}
            disabled={!canEditAttachment(row.status) || disabled}
          >
            Edit
          </Button>
          <Button
            variant="link"
            onClick={() => onCommentClick(row)}
            aria-label={`Comment on ${row.attachment.name}`}
          >
            <Image src={commentIcon} alt="Comment" minWidth="26px" />
          </Button>
          <Button
            variant="link"
            onClick={() => onDeleteClick(row)}
            aria-label={`Delete ${row.attachment.name}`}
            disabled={
              !canDeleteAttachment(row.status, row.comments) || disabled
            }
          >
            <Image src={cancelIcon} alt="Remove" minWidth="24px" />
          </Button>
        </HStack>
      );

      return [
        columnAttachmentName,
        columnInitiatives,
        columnStage,
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
        case "Stage":
          const stageLabel = stageOption.find(
            (opt) => opt.value === answer.stage
          )?.label;
          return stageLabel ?? "";
        case "Checkpoint":
          const checkpointLabel = checkpointList.find(
            ({ id }) => id === answer.checkpoint
          )?.label;
          return checkpointLabel ?? "";
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
          { label: "Stage", sortable: true },
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
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onClose,
        }}
        answer={uploadedFiles}
        selections={
          <Stack gap="1.5rem" marginTop="1.5rem">
            {modalMode === "Delete" ? (
              <Alert status={AlertTypes.WARNING} title="Warning">
                Deleting this attachment will remove it from all initiatives,
                stages, and checkpoints below.
              </Alert>
            ) : null}
            <ChoiceList
              choices={initiativeOptions}
              name={"initiative-choice-list"}
              type={"checkbox"}
              label={"Which initiative does this attachment apply to?"}
              onChange={onChoiceChangeHandler}
              disabled={modalMode === "Delete" || disabled}
            />
            <Dropdown
              name={"checkpoint"}
              label={"Which stage/checkpoint does this attachment apply to?"}
              options={checkpointAttachableOptions}
              value={checkpoint}
              onChange={(event) => setCheckpoint(event.target.value)}
              disabled={modalMode === "Delete" || isStageEnabled()}
            />
          </Stack>
        }
        saveToReport={saveToReport}
        onModalSubmit={onModalSubmit}
        actionButtonText={actionButtonText[modalMode]}
        modalHeading={modalHeading[modalMode]}
        deleteFromReport={removeAttachment}
        uploadAreaHidden={modalMode !== "Upload"}
        uploadedSubLabel={
          "These files have been attached to the stage and checkpoint selected above."
        }
      />
      <CommentModal
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
