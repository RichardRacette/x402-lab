import {
  createShopperConfig,
  defaultShopperDependencies,
  dryRunPurchase,
  executePurchase,
  formatUsdc,
  reconcileLedger,
  type ShopperRequest
} from "./shopper-gateway.js";

interface CliArguments {
  execute: boolean;
  reconcile: boolean;
  url?: string;
  question?: string;
}

function parseArguments(args: string[]): CliArguments {
  const parsed: CliArguments = { execute: false, reconcile: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--execute") {
      parsed.execute = true;
    } else if (argument === "--reconcile") {
      parsed.reconcile = true;
    } else if (argument === "--url") {
      parsed.url = args[++index];
    } else if (argument === "--question") {
      parsed.question = args[++index];
    } else {
      throw new Error(`Unknown shopper argument: ${argument}`);
    }
  }

  if (parsed.execute && parsed.reconcile) {
    throw new Error("--execute and --reconcile cannot be combined.");
  }
  if (!parsed.reconcile && (!parsed.url?.trim() || !parsed.question?.trim())) {
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

  const result = await executePurchase(
    request,
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
