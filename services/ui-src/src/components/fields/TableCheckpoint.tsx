import {
  Stack,
  Button,
  Checkbox,
  Image,
  Flex,
  Heading,
} from "@chakra-ui/react";
import {
  AttachmentStatus,
  ElementType,
  InitiativeAnswerProp,
  TableCheckpointTemplate,
  UploadListProp,
  InitiativePageTemplate,
  PageStatus,
} from "@rhtp/shared";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { Label } from "@cmsgov/design-system";
import { useContext, useEffect, useState } from "react";
import { UploadDrawer } from "components/drawers/UploadDrawer";
import { useParams } from "react-router";
import { useStore } from "utils";
import {
  canEditAttachment,
  downloadFile,
  removeFile,
} from "utils/other/fileUtils";
import {
  checkpointList,
  getCheckpointLabel,
  getStageIdByCheckpointId,
  stageList,
} from "verbiage/checkpoints";
import { ReportAutosaveContext } from "components/report/ReportAutosaveProvider";
import { PageElementProps } from "components/report/Elements";
import { setAnswerInElement } from "utils/state/reportLogic/reportActions";
import { attachmentTableId } from "../../constants";
import { AttachmentCommentDrawer } from "components/drawers/AttachmentCommentDrawer";
import { ResponsiveTable } from "components/tables/ResponsiveTable";
import { ManageDrawer } from "components/drawers/ManageDrawer";
import { StageCheckpointDropdown } from "./attachments/StageCheckpointDropdown";

type TableShape = {
  stage: number;
  label: string;
  checkpoints: {
    id: string;
    checkpointNumber: string;
    label: string;
    attachable: boolean;
  }[];
  rows: {
    id: string;
    stageNo: string;
    label: string;
    file: UploadListProp;
    status: AttachmentStatus;
    canDelete: boolean;
  }[];
};

/** Formatting the the data from the elements into renderable rows for the table */
const buildRows = (
  values: {
    label: string;
    id: string;
    checkpointNumber: string;
    attachments:
      | {
          file: UploadListProp;
          status: AttachmentStatus;
          canDelete: boolean;
        }[]
      | undefined;
  }[]
) => {
  return values.reduce((prev: any[], curr) => {
    const { id, checkpointNumber, label, attachments } = curr;
    const row = {
      id,
      stageNo: checkpointNumber,
      label,
    };
    if (attachments) {
      const copy = [...attachments];
      const { file, status, canDelete } = copy.shift() || {};
      prev.push({
        ...row,
        file: file ?? {},
        status: status ?? "",
        canDelete: canDelete ?? true,
      });
      copy.forEach(({ file, status, canDelete }) =>
        prev.push({
          id,
          stageNo: "",
          label: "",
          completed: undefined,
          file,
          status,
          canDelete: canDelete ?? true,
        })
      );
    } else {
      prev.push(row);
    }
    return prev;
  }, []);
};

const buildTables = (answers: InitiativeAnswerProp[]) => {
  return stageList.map((list) => {
    const { stage, label, checkpoints, id } = list;
    const values = checkpoints.map((checkpoint) => {
      const files = answers
        .filter(
          (answer) => answer.stage === id && answer.checkpoint === checkpoint.id
        )
        .map((upload) => ({
          file: upload.attachment,
          status: upload.status,
          canDelete: upload.canDelete,
        }));
      return {
        label: checkpoint.label,
        id: checkpoint.id,
        attachments: checkpoint.attachable ? files : undefined,
        checkpointNumber: checkpoint.checkpointNumber,
      };
    });
    const rows = buildRows(values);
    return { stage, label, checkpoints, rows };
  });
};

