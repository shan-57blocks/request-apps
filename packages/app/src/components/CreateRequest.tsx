import React from "react";
import { Formik, FormikHelpers, useField, useFormikContext } from "formik";
import {
  makeStyles,
  Box,
  Typography,
  TextField,
  useTheme,
  MenuItem,
} from "@material-ui/core";
import Moment from "react-moment";
import * as Yup from "yup";
import { Skeleton } from "@material-ui/lab";
import WalletAddressValidator from "wallet-address-validator";

import { RIcon, RContainer, Spacer, RAlert, RButton } from "request-ui";

export interface IFormData {
  amount?: number;
  payer?: string;
  currency?: string;
  reason?: string;
}

export interface IProps {
  error?: string;
  onSubmit: (
    values: IFormData,
    formikActions: FormikHelpers<IFormData>
  ) => void;
  account?: string;
  isPending?: boolean;
  loading: boolean;
}

const useHeaderStyles = makeStyles(() => ({
  container: {
    height: 124,
    width: "100%",
    background: "white",
    borderRadius: "3px 3px 0px 0px",
    padding: 32,
    borderBottom: "1px solid #E9E9E9",
    justifyContent: "space-between",
    display: "flex",
  },
  dot: {
    height: 18,
    width: 18,
    backgroundColor: ({ account }: { account?: string }) =>
      account ? "#00CC8E" : "#DE1C22",
    borderRadius: "50%",
    display: "inline-block",
  },
}));

const Header = ({
  account,
  loading,
}: {
  account?: string;
  loading: boolean;
}) => {
  const classes = useHeaderStyles({ account });
  const theme = useTheme();
  const displayName = account
    ? account.length <= 20
      ? account
      : `${account.slice(0, 10)}...${account.slice(-10)}`
    : undefined;
  return (
    <Box className={classes.container}>
      <RIcon width={56} height={60} />
      <Box width={20} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        width="100%"
      >
        <Box textAlign="right" color="#656565">
          <Typography variant="body1">
            <Moment format="MMM Do, YYYY">{Date.now()}</Moment>
          </Typography>
        </Box>
        <Box color={theme.palette.common.black}>
          <Typography variant="h5">Your wallet</Typography>
        </Box>
        <Box height={8} />

        <Box color="#656565" display="flex" alignItems="center">
          {loading ? (
            <>
              <Skeleton variant="circle" height={18} width={18} />
              <Box width={8} />
              <Skeleton variant="text" width={200} />
            </>
          ) : (
            <>
              <Box className={classes.dot} />
              <Box width={8} />
              <Typography variant="body2">
                {displayName ? displayName : "no wallet connected"}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const useBodyStyles = makeStyles(theme => ({
  container: {
    height: 290,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    //justifyContent: "space-around",
    background: "white",
    borderRadius: "3px 3px 0px 0px",
    padding: "20px 32px",
    borderBottom: "1px solid #E9E9E9",
  },
  field: {
    marginTop: 12,
    marginBottom: 20,
  },
}));

const Amount = ({ className }: { className?: string }) => {
  const [field, meta] = useField("amount");
  return (
    <TextField
      {...field}
      autoFocus={true}
      name="amount"
      label="Amount"
      className={className}
      autoComplete="off"
      fullWidth
      required
      error={Boolean(meta.error && meta.touched)}
      helperText={Boolean(meta.error && meta.touched) ? meta.error : ""}
    />
  );
};

const Currency = ({ className }: { className?: string }) => {
  const [field, meta] = useField("currency");

  return (
    <TextField
      {...field}
      select
      name="currency"
      label=" "
      autoComplete="off"
      fullWidth
      className={className}
      error={Boolean(meta.error && meta.touched)}
      helperText={Boolean(meta.error && meta.touched) ? meta.error : ""}
    >
      <MenuItem value="DAI">DAI</MenuItem>
      <MenuItem value="ETH">ETH</MenuItem>
    </TextField>
  );
};

const Payer = ({ className }: { className?: string }) => {
  const [field, meta] = useField("payer");

  return (
    <TextField
      {...field}
      name="payer"
      label="Who are you sending this request to? (optional)"
      placeholder="Enter an ENS name or ETH address"
      className={className}
      autoComplete="off"
      fullWidth
      size="medium"
      error={Boolean(meta.error && meta.touched)}
      helperText={Boolean(meta.error && meta.touched) ? meta.error : ""}
    />
  );
};

const Reason = ({ className }: { className?: string }) => {
  const [field, meta] = useField("reason");

  return (
    <TextField
      {...field}
      name="reason"
      label="Reason (optional)"
      autoComplete="off"
      fullWidth
      className={className}
      error={Boolean(meta.error && meta.touched)}
      helperText={Boolean(meta.error && meta.touched) ? meta.error : ""}
    />
  );
};

const Body = () => {
  const classes = useBodyStyles();
  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row">
        <Box flex={0.8}>
          <Amount className={classes.field} />
        </Box>
        <Box flex={0.2}>
          <Currency className={classes.field} />
        </Box>
      </Box>

      <Payer className={classes.field} />
      <Reason className={classes.field} />
    </Box>
  );
};

const Footer = ({
  isPending,
  account,
}: {
  isPending: boolean;
  account?: string;
}) => {
  const { submitForm, isValid, values, isSubmitting } = useFormikContext<
    IFormData
  >();
  return (
    <>
      <Spacer size={12} />
      <RButton
        disabled={!values.amount || !isValid || !account}
        color="primary"
        fullWidth
        onClick={submitForm}
        loading={isSubmitting || isPending}
        direction="right"
      >
        <Typography variant="caption">Create a request</Typography>
      </RButton>
    </>
  );
};

const isValidEns = (val: string) =>
  /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/.test(
    val
  );
export const schema = Yup.object().shape<IFormData>({
  amount: Yup.number().required("Required"),
  payer: Yup.string().test(
    "is-valid-recipient",
    "Should be a valid ENS or ETH address",
    async (value: string) => {
      return (
        !value ||
        WalletAddressValidator.validate(value, "ethereum") ||
        isValidEns(value)
      );
    }
  ),
  currency: Yup.mixed().required("Required"),
});

export const CreateRequestForm = ({
  error,
  onSubmit,
  account,
  isPending = false,
  loading,
}: IProps) => {
  return (
    <RContainer>
      <Spacer size={15} />
      {error && <RAlert severity="error" message={error} />}

      <Formik<IFormData>
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{
          currency: "DAI",
          amount: "" as any,
          payer: "",
          reason: "",
        }}
      >
        <>
          <Header account={account} loading={loading} />
          <Body />
          <Footer account={account} isPending={isPending} />
        </>
      </Formik>
    </RContainer>
  );
};
