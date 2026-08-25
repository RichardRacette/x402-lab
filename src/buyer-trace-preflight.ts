export const BUYER_TRACE_PREFLIGHT_SCHEMA = "buyer-trace-preflight/v1";

const X402SCAN_ORIGIN = "https://www.x402scan.com";
const PAGE_SIZE = 100;
const PRICE_PER_PAGE_USD = 0.01;

export type BuyerTraceCompatibilityStatus =
  | "INCOMPATIBLE"
  | "INSUFFICIENT_DATA";

export interface BuyerTraceTargetManifest {
  id: string;
  name: string;
  observatoryMerchantId: string;
  publicServerIds: string[];
  publicServerUrl: string;
  publicOrigin: string;
  merchantAddress: `0x${string}`;
  identifierStatus: "RESOLVED_FROM_PUBLIC_EVIDENCE";
  hypothesis: string;
  freeEvidenceAlreadyKnown: string[];
  uncertaintyTransactionDataWouldResolve: string[];
  proposedRequest: {
    method: "GET";
    url: string;
    sendsPayment: false;
  };
  proposedPaidRequestCount: number;
  maximumEstimatedSpendUsd: number;
  approximateFullEnumerationPagesFromDatedAggregate: number;
  approximateFullEnumerationCostUsd: number;
  continueEvidence: string[];
  rejectOrDowngradeEvidence: string[];
  paginationAndCoverageLimitations: string[];
  compatibilityStatus: BuyerTraceCompatibilityStatus;
}

export interface BuyerTracePreflight {
  schemaVersion: typeof BUYER_TRACE_PREFLIGHT_SCHEMA;
  generatedAt: string;
  mode: "DRY_RUN_ONLY";
  actualSpendUsd: 0;
  paymentExecutionAvailable: false;
  recommendedFirstExperiment: {
    targetId: string;
    proposedPaidRequestCount: 1;
    hardMaximumCostUsd: number;
    requiresSeparateOwnerApproval: true;
  };
  x402scan: {
    resourceTemplate: string;
    openApiUrl: string;
    sourceRepository: string;
    sourceCommit: string;
    challengeObservedAt: string;
    unpaidResponse: {
      status: 402;
      body: "EMPTY";
      metadataHeader: "PAYMENT-REQUIRED";
    };
    paymentRequirement: {
      x402Version: 2;
      scheme: "exact";
      network: "eip155:8453";
      amountAtomic: "10000";
      priceUsd: number;
      asset: `0x${string}`;
      assetName: "USD Coin";
      assetVersion: "2";
      assetDecimals: 6;
      payTo: `0x${string}`;
      maxTimeoutSeconds: 300;
      facilitator: "UNAVAILABLE_NOT_ADVERTISED_IN_CHALLENGE";
    };
    pagination: {
      style: "ZERO_BASED_PAGE";
      defaultPageSize: 10;
      maximumPageSize: 100;
      responseFields: ["page", "page_size", "has_next_page"];
      totalCountAvailable: false;
    };
    expectedSuccessfulResponse: {
      basis: string;
      envelope: {
        data: "ARRAY";
        pagination: "OBJECT";
      };
      transactionFields: string[];
      amountInterpretation: string;
      analysisSupport: {
        buyerConcentration: string;
        repeatBuyerShare: string;
        crossSellerAnalysis: string;
      };
    };
  };
  currentClientCompatibility: {
    shopperGateway: {
      status: "INCOMPATIBLE";
      gaps: string[];
    };
    legacyBuyer: {
      status: "INCOMPATIBLE";
      compatibleElements: string[];
      gaps: string[];
    };
  };
  targets: BuyerTraceTargetManifest[];
}

interface TargetSeed {
  id: string;
  name: string;
  observatoryMerchantId: string;
  publicServerIds: string[];
  publicOrigin: string;
  merchantAddress: `0x${string}`;
  transactions: number;
  uniqueBuyers: number;
  volumeUsd: number;
  hypothesis: string;
  uncertainty: string[];
  continueEvidence: string[];
  rejectOrDowngradeEvidence: string[];
}

