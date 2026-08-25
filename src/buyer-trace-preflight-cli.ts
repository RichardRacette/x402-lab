import {
  createBuyerTracePreflight,
  renderBuyerTracePreflight
} from "./buyer-trace-preflight.js";

if (process.argv.length > 2) {
  throw new Error(
    "Buyer Trace preflight accepts no arguments and has no payment execution mode."
  );
}

console.log(renderBuyerTracePreflight(createBuyerTracePreflight()).trimEnd());
