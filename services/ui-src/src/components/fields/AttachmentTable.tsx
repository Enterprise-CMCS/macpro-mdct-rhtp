import {
  Button,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
} from "@chakra-ui/react";
import {
  ChoiceList,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { UploadModal } from "components/modals/UploadModal";
import { PageElementProps } from "components/report/Elements";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  AttachmentTableTemplate,
  InitiativePageTemplate,
  UploadListProp,
  AttachmentTableAnswerItem,
  AlertTypes,
} from "types";
import { useStore } from "utils";
import { downloadFile, removeFile } from "utils/other/upload";
import { checkpointsList } from "verbiage/checkpoints";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { Alert } from "components";

const header = [
  "Attachment name",
  "Initiatives",
  "Stage",
  "Checkpoints",
  "Status",
  "Actions",
];

type Options = { label: string; value: string; checked?: boolean };

export const AttachmentTable = (
  props: PageElementProps<AttachmentTableTemplate>
) => {
  const { id, answer } = props.element;
  const displayValue = structuredClone(answer) ?? [];
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  const initiatives = (report?.pages.filter(
    (page) => "initiativeNumber" in page
  ) || []) as InitiativePageTemplate[];
  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >([]);

  const [stageOption, setStageOption] = useState<Options[]>([]);
  const [checkpointOption, setCheckpointOption] = useState<Options[]>([]);

  const initialValues = {
    stage: "",
    checkpoint: "",
  };
  const [selection, setSelection] = useState<{
    stage: string;
    checkpoint: string;
  }>(initialValues);

  const [checkpointsArr, setCheckpointsArr] = useState<
    { id: string; label: string }[]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadListProp[]>([]);

  const [modalMode, setModalMode] = useState<"Upload" | "Edit" | "Delete">("Upload");
  const actionButtonText = {
    "Upload": "Done",
    "Edit": "Save",
    "Delete": "Delete"
  }
  const modalHeading = {
    "Upload": "Upload Initiative Attachments",
    "Edit": "Edit Attachment",
    "Delete": "Delete Attachment"
  }

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  useEffect(() => {
    setInitiativeOptions(
      initiatives.map((initiative) => ({
        label: `${initiative.initiativeNumber}: ${initiative.title}`,
        value: initiative.id,
        checked: false,
      }))
    );
    setStageOption([
      { label: "- Select an option -", value: "" },
      ...checkpointsList.map((checks) => ({
        label: `${checks.stage} ${checks.label}`,
        value: checks.id,
      })),
    ]);
    setCheckpointsArr(checkpointsList.flatMap((list) => list.checkpoints));
  }, [report]);

  useEffect(() => {
    const checkpoints =
      checkpointsList
        .find((checks) => checks.id === selection.stage)
        ?.checkpoints.filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })) ?? [];
    setCheckpointOption([
      { label: "- Select an option -", value: "" },
      ...checkpoints,
    ]);
  }, [selection]);

  const onStageChangeHandler = (event: DropdownChangeObject) => {
    const value = event.target.value;

    setSelection({ stage: value, checkpoint: "" });
  };

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
  };

  const saveToReport = (uploads: UploadListProp[]) => {
    console.log("SAVE TO REPORT", uploads);
    const formattedUploads = uploads.map((upload) => ({
      attachment: upload,
      initiatives: [],
      stage: "",
      checkpoints: "",
      status: "Under Review",
      comments: [],
    }));
    console.log("formatted uploads", formattedUploads);

    const newValues = [...displayValue, ...formattedUploads];
    console.log('new values', newValues);
    props.updateElement({ answer: newValues });
    setUploadedFiles([...uploadedFiles, ...uploads]);
  };

  const removeAttachment = (file: UploadListProp) => {
    const newValue = displayValue.filter(
      (item) => item.attachment.fileId !== file.fileId
    );
    props.updateElement({ answer: newValue });
    removeFile(file, year, state, () => {
      return;
    });
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
      stage: selection.stage,
      checkpoints: selection.checkpoint,
      status: "Under Review",
      comments: [],
    }));

    const newValues = displayValue.map(item => {
      const updatedItem = formattedUploadsToSave.find(upload => upload.attachment.fileId === item.attachment.fileId);
      return updatedItem || item;
    });

    props.updateElement({ answer: newValues });
    onClose();
  }

  const onAddClick = () => {
    setModalMode("Upload");
    setModalOpen(true);
    setSelection(initialValues);
    setUploadedFiles([]);
  };

  const onEditClick = (selectedFile: AttachmentTableAnswerItem) => {
    console.log('SELECTED FILE', selectedFile);
    setModalMode("Edit");
    setModalOpen(true);

    setSelection({
      stage: selectedFile.stage ?? "",
      checkpoint: selectedFile.checkpoints ?? "",
    });
    setUploadedFiles([selectedFile.attachment]);

    const initiativeChoices = initiativeOptions.map((option) => ({
      ...option,
      checked: selectedFile.initiatives.includes(option.value),
    }));
    setInitiativeOptions(initiativeChoices);
  };

  const onDeleteClick = (selectedFile: AttachmentTableAnswerItem) => {
    setModalMode("Delete");
    setModalOpen(true);

    setSelection({
      stage: selectedFile.stage ?? "",
      checkpoint: selectedFile.checkpoints ?? "",
    });
    setUploadedFiles([selectedFile.attachment]);

    const initiativeChoices = initiativeOptions.map((option) => ({
      ...option,
      checked: selectedFile.initiatives.includes(option.value),
    }));
    setInitiativeOptions(initiativeChoices);
  }

  const onClose = () => {
    setModalOpen(false);
    setSelection(initialValues);
    setUploadedFiles([]);
  }

  return (
    <Stack width="100%" gap="1.5rem">
      <Button
        aria-label="Add Attachment"
        variant="outline"
        alignSelf="flex-start"
        onClick={() => onAddClick()}
      >
        Add Attachment
      </Button>
      {displayValue.length === 0 ? (
        <p>No attachments found. Click 'Add Attachment' to get started</p>
      ) : (
        <Table variant="initiative" width="800px">
          <Thead>
            <Tr>
              {header.map((item) => (
                <Th>{item}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {displayValue.map((row, rowIndex) => (
              <Tr>
                <Td>
                  <Button
                    variant="link"
                    onClick={() => downloadFile(year, state, row.attachment)}
                  >
                    {row.attachment.name}
                  </Button>
                </Td>
                <Td>
                  {row.initiatives.length === 0
                    ? ""
                    : `Initiatives ${row.initiatives.map((id) => `#${initiatives.find((opt) => opt.id === id)?.initiativeNumber}`).join(", ")}`}
                </Td>
                <Td>
                  {row.stage
                    ? stageOption.find((opt) => opt.value === row.stage)?.label
                    : ""}
                </Td>
                <Td>
                  {row.checkpoints
                    ? checkpointsArr.find(
                      (check) => check.id === row.checkpoints
                    )?.label
                    : ""}
                </Td>
                <Td>{row.status}</Td>
                <Td className="actions" display="flex">
                  <Button variant="outline" onClick={() => onEditClick(row)}>
                    Edit
                  </Button>
                  <Button variant="link">
                    <Image src={commentIcon} alt="Comment" />
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => onDeleteClick(row)}
                    aria-label={`Remove ${row.attachment.name}`}
                  >
                    <Image src={cancelIcon} alt="Remove" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onClose,
        }}
        state={state}
        year={year}
        answer={uploadedFiles}
        id={id}
        hint="[hint text]"
        selections={
          <Stack gap="1.5rem" marginTop="1.5rem">
            {modalMode === "Delete" ? (
              <Alert status={AlertTypes.WARNING} title="Warning">
                Deleting attachment will remove it from all initiatives, stages and checkpoints below.
              </Alert>
            ) : null}
            <ChoiceList
              choices={initiativeOptions}
              name={"initiative-choice-list"}
              type={"checkbox"}
              label={"Initiative"}
              onChange={onChoiceChangeHandler}
              hint={"This is the hint text"}
              disabled={modalMode === "Delete"}
            ></ChoiceList>
            <Dropdown
              name={"stage"}
              label={"Stage"}
              value={selection?.stage}
              options={stageOption}
              onChange={onStageChangeHandler}
              disabled={modalMode === "Delete"}
            ></Dropdown>
            <Dropdown
              name={"checkpoint"}
              label={"Checkpoint #"}
              options={checkpointOption}
              value={selection?.checkpoint}
              onChange={(dropdown) => {
                const value = dropdown.target.value;
                setSelection({ ...selection, checkpoint: value });
              }}
              disabled={modalMode === "Delete"}
            ></Dropdown>
          </Stack>
        }
        saveToReport={saveToReport}
        onModalSubmit={onModalSubmit}
        actionButtonText={actionButtonText[modalMode]}
        modalHeading={modalHeading[modalMode]}
      ></UploadModal>
    </Stack>
  );
};