const TARGET_SEEDS: TargetSeed[] = [
  {
    id: "people-data-labs",
    name: "People Data Labs x402 access",
    observatoryMerchantId: "round4-people-data-labs",
    publicServerIds: ["0876a078-1f5a-4611-890b-c03d190cc1fa"],
    publicOrigin: "https://stablepeopledata.dev",
    merchantAddress: "0x7f33b3c113915a0f2981070553ba9538c0f90171",
    transactions: 1_150,
    uniqueBuyers: 7,
    volumeUsd: 29,
    hypothesis:
      "The high repeat intensity is genuine recurring use, but demand may be concentrated in one or two buyers.",
    uncertainty: [
      "The transaction and volume shares attributable to the largest buyer.",
      "How many of the seven dated aggregate buyers repeat.",
      "Whether the same buyer addresses also purchase from the other selected sellers."
    ],
    continueEvidence: [
      "The first page matches the documented response schema and contains more than one sender.",
      "Observed transactions are not dominated by one sender or a single mechanical amount/timestamp pattern.",
      "The response confirms that bounded follow-on paging can enumerate the dated aggregate scale."
    ],
    rejectOrDowngradeEvidence: [
      "One buyer dominates the observed transaction or volume share.",
      "Rows do not expose stable sender, amount, timestamp, and recipient fields.",
      "Coverage or pagination differs materially from the provider's public contract."
    ]
  },
  {
    id: "stableenrich",
    name: "StableEnrich",
    observatoryMerchantId: "round4-stableenrich",
    publicServerIds: ["b8a06bde-b6e8-4a10-b4e0-cc6a25fb9efb"],
    publicOrigin: "https://stableenrich.dev",
    merchantAddress: "0x325bdf6f7efab24a2210c48c1b64cab2eae1d430",
    transactions: 53_000,
    uniqueBuyers: 501,
    volumeUsd: 1_600,
    hypothesis:
      "StableEnrich combines broader buyer breadth with repeat use, making it a stronger adoption benchmark than a narrow merchant.",
    uncertainty: [
      "Whether recent transactions come from many buyers or a small highly active subset.",
      "Whether value and transaction concentration tell the same story.",
      "Whether selected buyers overlap with People Data Labs or BlockRun."
    ],
    continueEvidence: [
      "A recent 100-row page contains a meaningfully broader sender set than People Data Labs.",
      "No single sender dominates both observed count and volume.",
      "The observed row shape supports a bounded comparison using identical provider methodology."
    ],
    rejectOrDowngradeEvidence: [
      "The broad aggregate buyer count is not visible in the recent sample.",
      "Observed activity is dominated by one sender or one repetitive transfer pattern.",
      "The sample cannot be interpreted without exhaustive paging."
    ]
  },
  {
    id: "blockrun",
    name: "BlockRun",
    observatoryMerchantId: "round4-blockrun",
    publicServerIds: [
      "b85dcf0f-d4a9-47ce-9d0b-6ec70e2844e0",
      "cbe8caef-6324-4bd1-aee7-63d09fb4d1b9"
    ],
    publicOrigin: "https://blockrun.ai",
    merchantAddress: "0xe9030014f5dae217d0a152f02a043567b16c1abf",
    transactions: 8_000_000,
    uniqueBuyers: 625,
    volumeUsd: 196_000,
    hypothesis:
      "BlockRun is a useful high-throughput benchmark, but one recent page is descriptive only and cannot establish all-time concentration.",
    uncertainty: [
      "The sender breadth and amount distribution in a bounded recent sample.",
      "Whether its machine-like repeat shape resembles the smaller researched targets.",
      "Whether selected buyers overlap with People Data Labs or StableEnrich."
    ],
    continueEvidence: [
      "One recent page provides a stable benchmark row shape at the same provider and page size.",
      "The page contains enough sender and amount variation to compare descriptive patterns.",
      "No conclusion requires exhaustive enumeration of millions of transactions."
    ],
    rejectOrDowngradeEvidence: [
      "A one-page sample is too homogeneous or too volatile to serve as a useful benchmark.",
      "A conclusion would require exhaustive paging.",
      "The response does not preserve buyer and value fields needed for comparison."
    ]
  }
];

function transactionRequest(address: `0x${string}`): string {
  const path = `/api/x402/merchants/${address}/transactions`;
  const query = "page=0&page_size=100&chain=base&sort_by=time&sort_order=desc";
  return `${X402SCAN_ORIGIN}${path}?${query}`;
}

