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
  SkipNav,
} from "components";
import { Container, Divider, Flex, Heading, Stack } from "@chakra-ui/react";
import { ErrorBoundary } from "react-error-boundary";
import {
  getTabTitle,
  makeMediaQueryClasses,
  UserContext,
  useStore,
} from "utils";
import { currentPageSelector } from "utils/state/selectors";
//TODO: remove data set app routes
import { AppRoutes as DataSetAppRoutes } from "dataSet/component/app/AppRoutes";
import { Header as DataSetHeader } from "dataSet/component/layout/Header";
import { Footer as DataSetFooter } from "dataSet/component/layout/Footer";

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
    //setting tab title for each page
    document.title = getTabTitle(pathname, currentPage);
  }, [pathname, currentPage]);

  const routeToDataSet = true;

  //TO DO: Remove when data set domain it set up
  const dataSetAuthenticatedRoutes = () => {
    return (
      user && (
        <Flex sx={sx.appLayout}>
          <SkipNav />
          <Timeout />
          {!isExportPage && <DataSetHeader handleLogout={logout} />}
          <Container sx={sx.appContainer}>
            <ErrorBoundary FallbackComponent={Error}>
              <DataSetAppRoutes />
            </ErrorBoundary>
          </Container>
          <DataSetFooter />
        </Flex>
      )
    );
  };

  const defaultRoutes = () => {
    return (
      user && (
        <Flex sx={sx.appLayout}>
          <SkipNav />
          <Timeout />
          {!isExportPage && <Header handleLogout={logout} />}
          <Container sx={sx.appContainer}>
            <ErrorBoundary FallbackComponent={Error}>
              <AppRoutes />
            </ErrorBoundary>
          </Container>
          <Footer />
        </Flex>
      )
    );
  };

  const authenticatedRoutes = (
    <>
      {routeToDataSet ? dataSetAuthenticatedRoutes() : defaultRoutes()}
      {!user && showLocalLogins && (
        <>
          <SkipNav />
          <main id="main-content" tabIndex={-1} style={sx.loginMain}>
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
        </>
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
  loginMain: {
    display: "block",
  },
};
