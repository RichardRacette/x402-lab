import { readFile } from "node:fs/promises";
import {
  OBSERVATORY_SCHEMA_VERSION,
  type DataMode,
  type MarketSource,
  type MerchantSnapshot,
  type NormalizedMarketDataset,
  type ResourceSnapshot,
  type SourceWindow,
  type TransactionSnapshot
} from "./types.js";

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function optionalString(value: unknown, label: string): string | undefined {
  return value === undefined ? undefined : requiredString(value, label);
}

function optionalNumber(value: unknown, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
  return value;
}

function requiredNumber(value: unknown, label: string): number {
  const parsed = optionalNumber(value, label);
  if (parsed === undefined) throw new Error(`${label} is required.`);
  return parsed;
}

function optionalInteger(value: unknown, label: string): number | undefined {
  const parsed = optionalNumber(value, label);
  if (parsed !== undefined && !Number.isInteger(parsed)) {
    throw new Error(`${label} must be an integer.`);
  }
  return parsed;
}

function stringArray(value: unknown, label: string): string[] {
  return array(value, label).map((item, index) =>
    requiredString(item, `${label}[${index}]`)
  );
}

function optionalStringArray(
  value: unknown,
  label: string
): string[] | undefined {
  return value === undefined ? undefined : stringArray(value, label);
}

function parseWindow(value: unknown): SourceWindow {
  const input = record(value, "source.window");
  const kind = requiredString(input.kind, "source.window.kind");
  if (!["rolling", "calendar", "point", "unknown"].includes(kind)) {
    throw new Error("source.window.kind is invalid.");
  }
  return {
    kind: kind as SourceWindow["kind"],
    label: requiredString(input.label, "source.window.label"),
    days: optionalInteger(input.days, "source.window.days"),
    start: optionalString(input.start, "source.window.start"),
    end: optionalString(input.end, "source.window.end")
  };
}

function parseSource(value: unknown): MarketSource {
  const input = record(value, "source");
  const dataMode = requiredString(input.dataMode, "source.dataMode") as DataMode;
  if (dataMode !== "manual") {
    throw new Error("Manual imports must declare source.dataMode as manual.");
  }
  const methodology = record(input.methodology, "source.methodology");
  return {
    id: requiredString(input.id, "source.id"),
    provider: requiredString(input.provider, "source.provider"),
    dataMode,
    observedAt: requiredString(input.observedAt, "source.observedAt"),
    window: parseWindow(input.window),
    methodology: {
      name: requiredString(methodology.name, "source.methodology.name"),
      version: optionalString(
        methodology.version,
        "source.methodology.version"
      ),
      notes: stringArray(methodology.notes, "source.methodology.notes")
    },
    references: stringArray(input.references, "source.references"),
    attribution: optionalString(input.attribution, "source.attribution"),
    license: optionalString(input.license, "source.license"),
    limitations: stringArray(input.limitations, "source.limitations")
  };
}

function parseMerchant(value: unknown, index: number): MerchantSnapshot {
  const input = record(value, `merchants[${index}]`);
  return {
    id: requiredString(input.id, `merchants[${index}].id`),
    sourceId: requiredString(input.sourceId, `merchants[${index}].sourceId`),
    name: optionalString(input.name, `merchants[${index}].name`),
    description: optionalString(
      input.description,
      `merchants[${index}].description`
    ),
    addresses: optionalStringArray(
      input.addresses,
      `merchants[${index}].addresses`
    ),
    categories: optionalStringArray(
      input.categories,
      `merchants[${index}].categories`
    ),
    resourceCount: optionalInteger(
      input.resourceCount,
      `merchants[${index}].resourceCount`
    ),
    transactions: optionalInteger(
      input.transactions,
      `merchants[${index}].transactions`
    ),
    volumeUsd: optionalNumber(
      input.volumeUsd,
      `merchants[${index}].volumeUsd`
    ),
    uniqueBuyers: optionalInteger(
      input.uniqueBuyers,
      `merchants[${index}].uniqueBuyers`
    ),
    latestActivity: optionalString(
      input.latestActivity,
      `merchants[${index}].latestActivity`
    ),
    networks: optionalStringArray(input.networks, `merchants[${index}].networks`),
    facilitators: optionalStringArray(
      input.facilitators,
      `merchants[${index}].facilitators`
    ),
    notes: optionalStringArray(input.notes, `merchants[${index}].notes`)
  };
}

