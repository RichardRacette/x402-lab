import {
  createShopperConfig,
  defaultLockRecoveryDependencies,
  defaultShopperDependencies,
  dryRunPurchase,
  formatUsdc,
  recoverPurchaseLock,
  reconcileLedger,
  type ShopperRequest
} from "./shopper-gateway.js";
import { executeAuthorizedPurchase } from "./authorized-shopper.js";
import { mintOwnerCliPurchaseAuthorization } from "./trust-boundary.js";

interface CliArguments {
  execute: boolean;
  reconcile: boolean;
  recoverLock: boolean;
  url?: string;
  question?: string;
}

function parseArguments(args: string[]): CliArguments {
  const parsed: CliArguments = {
    execute: false,
    reconcile: false,
    recoverLock: false
  };
  let sawUrl = false;
  let sawQuestion = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--execute") {
      parsed.execute = true;
    } else if (argument === "--reconcile") {
      parsed.reconcile = true;
    } else if (argument === "--recover-lock") {
      parsed.recoverLock = true;
    } else if (argument === "--url") {
      sawUrl = true;
      parsed.url = args[++index];
    } else if (argument === "--question") {
      sawQuestion = true;
      parsed.question = args[++index];
    } else {
      throw new Error(`Unknown shopper argument: ${argument}`);
    }
  }

  if (parsed.execute && parsed.reconcile) {
    throw new Error("--execute and --reconcile cannot be combined.");
  }
  if (
    parsed.recoverLock &&
    (parsed.execute || parsed.reconcile || sawUrl || sawQuestion)
  ) {
    throw new Error(
      "--recover-lock cannot be combined with --execute, --reconcile, --url, or --question."
    );
  }
  if (
    !parsed.reconcile &&
    !parsed.recoverLock &&
    (!parsed.url?.trim() || !parsed.question?.trim())
  ) {
    throw new Error("--url and --question are required for shopper evaluation.");
  }
  return parsed;
}

function printDryRun(result: Awaited<ReturnType<typeof dryRunPurchase>>): void {
  console.log("SHOPPER GATEWAY DRY RUN");
  console.log(`committed spend: ${formatUsdc(result.committedSpendAtomic)} USDC`);
  console.log(`reserved spend: ${formatUsdc(result.reservedSpendAtomic)} USDC`);
  console.log(
    `remaining initial allowance: ${formatUsdc(result.remainingInitialAllowanceAtomic)} USDC`
  );
  console.log(`wallet balance: ${formatUsdc(result.walletBalanceAtomic)} USDC`);
  console.log(`proposed purchase: ${formatUsdc(result.proposedAmountAtomic)} USDC`);
  console.log(
    `protected reserve: ${formatUsdc(result.protectedReserveAtomic)} USDC`
  );
  console.log(`POLICY: ${result.allowed ? "ALLOW" : "DENY"}`);
  for (const reason of result.reasons) console.log(`reason: ${reason}`);
  console.log("NO PAYMENT MADE");
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const config = createShopperConfig();

  if (args.recoverLock) {
    console.log("SHOPPER LOCK RECOVERY");
    try {
      const result = await recoverPurchaseLock(
        config.lockPath,
        defaultLockRecoveryDependencies
      );
      if (result.outcome === "NO_LOCK") {
        console.log("no lock exists");
      } else {
        console.log(`lock PID: ${result.pid}`);
        console.log(
          `process status: ${result.processStatus === "active" ? "ACTIVE" : "NOT RUNNING"}`
        );
        if (result.outcome === "ACTIVE") {
          console.log("RECOVERY REFUSED");
          process.exitCode = 1;
        } else {
          console.log("stale lock removed");
        }
      }
    } catch (error) {
      console.log("RECOVERY REFUSED");
      console.log("NO PAYMENT MADE");
      console.log("LEDGER UNCHANGED");
      throw error;
    }
    console.log("NO PAYMENT MADE");
    console.log("LEDGER UNCHANGED");
    return;
  }

  if (args.reconcile) {
    const results = await reconcileLedger(config, defaultShopperDependencies);
    console.log("SHOPPER GATEWAY RECONCILIATION");
    if (results.length === 0) console.log("No reservations require reconciliation.");
    for (const result of results) {
      console.log(
        `${result.reservationId}: ${result.outcome}${result.transaction ? ` (${result.transaction})` : ""}`
      );
    }
    console.log("NO PAYMENT MADE");
    return;
  }

  const request: ShopperRequest = {
    endpoint: config.allowedEndpoint,
    sourceUrl: args.url!.trim(),
    question: args.question!.trim()
  };

  if (!args.execute) {
    const result = await dryRunPurchase(
      request,
      config,
      defaultShopperDependencies
    );
    printDryRun(result);
    return;
  }

  // The capability is minted only because the owner explicitly supplied the
  // local --execute flag. External content is data, not authority. The mint
  // also binds this one approval to this exact endpoint/source/question tuple.
  const result = await executeAuthorizedPurchase(
    {
      ...request,
      authorization: mintOwnerCliPurchaseAuthorization(request)
    },
    config,
    defaultShopperDependencies
  );
  console.log("SHOPPER GATEWAY PURCHASE");
  console.log(`HTTP status: ${result.status}`);
  console.log(`payment status: ${result.paymentStatus}`);
  console.log(`transaction: ${result.transaction}`);
  console.log(JSON.stringify(result.body, null, 2));
}

main().catch(error => {
  const message = error instanceof Error ? error.message : "Unknown shopper error.";
  console.error("SHOPPER GATEWAY ERROR");
  console.error(message);
  process.exitCode = 1;
});
