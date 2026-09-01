import { ChangeEvent, useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Banner, Drawer } from "components";
import {
  Dropdown as CmsdsDropdown,
  TextField as CmsdsTextField,
  SingleInputDateField as CmsdsDateField,
} from "@cmsgov/design-system";
import { ErrorMessages } from "../../constants";
import { optionalTag, parseAsLocalDate, parseMMDDYYYY, useStore } from "utils";
import {
  BannerArea,
  bannerAreaOptions,
  BannerAreas,
  BannerFormData,
  BannerShape,
} from "@rhtp/shared";
import { isUrl } from "utils/validation/inputValidation";

const initialFormValues: BannerFormData = {
  area: BannerAreas.Home,
  title: "",
  description: "",
  link: "",
  startDate: "",
  endDate: "",
};
const untouchedState = {
  area: true, // This starts at a valid value ("home")
  title: false,
  description: false,
  link: false,
  startDate: false,
  endDate: false,
};
const noErrorState = {
  area: "",
  title: "",
  description: "",
  link: "",
  startDate: "",
  endDate: "",
};

export const AdminBannerDrawer = ({
  data,
  content,
  onSubmit,
  modalDisclosure,
}: Props) => {
  //used to check for date conflict with other banners, filtered so it doesn't check against itself
  const allBanners = useStore((state) => state.allBanners).filter(
    (banner) => banner.key !== data?.key
  );

  const [formData, setFormData] = useState(data ?? initialFormValues);
  const [touchedState, setTouchedState] = useState(untouchedState);
  const [formErrors, setFormErrors] = useState(noErrorState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(data ?? initialFormValues);
    setFormErrors(noErrorState);
  }, [data]);

  const onChange = (evt: {
    target: { name: string; value: string; maskedValue?: string };
  }) => {
    const newFormData = { ...formData, [evt.target.name]: evt.target.value };
    setFormData(newFormData);

    const touched = { ...touchedState, [evt.target.name]: true };
    setTouchedState(touched);

    const newFormErrors = { ...noErrorState };

    if (touched.title && !newFormData.title) {
      newFormErrors.title = ErrorMessages.requiredResponse;
    }

    if (touched.description && !newFormData.description) {
      newFormErrors.description = ErrorMessages.requiredResponse;
    }

    if (touched.link && newFormData.link && !isUrl(newFormData.link)) {
      newFormErrors.link = "Response must be a valid hyperlink/URL";
    }

    const parsedStartDate = parseMMDDYYYY(
      evt.target.name === "startDate"
        ? evt.target.maskedValue!
        : newFormData.startDate
    );

    if (touched.startDate) {
      if (!newFormData.startDate) {
        newFormErrors.startDate = ErrorMessages.requiredResponse;
      } else if (parsedStartDate === undefined) {
        newFormErrors.startDate =
          "Start date is invalid. Please enter date in MM/DD/YYYY format";
      } else {
        const conflictingBanner = findConflictingBanner(
          allBanners,
          newFormData.area,
          parsedStartDate
        );
        if (conflictingBanner) {
          newFormErrors.startDate = `Start date conflicts with existing banner: ${conflictingBanner.title}`;
        }
      }
    }

    const parsedEndDate = parseMMDDYYYY(
      evt.target.name === "endDate"
        ? evt.target.maskedValue!
        : newFormData.endDate
    );
    if (touched.endDate) {
      if (!newFormData.endDate) {
        newFormErrors.endDate = ErrorMessages.requiredResponse;
      } else if (parsedEndDate === undefined) {
        newFormErrors.endDate =
          "End date is invalid. Please enter date in MM/DD/YYYY format";
      } else if (parsedStartDate && parsedEndDate < parsedStartDate) {
        newFormErrors.endDate = ErrorMessages.endDateBeforeStartDate;
      } else {
        const conflictingBanner = findConflictingBanner(
          allBanners,
          newFormData.area,
          parsedEndDate
        );
        if (conflictingBanner) {
          newFormErrors.endDate = `End date conflicts with existing banner: ${conflictingBanner.title}`;
        }
      }
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      !newFormErrors.startDate &&
      !newFormErrors.endDate
    ) {
      const conflictingBanner = findConflictingBanner(
        allBanners,
        newFormData.area,
        parsedStartDate,
        parsedEndDate
      );
      if (conflictingBanner) {
        newFormErrors.endDate = `This date range conflicts with existing banner: ${conflictingBanner.title}`;
      }
    }

    setFormErrors(newFormErrors);
  };

  // The CmsdsDateField change event has a different shape than other inputs,
  // so we wrangle it into a standard shape with these custom handlers.
  const onStartDateChange = (rawValue: string, maskedValue: string) => {
    onChange({ target: { name: "startDate", value: rawValue, maskedValue } });
  };
  const onEndDateChange = (rawValue: string, maskedValue: string) => {
    onChange({ target: { name: "endDate", value: rawValue, maskedValue } });
  };

  const onBlur = (evt: ChangeEvent<HTMLInputElement>) => {
    // This check ensures an error appears when the user clicks into,
    // and then clicks out of, an empty field.
    const { name, value } = evt.target;
    const required = evt.target.dataset.required === "true";
    if (required && !value) {
      setFormErrors({ ...formErrors, [name]: ErrorMessages.requiredResponse });
    }
    setTouchedState({ ...touchedState, [name]: true });
  };

  const onConfirmHandler = async () => {
    // This check ensures errors appear when the user clicks submit,
    // without first having clicked any of the required input fields.
    const newErrors = structuredClone(formErrors);
    for (let key of ["title", "description", "startDate", "endDate"] as const) {
      if (!formErrors[key] && !formData[key]) {
        newErrors[key] = ErrorMessages.requiredResponse;
      }
    }
    setFormErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((message) => !!message);
    if (hasErrors) {
      return;
    }

    setSubmitting(true);
    await onSubmit(formData);
    window.scrollTo(0, 0);
    setFormData(initialFormValues);
    setTouchedState(untouchedState);
    setFormErrors(noErrorState);

    setSubmitting(false);
  };

  const hintText = () => {
    return (
      <>
        Formatting is supported with these HTML tags: &lt;strong&gt;,
        &lt;em&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;.
      </>
    );
  };

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      content={content}
      onConfirmHandler={onConfirmHandler}
      onOutlineHandler={() => {
        modalDisclosure.onClose();
      }}
      submitting={submitting}
      disableConfirm={submitting}
    >
      <Flex gap="1.5rem" flexDir="column">
        <CmsdsDropdown
          name="area"
          label="Site area"
          onChange={onChange}
          onBlur={onBlur}
          options={bannerAreaOptions}
          value={formData.area}
          errorMessage={formErrors.area}
        />
        <CmsdsTextField
          name="title"
          label="Title"
          onChange={onChange}
          onBlur={onBlur}
          value={formData.title}
          errorMessage={formErrors.title}
          data-required="true"
        />
        <CmsdsTextField
          name="description"
          label="Description"
          hint={hintText()}
          onChange={onChange}
          onBlur={onBlur}
          value={formData.description}
          errorMessage={formErrors.description}
          multiline
          rows={3}
          data-required="true"
        />
        <CmsdsTextField
          name="link"
          label={optionalTag({ label: "Link", required: false })}
          onChange={onChange}
          onBlur={onBlur}
          value={formData.link}
          errorMessage={formErrors.link}
          data-required="false"
        />
        <CmsdsDateField
          name="startDate"
          label="Start date"
          onChange={onStartDateChange}
          onBlur={onBlur}
          value={formData.startDate}
          errorMessage={formErrors.startDate}
          data-required="true"
        />
        <CmsdsDateField
          name="endDate"
          label="End date"
          onChange={onEndDateChange}
          onBlur={onBlur}
          value={formData.endDate}
          errorMessage={formErrors.endDate}
          data-required="true"
        />
        <Banner
          title={formData.title || "New banner title"}
          description={formData.description || "New banner description"}
          link={formData.link}
        />
      </Flex>
    </Drawer>
  );
};

/**
 * @param allBanners Every banner that currently exists in the database
 * @param area The area just selected by the user
 * @param dateA A date (start or end) just entered by the user
 * @param dateB Another date just entered by the user.
 *              If present, this is the endDate, and dateA is the startDate.
 */
export const findConflictingBanner = (
  allBanners: BannerShape[],
  area: BannerArea,
  dateA: Date,
  dateB?: Date
) => {
  return allBanners.find((banner) => {
    const start = parseAsLocalDate(banner.startDate);
    const end = parseAsLocalDate(banner.endDate);
    if (banner.area !== area) {
      return false;
    } else if (start <= dateA && dateA <= end) {
      // This banner's range contains date A
      return true;
    } else if (!dateB) {
      // We're only checking for one end of the new range
      return false;
    } else if (start <= dateB && dateB <= end) {
      // This banner's range contains date B
      return true;
    } else if (dateA <= start && end <= dateB) {
      // The new range completely covers this banner's range
      return true;
    } else {
      return false;
    }
  });
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  content: {
    heading: string;
    subheading?: string;
    solidButtonText: string;
    outlineButtonText: string;
  };
  onSubmit: (data: BannerFormData) => Promise<void>;
  data?: BannerFormData;
}