function parseResource(value: unknown, index: number): ResourceSnapshot {
  const input = record(value, `resources[${index}]`);
  return {
    id: requiredString(input.id, `resources[${index}].id`),
    sourceId: requiredString(input.sourceId, `resources[${index}].sourceId`),
    merchantId: requiredString(
      input.merchantId,
      `resources[${index}].merchantId`
    ),
    name: optionalString(input.name, `resources[${index}].name`),
    path: optionalString(input.path, `resources[${index}].path`),
    method: optionalString(input.method, `resources[${index}].method`),
    description: optionalString(
      input.description,
      `resources[${index}].description`
    ),
    categories: optionalStringArray(
      input.categories,
      `resources[${index}].categories`
    ),
    priceUsd: optionalNumber(input.priceUsd, `resources[${index}].priceUsd`),
    protocolVersion: optionalString(
      input.protocolVersion,
      `resources[${index}].protocolVersion`
    ),
    network: optionalString(input.network, `resources[${index}].network`),
    access: (() => {
      const access = optionalString(input.access, `resources[${index}].access`);
      if (
        access !== undefined &&
        !["public", "paid", "authenticated", "unknown"].includes(access)
      ) {
        throw new Error(`resources[${index}].access is invalid.`);
      }
      return (access ?? "unknown") as ResourceSnapshot["access"];
    })()
  };
}

function parseTransaction(value: unknown, index: number): TransactionSnapshot {
  const input = record(value, `transactions[${index}]`);
  return {
    id: requiredString(input.id, `transactions[${index}].id`),
    sourceId: requiredString(input.sourceId, `transactions[${index}].sourceId`),
    buyerId: requiredString(input.buyerId, `transactions[${index}].buyerId`),
    sellerId: requiredString(input.sellerId, `transactions[${index}].sellerId`),
    amountUsd: requiredNumber(
      input.amountUsd,
      `transactions[${index}].amountUsd`
    ),
    timestamp: requiredString(
      input.timestamp,
      `transactions[${index}].timestamp`
    ),
    chain: optionalString(input.chain, `transactions[${index}].chain`),
    facilitator: optionalString(
      input.facilitator,
      `transactions[${index}].facilitator`
    ),
    category: optionalString(input.category, `transactions[${index}].category`)
  };
}

export function normalizeManualObservation(
  value: unknown
): NormalizedMarketDataset {
  const input = record(value, "manual observation");
  if (input.schemaVersion !== "machine-demand-manual/v1") {
    throw new Error("Manual observation schemaVersion is unsupported.");
  }
  const source = parseSource(input.source);
  const merchants = array(input.merchants, "merchants").map(parseMerchant);
  const resources = array(input.resources ?? [], "resources").map(parseResource);
  const transactions = array(input.transactions ?? [], "transactions").map(
    parseTransaction
  );
  for (const item of [...merchants, ...resources, ...transactions]) {
    if (item.sourceId !== source.id) {
      throw new Error("Every manual record must reference the declared source id.");
    }
  }

  return {
    schemaVersion: OBSERVATORY_SCHEMA_VERSION,
    generatedAt: source.observedAt,
    sources: [source],
    ecosystems: [],
    merchants,
    resources,
    transactions
  };
}

export async function loadManualObservation(
  path: string
): Promise<NormalizedMarketDataset> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    throw new Error("The manual market observation could not be read.");
  }
  try {
    return normalizeManualObservation(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The manual market observation is not valid JSON.");
    }
    throw error;
  }
}
