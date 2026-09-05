import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isAddress } from "viem";
import { assertApprovalWindow, buyerTraceIntent, BuyerTraceError, createBuyerTracePlan, runBuyerTrace } from "./buyer-trace-adapter.js";
import { fingerprintPurchaseIntent } from "./trust-boundary.js";
import { authorizeReviewedBuyerTrace } from "./shopper-cli.js";
import { createTraceRuntime, readBoundedFile } from "./buyer-trace-runtime.js";

/** The executable calls this same parser/runtime. Test authorities live only in tests. */
export async function runBuyerTraceCli(args: string[]) {
  const values=new Map<string,string>();
  let execute=false,validate=false;
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==="--execute" && !execute) execute=true;
    else if(arg==="--validate-config" && !validate) validate=true;
    else if(["--approval","--session","--key-file","--timeout-ms"].includes(arg) && !values.has(arg) && args[i+1] && !args[i+1].startsWith("--")) values.set(arg,args[++i]);
    else throw new BuyerTraceError("ARGUMENT_INVALID");
  }
  if(execute && validate) throw new BuyerTraceError("ARGUMENT_INVALID");
  if(!execute && !validate) {
    if(values.size) throw new BuyerTraceError("ARGUMENT_INVALID");
    return runBuyerTrace();
  }
  const approvalFile=values.get("--approval"), session=values.get("--session"),keyFile=values.get("--key-file");
  if(!approvalFile || !session || !keyFile) throw new BuyerTraceError("REVIEW_CONFIG_REQUIRED");
  const review=JSON.parse(await readBoundedFile(approvalFile,32_768));
  if(!review || Object.keys(review).sort().join(",")!=="expiresAt,plan,sessionBudgetAtomic,walletAddress") throw new BuyerTraceError("REVIEW_INVALID");
  const plan=createBuyerTracePlan(review.plan?.pageSize);
  if(JSON.stringify(review.plan)!==JSON.stringify(plan) || review.sessionBudgetAtomic!=="10000" ||
    typeof review.walletAddress!=="string" || !isAddress(review.walletAddress)) throw new BuyerTraceError("REVIEW_BINDING_INVALID");
  const expiresAt=Date.parse(review.expiresAt);
  const timeoutMs=Number(values.get("--timeout-ms")??8_000);
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>8_000) throw new BuyerTraceError("TIMEOUT_INVALID");
  assertApprovalWindow(plan,expiresAt,2*timeoutMs);
  const intent=buyerTraceIntent(plan,session,expiresAt,review.walletAddress);
  if(validate) return {mode:"config-valid",requestFingerprint:fingerprintPurchaseIntent(intent),
    credential:"NOT_LOADED",ownerApproval:"STILL_REQUIRED",live:"NOT_RUN",maximumAtomic:"10000"};
  const authorization=await authorizeReviewedBuyerTrace(intent,expiresAt);
  const result=await runBuyerTrace(plan,{execute:true,authorization,sessionFile:session,expiresAt,
    walletAddress:review.walletAddress,sessionBudgetAtomic:10_000n,requestTimeoutMs:timeoutMs},
    createTraceRuntime(plan,review.walletAddress,expiresAt,keyFile));
  // Provider rows can contain credentials or PII; only evidence counts and audit leave the CLI.
  return {mode:result.mode,audit:result.audit,rows:result.response? (result.response.value as {data:unknown[]}).data.length:0,
    sourceTrust:"untrusted",liveAcceptance:"NOT_ESTABLISHED"};
}
export function traceCliError(error: unknown) {
  return {mode:"refused",code:error instanceof BuyerTraceError?error.code:"AUTHORITY_OR_DEPENDENCY_REFUSED",
    instruction:"Preserve any reservation. Do not automatically retry an ambiguous acquisition."};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  runBuyerTraceCli(process.argv.slice(2)).then(result=>console.log(JSON.stringify(result))).catch(error=>{
    console.error(JSON.stringify(traceCliError(error)));process.exitCode=1;
  });
}
