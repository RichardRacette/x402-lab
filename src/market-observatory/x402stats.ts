import {
  OBSERVATORY_SCHEMA_VERSION,
  type NormalizedMarketDataset
} from "./types.js";

export const X402STATS_FREE_URL = "https://x402stats.io/api/stats";
const MAX_RESPONSE_BYTES = 1_048_576;
const FETCH_TIMEOUT_MS = 8_000;

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function numberValue(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
  return value;
}

function integerValue(value: unknown, label: string): number {
  const parsed = numberValue(value, label);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer.`);
  return parsed;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = stringValue(value, label);
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} must be ISO time.`);
  return timestamp;
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

export async function fetchX402StatsRaw(
  fetchImplementation: typeof fetch = fetch
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImplementation(X402STATS_FREE_URL, {
      headers: { "user-agent": "x402-lab-machine-demand-observatory/0.1" },
      redirect: "error",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch {
    throw new Error("The free x402stats collection request failed.");
  }

  if (!response.ok) {
    throw new Error(`x402stats returned HTTP ${response.status}.`);
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("x402stats returned an unsupported content type.");
  }
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    throw new Error("x402stats response exceeded the 1 MiB limit.");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) {
    throw new Error("x402stats response exceeded the 1 MiB limit.");
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function normalizeX402Stats(rawText: string): NormalizedMarketDataset {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("x402stats returned invalid JSON.");
  }

  const root = record(parsed, "x402stats response");
  const updatedAt = isoTimestamp(root.updatedAt, "updatedAt");
  const methodologyVersion = stringValue(
    root.methodologyVersion,
    "methodologyVersion"
  );
  const snapshot = record(root.snapshot, "snapshot");
  const computedAt = isoTimestamp(snapshot.computedAt, "snapshot.computedAt");
  const windowDays = integerValue(snapshot.windowDays, "snapshot.windowDays");
  if (windowDays <= 0) throw new Error("snapshot.windowDays must be positive.");

  const series = arrayValue(root.series, "series").map((value, index) => {
    const day = record(value, `series[${index}]`);
    return {
      date: stringValue(day.date, `series[${index}].date`),
      transactions: integerValue(
        day.transactions,
        `series[${index}].transactions`
      ),
      volumeUsd: numberValue(day.volumeUsd, `series[${index}].volumeUsd`),
      sellers: integerValue(day.sellers, `series[${index}].sellers`),
      buyers: integerValue(day.buyers, `series[${index}].buyers`)
    };
  });

  const end = new Date(computedAt);
  const endDate = end.toISOString().slice(0, 10);
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
      (windowDays - 1) * 86_400_000
  );
  const startDate = start.toISOString().slice(0, 10);
  const windowSeries = series.filter(day => day.date >= startDate && day.date <= endDate);

  const facilitatorShares = arrayValue(
    snapshot.facilitatorShare,
    "snapshot.facilitatorShare"
  ).map((value, index) => {
    const item = record(value, `snapshot.facilitatorShare[${index}]`);
    return {
      facilitator: stringValue(
        item.facilitator,
        `snapshot.facilitatorShare[${index}].facilitator`
      ),
      volumeUsd: numberValue(
        item.volumeUsd,
        `snapshot.facilitatorShare[${index}].volumeUsd`
      ),
      share: numberValue(item.share, `snapshot.facilitatorShare[${index}].share`)
    };
  });

  const sourceId = `x402stats-${updatedAt}`;
  return {
    schemaVersion: OBSERVATORY_SCHEMA_VERSION,
    generatedAt: updatedAt,
    sources: [
      {
        id: sourceId,
        provider: "x402stats",
        dataMode: "live",
        observedAt: updatedAt,
        window: {
          kind: "rolling",
          label: `${windowDays}-day snapshot ending ${endDate}`,
          days: windowDays,
          start: startDate,
          end: endDate
        },
        methodology: {
          name: "x402stats raw and organic heuristic",
          version: methodologyVersion,
          notes: [
            "Raw and organic-heuristic values remain separate.",
            "Organic is the provider's heuristic, not proof of independent commerce.",
            "Raw transaction count is summed from daily series in the published snapshot window.",
            "The free aggregate feed does not publish a deduplicated 30-day raw buyer count."
          ]
        },
        references: [X402STATS_FREE_URL, "https://x402stats.io/data"],
        attribution: "x402stats — State of x402, x402stats.io",
        license: "CC BY 4.0",
        limitations: [
          "Buyer counts in the daily series are per-day and are not summed into a unique window buyer count.",
          "Cross-seller buyer overlap and merchant-level transaction histories are unavailable in this feed.",
          "Organic classification is a heuristic and may include sophisticated self-dealing or inherit indexer gaps."
        ]
      }
    ],
    ecosystems: [
      {
        id: `x402stats-ecosystem-${endDate}`,
        sourceId,
        raw: {
          transactions: windowSeries.reduce(
            (sum, day) => sum + day.transactions,
            0
          ),
          volumeUsd: numberValue(snapshot.volumeUsd, "snapshot.volumeUsd"),
          sellers: integerValue(snapshot.sellers, "snapshot.sellers")
        },
        organicHeuristic: {
          label: `x402stats organic heuristic ${methodologyVersion}`,
          volumeUsd: numberValue(
            snapshot.organicVolumeUsd,
            "snapshot.organicVolumeUsd"
          ),
          sellers: integerValue(
            snapshot.organicSellers,
            "snapshot.organicSellers"
          )
        },
        publishedEconomics: {
          averagePaymentUsd: numberValue(
            snapshot.avgPaymentUsd,
            "snapshot.avgPaymentUsd"
          ),
          medianSellerRevenueUsd: numberValue(
            snapshot.medianSellerRevenueUsd,
            "snapshot.medianSellerRevenueUsd"
          )
        },
        publishedConcentration: {
          top10VolumeShare: numberValue(
            snapshot.top10VolumeShare,
            "snapshot.top10VolumeShare"
          )
        },
        facilitatorShares
      }
    ],
    merchants: [],
    resources: [],
    transactions: []
  };
}
