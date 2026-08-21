import { useContext, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import {
  AppRoutes,
  Error,
  Header,
  LoginCognito,
  LoginIDM,
  PostLogoutRedirect,
  Footer,
  Timeout,
} from "components";
import { Container, Divider, Flex, Heading, Stack } from "@chakra-ui/react";
import { ErrorBoundary } from "react-error-boundary";
import { makeMediaQueryClasses, UserContext, useStore } from "utils";
import { currentPageSelector } from "utils/state/selectors";
import { ElementType } from "@rhtp/shared";

export const App = () => {
  const mqClasses = makeMediaQueryClasses();
  const context = useContext(UserContext);
  const { logout } = context;
  const { user, showLocalLogins, setSidebar } = useStore();
  const { pathname } = useLocation();
  const currentPage = useStore(currentPageSelector);

  //there are now two export pages due to the addition of the obligated and spent funds export zip
  const isExportPage = pathname !== "/export" && pathname.includes("/export");

  useEffect(() => {
    if (mqClasses.includes("sidebarwide")) {
      setSidebar(false);
    } else if (mqClasses === "desktop") {
      setSidebar(true);
    }
  }, [mqClasses]);

  // on app load, check for clicked link pathname
  useEffect(() => {
    localStorage.setItem("ReturnURL", pathname);
  }, []);

  useEffect(() => {
    const titleMap = {
      "/": "Rural Health Transformation Program",
      "/help": "How can we help you? - RHTP",
      "/profile": "My Account - RHTP",
      "/export": "Export RHTP Files and Data - RHTP",
      "/admin": "Banner Admin - RHTP",
    };

    //this is a fail safe if we are missing a title map options, but it can't be default as it clashes with any loading text on the page
    const findByHeader = () => {
      const target =
        document.querySelector("h1") ?? document.querySelector("#main-content");
      return target?.textContent;
    };

    //if there's a title tied to a path, use that, else try to find it by the heading on the page
    const title = titleMap[pathname as keyof typeof titleMap] ?? findByHeader();
    const header = currentPage?.elements?.find(
      (element) => element.type === ElementType.Header
    ) ?? { text: "" };

    document.title = title ?? `${header.text} - RHTP`;
  }, [pathname, currentPage]);

  const authenticatedRoutes = (
    <>
      {user && (
        <Flex sx={sx.appLayout}>
          <Timeout />
          {!isExportPage && <Header handleLogout={logout} />}
          <Container sx={sx.appContainer}>
            <ErrorBoundary FallbackComponent={Error}>
              <AppRoutes />
            </ErrorBoundary>
          </Container>
          <Footer />
        </Flex>
      )}
      {!user && showLocalLogins && (
        <main>
          <Container sx={sx.appContainer}>
            <Heading as="h1" fontSize="heading_3xl" variant="login">
              RHTP
            </Heading>
          </Container>
          <Container sx={sx.loginContainer}>
            <Stack spacing={8}>
              <LoginIDM />
              <Divider />
              <LoginCognito />
            </Stack>
          </Container>
        </main>
      )}
    </>
  );

  return (
    <div id="app-wrapper" className={mqClasses}>
      <Routes>
        <Route path="*" element={authenticatedRoutes} />
        <Route path="postLogout" element={<PostLogoutRedirect />} />
      </Routes>
    </div>
  );
};

const sx = {
  appLayout: {
    minHeight: "100vh",
    flexDirection: "column",
  },
  appContainer: {
    display: "flex",
    maxW: "appMax",
    flex: "1 0 auto",
    padding: "0rem",
    section: {
      padding: "0rem 2rem",
    },
    ".mobile &": {
      section: {
        padding: "1rem",
      },
    },
  },
  loginContainer: {
    maxWidth: "25rem",
    height: "full",
    marginY: "auto",
  },
};
