import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import { Amplify } from "aws-amplify";
import config from "config";
import "aws-amplify/auth/enable-oauth-listener";
import { UserProvider } from "utils";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import { App, Error } from "components";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "styles/theme";
import "./styles/index.scss";

const apiRestConfig = {
  rhtp: {
    endpoint: config.apiGateway.URL,
    region: config.apiGateway.REGION,
  },
};

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolClientId: config.cognito.APP_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: config.cognito.APP_CLIENT_DOMAIN,
            redirectSignIn: [config.cognito.REDIRECT_SIGNIN],
            redirectSignOut: [config.cognito.REDIRECT_SIGNOUT],
            scopes: ["email", "openid", "profile"],
            responseType: "code",
          },
        },
      },
    },
    API: {
      REST: {
        ...apiRestConfig,
      },
    },
  },
  {
    API: {
      REST: {
        // We can re-enable retries for specific endpoints if/when appropriate.
        // See: https://docs.amplify.aws/react/frontend/rest-api/fetch-data/
        retryStrategy: { strategy: "no-retry" },
      },
    },
  }
);
// LaunchDarkly configuration
const ldClientId = config.REACT_APP_LD_SDK_CLIENT;
(async () => {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: ldClientId!,
    options: {
      baseUrl: "https://clientsdk.launchdarkly.us",
      streamUrl: "https://clientstream.launchdarkly.us",
      eventsUrl: "https://events.launchdarkly.us",
    },
    deferInitialization: false,
    timeout: 2, // seconds
  });

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary FallbackComponent={Error}>
      <Router>
        <ChakraProvider theme={theme}>
          <LDProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </LDProvider>
        </ChakraProvider>
      </Router>
    </ErrorBoundary>
  );
})().catch((error) => {
  throw error;
});
