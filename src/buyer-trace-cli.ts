import { createBuyerTracePlan, runBuyerTrace } from "./buyer-trace-adapter.js";

// No credential, wallet, RPC, provider or authority-minting imports in this CLI.
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--execute") {
  throw new Error("Buyer Trace live execution unavailable: requires separately approved live components and owner authorization.");
}
if (args.length) throw new Error("Buyer Trace accepts no arguments for its offline dry-run.");
console.log(JSON.stringify(await runBuyerTrace(createBuyerTracePlan()), null, 2));
