import { open } from "node:fs/promises";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { x402Client } from "@x402/core/client";
import { encodePaymentSignatureHeader } from "@x402/core/http";
import { privateKeyToAccount } from "viem/accounts";
import { getAddress, type Hex } from "viem";
import { BuyerTraceError, type BuyerTracePlan, type BuyerTraceDependencies } from "./buyer-trace-adapter.js";

export type TraceSigner = ConstructorParameters<typeof ExactEvmScheme>[0];
export async function readBoundedFile(path: string, maximum: number): Promise<string> {
  const file = await open(path,"r");
  try {
    if (!(await file.stat()).isFile()) throw new BuyerTraceError("CONFIG_INVALID");
    const bytes = Buffer.alloc(maximum+1);
    const {bytesRead} = await file.read(bytes,0,bytes.length,0);
    if (bytesRead > maximum) throw new BuyerTraceError("CONFIG_TOO_LARGE");
    return bytes.subarray(0,bytesRead).toString("utf8");
  } finally { await file.close(); }
}
export async function loadLocalSigner(keyFile: string): Promise<TraceSigner> {
  const key = (await readBoundedFile(keyFile, 128)).trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) throw new BuyerTraceError("CREDENTIAL_INVALID");
  return privateKeyToAccount(key as Hex);
}
/** Actual HTTP and pinned SDK paths. No wrapFetchWithPayment, retry or extension. */
export function createTraceRuntime(plan: BuyerTracePlan, wallet: string, expiresAt: number,
  keyFile: string): BuyerTraceDependencies {
  let signed = false;
  return {
    send: async request => {
      if (request.url !== plan.url || request.method !== "GET" || request.redirect !== "error") throw new BuyerTraceError("TRANSPORT_BINDING_INVALID");
      return fetch(request);
    },
    createPayment: async (requirement, signal) => {
      if (signed || signal.aborted || Date.now() >= expiresAt) throw new BuyerTraceError("SIGNING_REFUSED");
      signed = true;
      const signer = await loadLocalSigner(keyFile);
      if (signal.aborted) throw new BuyerTraceError("SIGNING_REFUSED");
      if (getAddress(signer.address) !== getAddress(wallet)) throw new BuyerTraceError("WALLET_MISMATCH");
      const boundedSigner: TraceSigner = {
        address: signer.address,
        signTypedData: async input => {
          const d=input.domain, m=input.message as Record<string,unknown>;
          if (signal.aborted || Date.now() >= expiresAt || input.primaryType !== "TransferWithAuthorization" ||
              Number(d?.chainId)!==8453 || d?.name!=="USD Coin" || d?.version!=="2" ||
              getAddress(String(d?.verifyingContract))!==getAddress(requirement.asset) ||
              getAddress(String(m.from))!==getAddress(wallet) || getAddress(String(m.to))!==getAddress(requirement.payTo) ||
              BigInt(String(m.value))!==BigInt(requirement.amount) || BigInt(String(m.validAfter))!==0n ||
              BigInt(String(m.validBefore))*1000n>BigInt(expiresAt)) throw new BuyerTraceError("SDK_SIGNING_BINDING_INVALID");
          return signer.signTypedData(input);
        }
      };
      const client = new x402Client().register("eip155:8453",new ExactEvmScheme(boundedSigner));
      const payload = await client.createPaymentPayload({x402Version:2,
        resource:{url:plan.url,description:"One reviewed Buyer Trace page",mimeType:"application/json"},
        accepts:[structuredClone(requirement)]});
      if (signal.aborted || Date.now() >= expiresAt) throw new BuyerTraceError("APPROVAL_EXPIRED_OR_INVALID");
      return encodePaymentSignatureHeader(payload);
    }
  };
}