const getFilesFromTable = (tables: TableShape[], checkpoint: string) => {
  return tables
    .flatMap((tables) => tables.rows)
    .filter((row) => row.id === checkpoint && row.file.fileId)
    .map((filter) => filter.file);
};

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  const { disabled: formDisabled } = props;
  const { answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [isManageOpen, setManageOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadListProp[]>([]);
  const { pageId } = useParams();
  const { report, setAnswers } = useStore();
  const initiative = report?.pages.find(
    (page) => page.id === pageId
  ) as InitiativePageTemplate;
  const disabled = formDisabled || initiative?.status === PageStatus.ABANDONED;
  const { id, state, type: reportType } = report!;
  const { autosave } = useContext(ReportAutosaveContext);
  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue =
    answer ??
    checkpointList.map((checkpoint) => ({
      id: checkpoint.id,
      checked: false,
    }));
  const [tables, setTables] = useState<TableShape[]>([]);
  const [checkpoint, _setCheckpoint] = useState("");
  const [attachments, setAttachments] = useState<InitiativeAnswerProp[]>([]);

  if (!state || !id || !reportType || !pageId) {
    console.error(
      "Can't retrieve uploads with missing state, report id, type, or page id"
    );
    return;
  }

  //Updates when the report has been updated, so when a file has been added or removed from the table
  //when isCommentsOpen is closed, we want to reload the report to update the status in the table
  useEffect(() => {
    const attachments = report?.pages
      .flatMap((page) => page.elements)
      .find((element) => element?.type === ElementType.AttachmentTable)?.answer;

    const files =
      attachments?.filter((data) => data.initiatives.includes(pageId)) ?? [];

    const newTables = buildTables(files);
    setAttachments(attachments || []);
    setTables(newTables);

    //setSelectedFiles shouldn't update when the comment modal is opened
    if (!isCommentsOpen)
      setSelectedFiles(getFilesFromTable(newTables, checkpoint));
  }, [isCommentsOpen, report]);

  const onCheckboxHandler = (id: string) => {
    const newValue = [...initialDisplayValue];
    const checkbox = newValue.find((value) => value.id === id);
    if (checkbox) checkbox.checked = !checkbox.checked;
    props.updateElement({ answer: newValue });
  };

  const formatUploads = (uploads: UploadListProp[]) => {
    return uploads.map((file) => ({
      initiatives: [pageId],
      stage: getStageIdByCheckpointId(checkpoint),
      checkpoint,
      comments: [],
      attachment: file,
      status: AttachmentStatus.PENDING_REVIEW,
      canDelete: true,
    }));
  };

  const deleteFromReport = (file: UploadListProp) => {
    handleFileAddDelete(file.fileId);
    removeFile(reportType, state, id, file);
  };

  const onCommentClick = (file: UploadListProp) => {
    setSelectedFiles([file]);
    setCommentsOpen(true);
  };

  const onAddClick = () => {
    setModalOpen(true);
  };

  const onManageClick = (selectedFiles: UploadListProp) => {
    setManageOpen(true);
    setSelectedFiles([selectedFiles]);
  };

  const handleCommentSave = (data: { answer: InitiativeAnswerProp[] }) => {
    writeToAttachmentsTable(() => data.answer);
  };

  const writeToAttachmentsTable = (generateAnswer: (answer: any) => any) => {
    if (!report) return;
    setAnswerInElement<InitiativeAnswerProp[]>(
      report,
      "initiative-attachments",
      attachmentTableId,
      generateAnswer,
      setAnswers
    );
    autosave();
  };

  const handleFileAddDelete = (newValue: UploadListProp[] | string) => {
    //the type of element being passed in determines whether it's an add or remove
    const generateAnswer = (answer: InitiativeAnswerProp[]) => {
      //if it's a string, we're removing a file
      if (typeof newValue === "string") {
        const newAnswer = answer.filter(
          (item) => item.attachment.fileId !== newValue
        );
        return [...newAnswer];
      } else {
        return [...answer, ...formatUploads(newValue)];
      }
    };
    writeToAttachmentsTable(generateAnswer);
  };

  const onModalSubmit = () => {
    //the type of element being passed in determines whether it's an add or remove
    const generateAnswer = (answer: InitiativeAnswerProp[]) => {
      const selectedIndex = answer.findIndex(
        (file) => file.attachment.fileId === selectedFiles[0].fileId
      );
      const newAnswers = [...answer];
      newAnswers[selectedIndex].stage = getStageIdByCheckpointId(checkpoint);
      newAnswers[selectedIndex].checkpoint = checkpoint;
      return newAnswers;
    };
    writeToAttachmentsTable(generateAnswer);
    setModalOpen(false);
  };

  const getRows = (
    rows: {
      id: string;
      stageNo: string;
      label: string;
      file: UploadListProp;
      status: AttachmentStatus;
      canDelete: boolean;
    }[]
  ) => {
    return rows.map((row) => {
      const columnCheckbox =
        row.label != "" ? (
          <Checkbox
            aria-label={`Check if ${row.label} is complete`}
            isChecked={
              initialDisplayValue.find((value) => value.id === row.id)?.checked
            }
            onChange={() => onCheckboxHandler(row.id)}
            disabled={disabled}
            sx={sx.checkbox}
          />
        ) : (
          ""
        );

      const columnFile =
        "file" in row ? (
          <Button
            aria-label={`Download ${row.file.name}`}
            variant="link"
            onClick={() => downloadFile(reportType, state, id, row.file)}
          >
            {row.file.name}
          </Button>
        ) : (
          "Not applicable"
        );

      const columnActions = "file" in row && row.file.fileId && (
        <Flex gap=".5rem">
          <Button
            variant="outline"
            onClick={() => onManageClick(row.file)}
            aria-label={`Edit file or info for ${row.file.name}`}
            disabled={!canEditAttachment(row.status) || disabled}
          >
            Manage
          </Button>
          <Button
            variant="link"
            onClick={() => onCommentClick(row.file)}
            aria-label={`Comment on ${row.file.name}`}
            fontWeight="bold"
            disabled={disabled}
          >
            <Image src={commentIcon} alt="Remove" minWidth="24px" />
          </Button>
        </Flex>
      );

      return [
        row.stageNo,
        row.label,
        columnCheckbox,
        columnFile,
        row.status,
        columnActions,
      ];
    });
  };

  const header = [
    { label: "#" },
    { label: "Checkpoint" },
    { label: "Ready for CMS Review" },
    { label: "Attachments" },
    { label: "Status" },
    { label: "Actions" },
  ];

  //This generates the zebra styling for the table rows when multiple files are tied to a shared checkpoint
  const buildStyle = (
    rows: {
      id: string;
      stageNo: string;
      label: string;
      file: UploadListProp;
      status: AttachmentStatus;
      canDelete: boolean;
    }[]
  ) => {
    const styling = ["white"];
    for (var i = 1; i < rows.length; i++) {
      const prevColor = styling.at(-1)!;
      const nextColor = prevColor == "white" ? "grey" : "white";
      styling.push(rows[i].stageNo == "" ? prevColor : nextColor);
    }
    return styling;
  };

  return (
    <Stack gap="1.25rem" width="100%">
      {tables.map((table, tableIndex) => (
        <Stack key={`checkpoint-${tableIndex}`} gap="1.25rem">
          <Label>{`Stage ${table.stage}: ${table.label}`}</Label>
          <Button
            aria-label="Upload attachments"
            variant="outline"
            alignSelf="flex-start"
            leftIcon={<Image src={disabled ? addGray : addIconPrimary} />}
            onClick={onAddClick}
            disabled={disabled}
          >
            Upload attachments
          </Button>
          {ResponsiveTable(
            header,
            getRows(table.rows),
            "metric",
            () => {},
            buildStyle(table.rows)
          )}
        </Stack>
      ))}
      <UploadDrawer
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => setModalOpen(false),
        }}
        answer={selectedFiles}
        selections={<StageCheckpointDropdown onDropdownHandler={() => {}} />}
        saveToReport={handleFileAddDelete}
        deleteFromReport={deleteFromReport}
        actionButtonText={"Done"}
        modalHeading={"Upload Initiative Attachments"}
        notification={{ success: getCheckpointLabel(checkpoint) }}
        onModalSubmit={onModalSubmit}
      />
      {selectedFiles[0] && (
        <ManageDrawer
          modalDisclosure={{
            isOpen: isManageOpen,
            onClose: () => {
              setManageOpen(false);
            },
          }}
          onModalDelete={() => {
            deleteFromReport(selectedFiles[0]);
            setManageOpen(false);
          }}
          answer={selectedFiles[0]}
          files={attachments}
          updateElement={props.updateElement}
        ></ManageDrawer>
      )}
      <AttachmentCommentDrawer
        modalDisclosure={{
          isOpen: isCommentsOpen,
          onClose: () => {
            setCommentsOpen(false);
          },
        }}
        updateElement={handleCommentSave}
        selectedFile={selectedFiles[0]}
        allFiles={attachments}
      />
    </Stack>
  );
};

