//@ts-nocheck
import { CurrencyDefinition } from "@requestnetwork/currency";
import { RequestNetwork, Types } from "@huma-shan/request-client.js";
import { useCurrency } from "../contexts/CurrencyContext";

export const useRequestClient = (
  network: string,
  signatureProvider?: Types.SignatureProvider.ISignatureProvider
) => {
  const { currencyList } = useCurrency();
  return getRequestClient(network, signatureProvider, currencyList);
};

export const getRequestClient = (
  network: string,
  signatureProvider?: Types.SignatureProvider.ISignatureProvider,
  currencyList?: CurrencyDefinition[]
) => {
  const requestNetwork = new RequestNetwork({
    // nodeConnectionConfig: {
    //   baseURL: `https://${network}.gateway.request.network/`,
    // },
    nodeConnectionConfig: {
      baseURL: `http://ec2-3-101-65-54.us-west-1.compute.amazonaws.com:3000/`,
    },
    signatureProvider,
    currencies: currencyList,
  });

  return requestNetwork;
};
