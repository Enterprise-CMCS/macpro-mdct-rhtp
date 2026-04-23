import { Alert } from "components";
import { BannerData } from "@rhtp/shared";

export const Banner = ({ bannerData }: Props) => {
  if (bannerData) {
    const { title, description, link } = bannerData;
    return (
      bannerData && (
        <Alert title={title} link={link}>
          {description}
        </Alert>
      )
    );
  } else return <></>;
};

interface Props {
  bannerData: BannerData | undefined;
}