const sx = {
  checkbox: {
    marginBlock: "0",
    span: {
      width: "24px",
      height: "24px",
      border: "2px solid black",
    },
  },
};

export const TableCheckpointExport = (
  element: TableCheckpointTemplate & { initId: string }
) => {
  const { report } = useStore();
  const { answer, initId } = element;

  if (!initId) return;

  const attachments = report?.pages
    .flatMap((page) => page.elements)
    .find((element) => element?.type === ElementType.AttachmentTable)?.answer;

  const files =
    attachments?.filter((data) => data.initiatives.includes(initId)) ?? [];

  const data = buildTables(files);

  const buildRows = (table: {
    stage: number;
    label: string;
    checkpoints: {
      id: string;
      checkpointNumber: string;
      label: string;
      attachable: boolean;
    }[];
    rows: any[];
  }) => {
    return table.rows.map((row) => {
      const readyForCMS = answer?.find((value) => value.id === row.id)?.checked
        ? "Yes"
        : "No";
      return [
        row.stageNo,
        row.label,
        readyForCMS,
        "file" in row ? (row?.file?.name ?? "No attachment") : "Not applicable",
        row.status,
      ];
    });
  };

  return (
    <Stack gap="2em" key={element.id}>
      {data.map((item) => (
        <Stack gap="2rem" key={item.label}>
          <Heading as="h4" fontSize="16px" fontWeight="bold">
            Stage {item.stage}: {item.label}
          </Heading>
          {ResponsiveTable(
            [
              { label: "#" },
              { label: "Checkpoint" },
              { label: "Ready for CMS Review" },
              { label: "Attachments" },
              { label: "Status" },
            ],
            buildRows(item),
            "pdf",
            () => {},
            item.rows.map((_row, index) =>
              item.rows.at(index + 1) && item.rows.at(index + 1).stageNo == ""
                ? "borderless"
                : ""
            )
          )}
        </Stack>
      ))}
    </Stack>
  );
};
