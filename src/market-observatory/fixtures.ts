import {
  OBSERVATORY_SCHEMA_VERSION,
  type MerchantSnapshot,
  type NormalizedMarketDataset,
  type TransactionSnapshot
} from "./types.js";

const FIXTURE_OBSERVED_AT = "2026-08-24T00:00:00.000Z";
const FIXTURE_SOURCE_ID = "fixture-demand-shapes-v1";

function makeTransactions(
  sellerId: string,
  category: string,
  buyers: Array<{ id: string; count: number }>,
  amountUsd: number,
  offset: number
): TransactionSnapshot[] {
  const transactions: TransactionSnapshot[] = [];
  let index = offset;
  for (const buyer of buyers) {
    for (let count = 0; count < buyer.count; count += 1) {
      transactions.push({
        id: `fixture-transaction-${index}`,
        sourceId: FIXTURE_SOURCE_ID,
        buyerId: buyer.id,
        sellerId,
        amountUsd,
        timestamp: new Date(
          Date.parse(FIXTURE_OBSERVED_AT) - index * 60_000
        ).toISOString(),
        chain: "fixture-chain",
        category
      });
      index += 1;
    }
  }
  return transactions;
}

function fixtureMerchants(): MerchantSnapshot[] {
  return [
    {
      id: "fixture-broad-repeat",
      sourceId: FIXTURE_SOURCE_ID,
      name: "Fixture — broad credential access",
      description:
        "Synthetic broad and repeated purchasing of credential-gated upstream access.",
      categories: ["credential-access", "data"],
      resourceCount: 4,
      transactions: 120,
      volumeUsd: 120,
      uniqueBuyers: 24
    },
    {
      id: "fixture-few-buyer-repeat",
      sourceId: FIXTURE_SOURCE_ID,
      name: "Fixture — few-buyer scarce data",
      description:
        "Synthetic high-repeat purchasing from a small buyer set.",
      categories: ["scarce-data"],
      resourceCount: 2,
      transactions: 60,
      volumeUsd: 300,
      uniqueBuyers: 3
    },
    {
      id: "fixture-broad-low-repeat",
      sourceId: FIXTURE_SOURCE_ID,
      name: "Fixture — broad low-repeat infrastructure",
      description:
        "Synthetic broad trial behavior with little repeat intensity.",
      categories: ["infrastructure"],
      resourceCount: 3,
      transactions: 30,
      volumeUsd: 75,
      uniqueBuyers: 25
    },
    {
      id: "fixture-zero-demand-catalog",
      sourceId: FIXTURE_SOURCE_ID,
      name: "Fixture — large zero-demand catalog",
      description:
        "Synthetic negative control: many resources without observed purchasing.",
      categories: ["generic-utility"],
      resourceCount: 120,
      transactions: 0,
      volumeUsd: 0,
      uniqueBuyers: 0
    },
    {
      id: "fixture-single-buyer",
      sourceId: FIXTURE_SOURCE_ID,
      name: "Fixture — single-buyer automation",
      description:
        "Synthetic concentrated automation with one buyer producing every call.",
      categories: ["automation"],
      resourceCount: 1,
      transactions: 40,
      volumeUsd: 80,
      uniqueBuyers: 1
    }
  ];
}

function fixtureTransactions(): TransactionSnapshot[] {
  const broadRepeatBuyers = [
    { id: "fixture-cross-seller-buyer", count: 5 },
    ...Array.from({ length: 23 }, (_, index) => ({
      id: `fixture-broad-buyer-${index + 1}`,
      count: 5
    }))
  ];
  const fewBuyerRepeat = Array.from({ length: 3 }, (_, index) => ({
    id: `fixture-repeat-buyer-${index + 1}`,
    count: 20
  }));
  const broadLowRepeat = [
    { id: "fixture-cross-seller-buyer", count: 2 },
    ...Array.from({ length: 24 }, (_, index) => ({
      id: `fixture-low-repeat-buyer-${index + 1}`,
      count: index < 4 ? 2 : 1
    }))
  ];

  return [
    ...makeTransactions(
      "fixture-broad-repeat",
      "credential-access",
      broadRepeatBuyers,
      1,
      1
    ),
    ...makeTransactions(
      "fixture-few-buyer-repeat",
      "scarce-data",
      fewBuyerRepeat,
      5,
      121
    ),
    ...makeTransactions(
      "fixture-broad-low-repeat",
      "infrastructure",
      broadLowRepeat,
      2.5,
      181
    ),
    ...makeTransactions(
      "fixture-single-buyer",
      "automation",
      [{ id: "fixture-single-buyer-client", count: 40 }],
      2,
      211
    )
  ];
}

