import { Stack } from "@chakra-ui/react";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { useState } from "react";
import { UploadListProp } from "types";

export const UploadModal = ({
  modalDisclosure,
  id,
  year,
  state,
  dropdowns,
  answer,
  saveToReport,
  onChangeExpanded,
}: Props) => {
  const [values, setDropdownValues] = useState<string[]>(
    dropdowns?.map((dropdown) => dropdown.options[0]?.value) ?? []
  );

  const onChange = (change: DropdownChangeObject, index: number) => {
    const newValues = [...values];
    newValues[index] = change.target.value;

    //if their are multiple dropdowns, we want the value of the last dropdown
    if (onChangeExpanded) {
      onChangeExpanded(newValues[newValues.length - 1]);
    }
    setDropdownValues(newValues);
  };

  const saveToModal = (uploads: UploadListProp[]) => {
    saveToReport(uploads, values);
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      onConfirmHandler={() => modalDisclosure.onClose()}
      content={{
        heading: "Upload Attachments",
        subheading: undefined,
        actionButtonText: "Done",
        closeButtonText: undefined,
      }}
    >
      <Stack gap="1.5rem">
        {dropdowns?.map((dropdown, index) => (
          <Dropdown
            name={dropdown.label}
            label={dropdown.label}
            value={values[index]}
            options={dropdown.options}
            onChange={(change) => onChange(change, index)}
          ></Dropdown>
        ))}
        <Upload
          id={id}
          year={year}
          state={state}
          answer={answer}
          saveToReport={saveToModal}
        />
      </Stack>
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  id: string;
  year: string;
  state: string;
  answer: UploadListProp[];
  dropdowns?: { label: string; options: { label: string; value: string }[] }[];
  onChangeExpanded?: (change: string) => void;
  saveToReport: (uploads: UploadListProp[], options: string[]) => void;
}
