import { Web3Provider } from "ethers/providers";
import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ErrorBoundary, theme } from "request-ui";

import { CssBaseline, makeStyles, ThemeProvider } from "@material-ui/core";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";

import { RequestAppBar } from "./components/AppBar";
import CreatePage from "./containers/CreatePage";
import ErrorPage from "./containers/ErrorPage";
import NotFoundPage from "./containers/NotFoundPage";
import RequestPage from "./containers/RequestPage";
import DashboardPage from "./containers/DashboardPage";
import { useEagerConnect } from "./hooks/useEagerConnect";
import { useInactiveListener } from "./hooks/useInactiveListnerer";
import { useConnectedUser, UserProvider } from "./contexts/UserContext";
import { injected } from "./connectors";

const useStyles = makeStyles(() => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "calc(100% - 80px)",
    maxWidth: "100vw",
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const tried = useEagerConnect();
  useInactiveListener(!tried);
  const { account, activate, chainId } = useWeb3React();
  const { name, loading } = useConnectedUser();

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RequestAppBar
          network={chainId}
          loading={loading}
          account={name || account}
          connect={() => activate(injected)}
        />
        <div className={classes.paper}>
          <Switch>
            <Route path="/" exact>
              <Redirect to="/create" />
            </Route>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/create" component={CreatePage} />
            <Route path="/:id([0-9a-fA-F]+)" component={RequestPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default () => {
  return (
    <ErrorBoundary
      stackdriverErrorReporterApiKey="AIzaSyDhj4acOHHIsUsKyISqHv2j7Pqzdu0FjTk"
      projectId="request-240714"
      service="RequestApp"
      component={ErrorPage}
    >
      <Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
        <UserProvider>
          <App />
        </UserProvider>
      </Web3ReactProvider>
    </ErrorBoundary>
  );
};