export function createFixtureDataset(): NormalizedMarketDataset {
  return {
    schemaVersion: OBSERVATORY_SCHEMA_VERSION,
    generatedAt: FIXTURE_OBSERVED_AT,
    sources: [
      {
        id: FIXTURE_SOURCE_ID,
        provider: "deterministic-fixture",
        dataMode: "fixture",
        observedAt: FIXTURE_OBSERVED_AT,
        window: { kind: "rolling", label: "synthetic 30-day window", days: 30 },
        methodology: {
          name: "deterministic-demand-shapes",
          version: "1",
          notes: [
            "Synthetic records exercise breadth, repeat, economics, concentration, and cross-seller behavior.",
            "Fixture values are not live-market claims."
          ]
        },
        references: ["docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md"],
        limitations: [
          "Synthetic fixture only; use it to verify analytics, never as market evidence."
        ]
      }
    ],
    ecosystems: [
      {
        id: "fixture-ecosystem",
        sourceId: FIXTURE_SOURCE_ID,
        raw: {
          transactions: 1_000_000,
          volumeUsd: 100_000,
          buyers: 10_000,
          sellers: 2_000
        },
        organicHeuristic: {
          label: "fixture organic heuristic",
          volumeUsd: 55_000,
          sellers: 125
        },
        publishedConcentration: { top10VolumeShare: 0.72 }
      }
    ],
    merchants: fixtureMerchants(),
    resources: [
      {
        id: "fixture-resource-access",
        sourceId: FIXTURE_SOURCE_ID,
        merchantId: "fixture-broad-repeat",
        name: "Credential-gated data call",
        priceUsd: 1,
        categories: ["credential-access"],
        access: "paid"
      },
      {
        id: "fixture-resource-scarce-data",
        sourceId: FIXTURE_SOURCE_ID,
        merchantId: "fixture-few-buyer-repeat",
        name: "Scarce data lookup",
        priceUsd: 5,
        categories: ["scarce-data"],
        access: "paid"
      },
      {
        id: "fixture-resource-infrastructure",
        sourceId: FIXTURE_SOURCE_ID,
        merchantId: "fixture-broad-low-repeat",
        name: "Infrastructure task",
        priceUsd: 2.5,
        categories: ["infrastructure"],
        access: "paid"
      },
      {
        id: "fixture-resource-generic",
        sourceId: FIXTURE_SOURCE_ID,
        merchantId: "fixture-zero-demand-catalog",
        name: "Representative generic utility",
        priceUsd: 0.001,
        categories: ["generic-utility"],
        access: "paid"
      }
    ],
    transactions: fixtureTransactions()
  };
}

export function mergeDatasets(
  datasets: NormalizedMarketDataset[],
  generatedAt: string
): NormalizedMarketDataset {
  const sourceIds = new Set<string>();
  for (const dataset of datasets) {
    for (const source of dataset.sources) {
      if (sourceIds.has(source.id)) {
        throw new Error(`Duplicate market source id: ${source.id}`);
      }
      sourceIds.add(source.id);
    }
  }

  return {
    schemaVersion: OBSERVATORY_SCHEMA_VERSION,
    generatedAt,
    sources: datasets.flatMap(dataset => dataset.sources),
    ecosystems: datasets.flatMap(dataset => dataset.ecosystems),
    merchants: datasets.flatMap(dataset => dataset.merchants),
    resources: datasets.flatMap(dataset => dataset.resources),
    transactions: datasets.flatMap(dataset => dataset.transactions)
  };
}
