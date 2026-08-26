import {
  createBuyerTracePreflight,
  type BuyerTracePreflight,
} from "../../buyer-trace-preflight.js";
import type { SensorReading } from "../types.js";

export async function scanBuyerTracePreflight(): Promise<
  SensorReading<BuyerTracePreflight>
> {
  const preflight = createBuyerTracePreflight();

  return {
    sensorId: "buyer-trace-preflight-local",
    module: "BUYER_TRACE_PREFLIGHT",
    observedAt: preflight.generatedAt,
    source: "Repository-owned Buyer Trace preflight model",
    sourceVersion: preflight.schemaVersion,
    scope: "Proposed Buyer Trace experiment facts for operator review",
    evidenceRef: "src/buyer-trace-preflight.ts#createBuyerTracePreflight",
    status: "OK",
    limitations: [
      "This sensor instantiates the local preflight model in memory; it does not invoke the Buyer Trace CLI or make a request.",
      "Preflight readiness is not transaction evidence and does not mean that a purchase was executed.",
      "Payment, wallet, private-key, RPC, and blockchain execution are unavailable from this sensor.",
    ],
    data: preflight,
  };
}