function targetManifest(seed: TargetSeed): BuyerTraceTargetManifest {
  const approximatePages = Math.ceil(seed.transactions / PAGE_SIZE);
  return {
    id: seed.id,
    name: seed.name,
    observatoryMerchantId: seed.observatoryMerchantId,
    publicServerIds: seed.publicServerIds,
    publicServerUrl: `${X402SCAN_ORIGIN}/server/${seed.publicServerIds[0]}`,
    publicOrigin: seed.publicOrigin,
    merchantAddress: seed.merchantAddress,
    identifierStatus: "RESOLVED_FROM_PUBLIC_EVIDENCE",
    hypothesis: seed.hypothesis,
    freeEvidenceAlreadyKnown: [
      `Dated manual aggregate: approximately ${seed.transactions.toLocaleString("en-US")} transactions, ${seed.uniqueBuyers.toLocaleString("en-US")} source-defined unique buyers, and $${seed.volumeUsd.toLocaleString("en-US")} volume.`,
      "The public x402scan server page exposes the origin and merchant receiving address.",
      "An unpaid GET to the proposed URL returned HTTP 402 and the shared payment requirement recorded in this preflight."
    ],
    uncertaintyTransactionDataWouldResolve: seed.uncertainty,
    proposedRequest: {
      method: "GET",
      url: transactionRequest(seed.merchantAddress),
      sendsPayment: false
    },
    proposedPaidRequestCount: 1,
    maximumEstimatedSpendUsd: PRICE_PER_PAGE_USD,
    approximateFullEnumerationPagesFromDatedAggregate: approximatePages,
    approximateFullEnumerationCostUsd: approximatePages * PRICE_PER_PAGE_USD,
    continueEvidence: seed.continueEvidence,
    rejectOrDowngradeEvidence: seed.rejectOrDowngradeEvidence,
    paginationAndCoverageLimitations: [
      "The proposed page is the latest 100 Base transactions, not a random or complete sample.",
      "The successful response advertises only has_next_page; it does not provide a total row count.",
      `A full enumeration would require approximately ${approximatePages.toLocaleString("en-US")} pages ($${(approximatePages * PRICE_PER_PAGE_USD).toFixed(2)}) if the dated aggregate count and current API coverage align.`,
      "Any exact concentration metric requires complete coverage for the stated window; one page supports only observed-sample metrics."
    ],
    compatibilityStatus: "INCOMPATIBLE"
  };
}

