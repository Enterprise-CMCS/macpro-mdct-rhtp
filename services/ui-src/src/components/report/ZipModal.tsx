import { ModalBody, ModalFooter, Button } from "@chakra-ui/react";

export const ZipModal = (
  onClose: (modalOpen: boolean) => void,
  onSubmit: () => Promise<void>
) => {
  const submitHandler = async () => {
    await onSubmit();
  };

  const content = (
    <div>
      <p>
        This ZIP file includes all Initiative Checkpoint attachments except
        those with a status of “Informational” or “Archived”.
      </p>
      <br />
      <p>
        Once the download starts, you can safely navigate away from this page;
        it will continue running in the background. If this ZIP contains large
        files, the download time will vary depending on your internet speed.
      </p>
      <br />
      <p>Do not refresh your browser until the download is complete.</p>
    </div>
  );

  return (
    <>
      <ModalBody>{content}</ModalBody>
      <ModalFooter gap="4">
        <Button colorScheme="blue" mr={3} onClick={() => submitHandler()}>
          ZIP Files
        </Button>
        <Button variant="link" onClick={() => onClose(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
};
