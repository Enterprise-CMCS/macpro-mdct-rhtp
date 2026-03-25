import {
  Box,
  Button,
  Stack,
  Table,
  Tbody,
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
import { AttachmentTableTemplate, InitiativePageTemplate } from "types";
import { useStore } from "utils";
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
  const { id } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  useEffect(() => {
    const initiatives = (report?.pages.filter(
      (page) => "initiativeNumber" in page
    ) || []) as InitiativePageTemplate[];
    setInitiatives(initiatives);
  }, [report]);

  const initiativeChoices = initiatives.map((initiative) => ({
    label: `${initiative.initiativeNumber}: ${initiative.title}`,
    value: initiative.id,
  }));

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  const stages = checkpointsList.map((checks) => ({
    label: `${checks.stage} ${checks.label}`,
    value: checks.id,
  }));
  let checkpoints = checkpointsList
    .find((checks) => checks.id === stages[0].value)
    ?.checkpoints.filter((checks) => checks.attachable)
    .map((check) => ({ label: check.label, value: check.id }));

  const [selection, setSelection] = useState<{
    stage: string;
    checkpoint: string;
  }>({ stage: stages[0].value, checkpoint: checkpoints![0].value });

  const onChangeHandler = (event: DropdownChangeObject) => {
    const value = event.target.value;
    setSelection({ ...selection, stage: value });
    checkpoints = checkpointsList
      .find((checks) => checks.id === value)
      ?.checkpoints.filter((checks) => checks.attachable)
      .map((check) => ({ label: check.label, value: check.id }));
  };

  const saveToReport = () => {};

  return (
    <Stack width="100%">
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
        <Tbody></Tbody>
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
        answer={[]}
        id={id}
        selections={
          <Stack gap="1.5rem">
            <Box>
              Initiative
              <ChoiceList
                choices={initiativeChoices}
                name={""}
                type={"checkbox"}
                label={undefined}
              ></ChoiceList>
            </Box>
            <Dropdown
              name={"stage"}
              label={"Stage"}
              value={selection.stage}
              options={stages}
              onChange={onChangeHandler}
            ></Dropdown>
            <Dropdown
              name={"checkpoint"}
              label={"Checkpoint #"}
              options={checkpoints!}
              value={selection.checkpoint}
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
