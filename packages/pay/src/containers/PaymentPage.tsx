import { Web3Provider } from "ethers/providers";
import * as React from "react";

import { Box, makeStyles } from "@material-ui/core";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";

import {
  RAlert,
  RFooter,
  Spacer,
  RequestView,
  RSpinner,
  RContainer,
  RequestSkeleton,
} from "request-ui";

import Feedback from "../components/Feedback";
import PaymentActions from "../components/PaymentActions";
import { ConnectorProvider, useConnector } from "../contexts/ConnectorContext";
import {
  PaymentProvider,
  usePayment,
  RequiresApprovalError,
} from "../contexts/PaymentContext";
import { RequestProvider, useRequest } from "request-shared";
import { usePrevious } from "../hooks/usePrevious";
import { useMobile } from "request-ui";
import ErrorPage from "./ErrorPage";
import { ErrorMessage } from "../components/ErrorMessage";

export const RequestNotFound = () => {
  return (
    <ErrorPage
      topText="Your request has not been found, sorry!"
      bottomText="You might want to try again later"
    />
  );
};

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    position: "sticky",
    bottom: 0,
    [theme.breakpoints.up("sm")]: {
      position: "relative",
    },
  },
}));

const WrappedSpinner = () => {
  const classes = useStyles();
  return (
    <Box className={classes.wrapper}>
      <RSpinner />
    </Box>
  );
};

export const ErrorContainer = () => {
  const mobile = useMobile();
  const { error } = usePayment();
  const { request } = useRequest();

  const requiresApproval = error instanceof RequiresApprovalError;
  const showErrorAtTop = !requiresApproval || mobile;

  if (request?.status === "open" && error && showErrorAtTop) {
    return (
      <>
        <ErrorMessage error={error} request={request} />
        <Spacer size={4} top />
      </>
    );
  }
  return <Spacer top={true} size={15} xs={5} />;
};

export const PaymentPage = () => {
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const { ready: connectorReady, connectorName } = useConnector();
  const {
    loading: requestLoading,
    request,
    counterCurrency,
    counterValue,
  } = useRequest();
  const { paying, approving, error, ready: paymentReady } = usePayment();
  const prevStatus = usePrevious(request?.status);
  const mobile = useMobile();
  const { active } = useWeb3React();
  React.useEffect(() => {
    if (
      prevStatus &&
      prevStatus !== request?.status &&
      request?.status === "paid"
    ) {
      setFeedbackOpen(true);
    }
  }, [request?.status]);

  React.useEffect(() => {
    // this hook is to avoid flashing elements on screen.
    // handles only first load
    if (loaded) return;
    // request must be loaded
    if (requestLoading) return;
    // connector must be ready
    if (!connectorReady) return;
    // if connector is active, check if payment is ready
    if (active && paymentReady) setLoaded(true);
    // there can be a delay between connectorReady=true and active=true
    //  so wait 500ms to ensure the connector is not active.
    if (!active) {
      const t = setTimeout(() => setLoaded(true), 500);
      return () => clearTimeout(t);
    }
  }, [requestLoading, connectorReady, active, paymentReady, loaded]);

  if (loaded && !request) {
    return <RequestNotFound />;
  }

  const requiresApproval =
    request?.status === "open" && error instanceof RequiresApprovalError;
  const activating = !active && !!connectorName;
  const stickToBottom =
    (mobile && active && request?.status === "open") ||
    (request?.status === "pending" && paying);
  const showSpinner = approving || activating;
  const showFooter =
    !mobile ||
    request?.status === "paid" ||
    request?.status === "canceled" ||
    (request?.status === "pending" && !paying);
  return (
    <RContainer>
      <Feedback open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {request ? (
        <RequestView
          amount={request.amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 5,
          })}
          createdDate={request.timestamp}
          currency={request.currency}
          payee={request.payeeName || request.payee}
          reason={request.reason}
          status={request.status}
          paidDate={request.paidDate}
          counterValue={counterValue}
          counterCurrency={counterCurrency}
        />
      ) : (
        <RequestSkeleton />
      )}

      {requiresApproval && !mobile ? (
        <>
          <Spacer size={12} />
          <RAlert
            severity="info"
            message="Please approve the contract using your connected wallet."
          />
          <Spacer size={5} />
        </>
      ) : (
        <Spacer size={15} xs={10} />
      )}
      {stickToBottom && <Box flex={1} />}
      {!showSpinner && <PaymentActions />}
      {showSpinner && <WrappedSpinner />}
      {showFooter && (
        <>
          <Spacer size={15} />
          <RFooter />
        </>
      )}
    </RContainer>
  );
};

export default () => {
  return (
    <RequestProvider>
      <Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
        <ConnectorProvider>
          <PaymentProvider>
            <ErrorContainer />
            <PaymentPage />
          </PaymentProvider>
        </ConnectorProvider>
      </Web3ReactProvider>
    </RequestProvider>
  );
};
