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
import { CommentModal } from "components/modals/CommentModal";
import { PageElementProps } from "components/report/Elements";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  AttachmentTableTemplate,
  InitiativePageTemplate,
  UploadListProp,
} from "types";
import { useStore } from "utils";
import { downloadFile, removeFile } from "utils/other/upload";
import { checkpointsList } from "verbiage/checkpoints";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { dropdownEmptyOption } from "../../constants";

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
  const displayValue = answer ?? [];
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();
  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >([]);
  const [stageOption, setStageOption] = useState<Options[]>([]);
  const [checkpointOption, setCheckpointOption] = useState<Options[]>([]);
  const [selection, setSelection] = useState<{
    stage: string;
    checkpoint: string;
  }>({ stage: "", checkpoint: "" });

  const [initiativeNumbers, setInitiativeNumbers] = useState<Options[]>([]);
  const [checkpointsArr, setCheckpointsArr] = useState<
    { id: string; label: string }[]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadListProp[]>([]);

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  useEffect(() => {
    const initiatives = (report?.pages.filter(
      (page) => "initiativeNumber" in page
    ) || []) as InitiativePageTemplate[];

    setInitiativeOptions(
      initiatives.map((initiative) => ({
        label: `${initiative.initiativeNumber}: ${initiative.title}`,
        value: initiative.id,
        checked: false,
      }))
    );
    setInitiativeNumbers(
      initiatives.map((initiative) => ({
        label: initiative.initiativeNumber,
        value: initiative.id,
      }))
    );
    setCheckpointsArr(checkpointsList.flatMap((list) => list.checkpoints));
  }, [report]);

  useEffect(() => {
    setStageOption([
      dropdownEmptyOption,
      ...checkpointsList.map((checks) => ({
        label: `${checks.stage} ${checks.label}`,
        value: checks.id,
      })),
    ]);
    setCheckpointOption([
      dropdownEmptyOption,
      ...checkpointsList[0].checkpoints
        .filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })),
    ]);
  }, []);

  const onChangeHandler = (event: DropdownChangeObject) => {
    const value = event.target.value;
    const checkpoints =
      checkpointsList
        .find((checks) => checks.id === value)
        ?.checkpoints.filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })) ?? [];

    setCheckpointOption([dropdownEmptyOption, ...checkpoints]);
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
    const formattedUploads = uploads.map((upload) => ({
      attachment: upload,
      initiatives: initiativeOptions
        .filter((options) => options.checked)
        .map((option) => option.value),
      stage: selection.stage,
      checkpoints: selection.checkpoint,
      status: "Under Review",
      comments: [],
    }));

    const newValues = [...displayValue, ...formattedUploads];
    props.updateElement({ answer: newValues });
    setUploadedFiles(uploads);
  };

  const removeAttachment = (file: UploadListProp, index: number) => {
    removeFile(file, year, state, () => {
      const newValue = [...displayValue];
      newValue.splice(index, 1);
      props.updateElement({ answer: newValue });
    });
  };

  const onEdit = () => {
    /** TODO: add editting in modal */
    setModalOpen(true);
  };

  return (
    <Stack width="100%" gap="1.5rem">
      <Button
        aria-label="Add Attachment"
        variant="outline"
        alignSelf="flex-start"
        onClick={() => setModalOpen(true)}
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
                    fontWeight="bold"
                  >
                    {row.attachment.name}
                  </Button>
                </Td>
                <Td>
                  {row.initiatives.length === 0
                    ? "N/A"
                    : row.initiatives
                        .map(
                          (id) =>
                            `#${initiativeNumbers.find((opt) => opt.value === id)?.label}`
                        )
                        .join(", ")}
                </Td>
                <Td>
                  {row.stage == ""
                    ? "N/A"
                    : stageOption.find((opt) => opt.value === row.stage)?.label}
                </Td>
                <Td>
                  {row.checkpoints == ""
                    ? "N/A"
                    : checkpointsArr.find(
                        (check) => check.id === row.checkpoints
                      )?.label}
                </Td>
                <Td>{row.status}</Td>
                <Td className="actions" display="flex" width="152px">
                  <Button variant="outline" onClick={() => onEdit()}>
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setCommentsOpen(true)}
                    minWidth="26px"
                  >
                    <Image src={commentIcon} alt="Comment" />
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => removeAttachment(row.attachment, rowIndex)}
                    aria-label={`Remove ${row.attachment.name}`}
                  >
                    <Image src={cancelIcon} alt="Remove" minWidth="24px" />
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
          onClose: () => {
            setModalOpen(false);
            setUploadedFiles([]);
          },
        }}
        state={state}
        year={year}
        answer={uploadedFiles}
        id={id}
        hint="[hint text]"
        selections={
          <Stack gap="1.5rem" marginTop="1.5rem">
            <ChoiceList
              choices={initiativeOptions}
              name={"initiative-choice-list"}
              type={"checkbox"}
              label={"Initiative"}
              onChange={onChoiceChangeHandler}
              hint={"This is the hint text"}
            ></ChoiceList>
            <Dropdown
              name={"stage"}
              label={"Stage"}
              value={selection?.stage}
              options={stageOption}
              onChange={onChangeHandler}
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
            ></Dropdown>
          </Stack>
        }
        saveToReport={saveToReport}
      ></UploadModal>
      <CommentModal
        modalDisclosure={{
          isOpen: isCommentsOpen,
          onClose: () => {
            setCommentsOpen(false);
          },
        }}
      />
    </Stack>
  );
};