export function createBuyerTracePreflight(): BuyerTracePreflight {
  return {
    schemaVersion: BUYER_TRACE_PREFLIGHT_SCHEMA,
    generatedAt: "2026-08-25T12:07:58.000Z",
    mode: "DRY_RUN_ONLY",
    actualSpendUsd: 0,
    paymentExecutionAvailable: false,
    recommendedFirstExperiment: {
      targetId: "people-data-labs",
      proposedPaidRequestCount: 1,
      hardMaximumCostUsd: PRICE_PER_PAGE_USD,
      requiresSeparateOwnerApproval: true
    },
    x402scan: {
      resourceTemplate: "/api/x402/merchants/{address}/transactions",
      openApiUrl: `${X402SCAN_ORIGIN}/openapi.json`,
      sourceRepository: "https://github.com/Merit-Systems/x402scan",
      sourceCommit: "4b29346e90ff12393534adfece1ec32f8dd155b1",
      challengeObservedAt: "2026-08-25T12:07:58.000Z",
      unpaidResponse: {
        status: 402,
        body: "EMPTY",
        metadataHeader: "PAYMENT-REQUIRED"
      },
      paymentRequirement: {
        x402Version: 2,
        scheme: "exact",
        network: "eip155:8453",
        amountAtomic: "10000",
        priceUsd: PRICE_PER_PAGE_USD,
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        assetName: "USD Coin",
        assetVersion: "2",
        assetDecimals: 6,
        payTo: "0x2EC4545f96A24876764bF2B04D54E66A1351bE71",
        maxTimeoutSeconds: 300,
        facilitator: "UNAVAILABLE_NOT_ADVERTISED_IN_CHALLENGE"
      },
      pagination: {
        style: "ZERO_BASED_PAGE",
        defaultPageSize: 10,
        maximumPageSize: PAGE_SIZE,
        responseFields: ["page", "page_size", "has_next_page"],
        totalCountAvailable: false
      },
      expectedSuccessfulResponse: {
        basis:
          "Provider OpenAPI plus the public x402scan handler, transfer query, and database schema at the recorded source commit; no paid response was fetched.",
        envelope: {
          data: "ARRAY",
          pagination: "OBJECT"
        },
        transactionFields: [
          "id",
          "address",
          "token_address",
          "transaction_from",
          "sender",
          "recipient",
          "amount",
          "decimals",
          "block_timestamp",
          "tx_hash",
          "chain",
          "provider",
          "facilitator_id",
          "log_index"
        ],
        amountInterpretation:
          "The provider stores amount with a decimals field. Normalize value only as amount / 10^decimals after validating a successful response.",
        analysisSupport: {
          buyerConcentration:
            "SUPPORTED for a completely covered merchant/window by grouping sender and using amount plus decimals; one page supports observed-sample concentration only.",
          repeatBuyerShare:
            "SUPPORTED for a completely covered merchant/window by counting transactions per sender; one page supports observed-sample repeat only.",
          crossSellerAnalysis:
            "INSUFFICIENT from one merchant page. Overlap among completely covered selected merchants is possible; market-wide behavior requires additional paid wallet/seller coverage."
        }
      }
    },
    currentClientCompatibility: {
      shopperGateway: {
        status: "INCOMPATIBLE",
        gaps: [
          "Endpoint allowlist permits only the deployed /extract-evidence seller.",
          "Request construction is POST JSON, while x402scan requires GET with query parameters.",
          "Allowed network is Base Sepolia eip155:84532, while x402scan requires Base mainnet eip155:8453.",
          "Allowed asset is Base Sepolia USDC, while x402scan requires Base mainnet USDC.",
          "Allowed payTo is the x402-lab seller, not the x402scan receiver.",
          "The $0.003 item cap is below x402scan's $0.01 page price.",
          "The execution client registers only Base Sepolia."
        ]
      },
      legacyBuyer: {
        status: "INCOMPATIBLE",
        compatibleElements: [
          "The x402 v2 client supports the exact EVM scheme.",
          "Its existing $0.05 max-per-payment guardrail is above the $0.01 requirement."
        ],
        gaps: [
          "It is hard-coded to POST /analyze-job with a job-analysis body, not the x402scan GET.",
          "No Base-mainnet funding or operational approval exists; mainnet use is expressly out of scope.",
          "Using it would load wallet credentials, which this public-metadata preflight deliberately never does."
        ]
      }
    },
    targets: TARGET_SEEDS.map(targetManifest)
  };
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function renderBuyerTracePreflight(
  preflight = createBuyerTracePreflight()
): string {
  const requirement = preflight.x402scan.paymentRequirement;
  const recommended = preflight.targets.find(
    target => target.id === preflight.recommendedFirstExperiment.targetId
  );
  if (!recommended) throw new Error("Recommended Buyer Trace target is missing.");

  const lines = [
    "BUYER TRACE PREFLIGHT — DRY RUN ONLY",
    `schema: ${preflight.schemaVersion}`,
    `observed: ${preflight.generatedAt}`,
    "ACTUAL SPEND: $0.00",
    "PAYMENT EXECUTION: NOT PRESENT",
    "",
    "UNPAID X402SCAN REQUIREMENT",
    `HTTP: ${preflight.x402scan.unpaidResponse.status}`,
    `x402: v${requirement.x402Version} ${requirement.scheme}`,
    `network: ${requirement.network}`,
    `price: ${requirement.amountAtomic} atomic ${requirement.assetName} (${money(requirement.priceUsd)})`,
    `asset: ${requirement.asset}`,
    `payTo: ${requirement.payTo}`,
    `max timeout: ${requirement.maxTimeoutSeconds}s`,
    `facilitator: ${requirement.facilitator}`,
    `pagination: page=0, page_size<=${preflight.x402scan.pagination.maximumPageSize}; response has page/page_size/has_next_page but no total`,
    "",
    "TARGET MANIFESTS"
  ];

  for (const target of preflight.targets) {
    lines.push(
      "",
      `${target.name} [${target.identifierStatus}]`,
      `server id(s): ${target.publicServerIds.join(", ")}`,
      `merchant address: ${target.merchantAddress}`,
      `unpaid request: ${target.proposedRequest.method} ${target.proposedRequest.url}`,
      `proposed calls: ${target.proposedPaidRequestCount}`,
      `manifest maximum: ${money(target.maximumEstimatedSpendUsd)}`,
      `dated full-enumeration estimate: ~${target.approximateFullEnumerationPagesFromDatedAggregate.toLocaleString("en-US")} pages / ${money(target.approximateFullEnumerationCostUsd)}`,
      `compatibility: ${target.compatibilityStatus}`,
      `hypothesis: ${target.hypothesis}`,
      `free evidence: ${target.freeEvidenceAlreadyKnown.join(" ")}`,
      `uncertainty: ${target.uncertaintyTransactionDataWouldResolve.join(" ")}`,
      `CONTINUE evidence: ${target.continueEvidence.join(" ")}`,
      `REJECT/DOWNGRADE evidence: ${target.rejectOrDowngradeEvidence.join(" ")}`,
      `pagination/coverage: ${target.paginationAndCoverageLimitations.join(" ")}`
    );
  }

  lines.push(
    "",
    "RECOMMENDED FIRST PAID EXPERIMENT — REQUIRES SEPARATE OWNER APPROVAL",
    `target: ${recommended.name}`,
    `request count: ${preflight.recommendedFirstExperiment.proposedPaidRequestCount}`,
    `HARD MAXIMUM COST: ${money(preflight.recommendedFirstExperiment.hardMaximumCostUsd)}`,
    "The other target manifests are alternatives, not authorized calls and not included in this maximum.",
    "NO PAYMENT MADE"
  );

  return `${lines.join("\n")}\n`;
}
