import {
  Button,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  ChoiceList,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { UploadModal } from "components/modals/UploadModal";
import { PageElementProps } from "components/report/Elements";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AttachmentTableTemplate,
  InitiativePageTemplate,
  UploadListProp,
} from "types";
import { useStore } from "utils";
import { retrieveUploadedFiles } from "utils/other/upload";
import { checkpointsList } from "verbiage/checkpoints";

const header = [
  "Attachment name",
  "Initiatives",
  "Stage",
  "Checkpoints",
  "Status",
  "Actions",
];

export const AttachmentTable = (
  props: PageElementProps<AttachmentTableTemplate>
) => {
  const { id, answer } = props.element;
  const displayValue = answer ?? [];
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadListProp[]>([]);
  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();
  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >([]);
  const [stageOption, setStageOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [checkpointOption, setCheckpointOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [selection, setSelection] = useState<{
    stage: string;
    checkpoint: string;
  }>({ stage: "", checkpoint: "" });

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
  }, [report]);

  useEffect(() => {
    retrieveUploadedFiles(year, state, id).then((response) => {
      console.log("response", response);
      setFiles(response);
    });
    setStageOption(
      checkpointsList.map((checks) => ({
        label: `${checks.stage} ${checks.label}`,
        value: checks.id,
      }))
    );
    setCheckpointOption(
      checkpointsList[0].checkpoints
        .filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id }))
    );
    setSelection({
      stage: checkpointsList[0].id,
      checkpoint: checkpointsList[0].checkpoints[0].id,
    });
  }, []);

  const onChangeHandler = (event: DropdownChangeObject) => {
    const value = event.target.value;
    const checkpoints =
      checkpointsList
        .find((checks) => checks.id === value)
        ?.checkpoints.filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })) ?? [];

    setCheckpointOption(checkpoints);
    setSelection({ stage: value, checkpoint: checkpoints[0].value });
    console.log(initiativeOptions);
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
    console.log(uploads);
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
      <Table variant="metric">
        <Thead>
          <Tr>
            {header.map((item) => (
              <Th>{item}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {displayValue.map((row) => (
            <Tr>
              <Td>
                <Button variant="link">{row.attachment.name}</Button>
              </Td>
              <Td>{row.initiatives.join(" ")}</Td>
              <Td>{row.stage}</Td>
              <Td>{row.checkpoints}</Td>
              <Td>{row.status}</Td>
              <Td>
                <Button variant="outline">Edit</Button>
                <Button variant="link">message</Button>
                <Button variant="link">cancel</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        state={state}
        year={year}
        answer={files}
        id={id}
        selections={
          <Stack gap="1.5rem">
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
    </Stack>
  );
};
