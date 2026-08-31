import { EvidenceSliceError, type EvidenceErrorCode } from "./evidence-error.js";
import { extractEvidence } from "./evidence-slice.js";
import type { RetrievalProvider, RetrievedSource } from "./retrieval-provider.js";

export interface RetrievalBenchmarkFixture {
  id: string;
  url: string;
  question: string;
  expectedPhrase: string;
  native?: {
    contentType: "text/html" | "text/plain";
    text: string;
  };
  firecrawlMarkdown?: string;
  nativeError?: EvidenceErrorCode;
  expected: Record<string, boolean>;
}
export interface RetrievalBenchmarkCase {
  fixtureId: string;
  providerId: string;
  success: boolean;
  expectedSuccess: boolean;
  expectationMatched: boolean;
  evidenceCount: number;
  phraseFound: boolean;
  latencyMs: number;
  errorCode?: EvidenceErrorCode;
}

export interface RetrievalBenchmarkReport {
  evaluatedAt: string;
  mode: "fixtures";
  externalCostUsd: 0;
  expectationsMatched: number;
  cases: RetrievalBenchmarkCase[];
  providers: {
    providerId: string;
    successes: number;
    phraseMatches: number;
  }[];
}

function fixtureByUrl(
  fixtures: readonly RetrievalBenchmarkFixture[],
  url: string
): RetrievalBenchmarkFixture {
  const fixture = fixtures.find(item => item.url === url);
  if (!fixture) {
    throw new EvidenceSliceError("FETCH_FAILED", "Fixture URL was not found.");
  }
  return fixture;
}

function nativeFixtureSource(fixture: RetrievalBenchmarkFixture): RetrievedSource {
  if (fixture.nativeError) {
    throw new EvidenceSliceError(fixture.nativeError, "Synthetic upstream failure.");
  }
  if (!fixture.native) {
    throw new EvidenceSliceError("FETCH_FAILED", "Synthetic source is unavailable.");
  }
  return { url: fixture.url, ...fixture.native };
}

function naiveText(html: string): string {
  return html
    .replace(/<(head|script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createFixtureProviders(
  fixtures: readonly RetrievalBenchmarkFixture[]
): RetrievalProvider[] {
  return [
    {
      id: "native-fixture",
      retrieve: async ({ url }) => nativeFixtureSource(fixtureByUrl(fixtures, url))
    },
    {
      id: "simple-fixture",
      retrieve: async ({ url }) => {
        const source = nativeFixtureSource(fixtureByUrl(fixtures, url));
        return {
          url: source.url,
          contentType: "text/plain",
          text:
            source.contentType === "text/html" ? naiveText(source.text) : source.text
        };
      }
    },
    {
      id: "firecrawl-mock",
      retrieve: async ({ url }) => {
        const fixture = fixtureByUrl(fixtures, url);
        if (fixture.nativeError || !fixture.firecrawlMarkdown) {
          throw new EvidenceSliceError("PROVIDER_FAILED", "Synthetic provider failure.");
        }
        return {
          url: fixture.url,
          contentType: "text/plain",
          text: fixture.firecrawlMarkdown
        };
      }
    }
  ];
}

export async function runRetrievalBenchmark(
  providers: readonly RetrievalProvider[],
  fixtures: readonly RetrievalBenchmarkFixture[]
): Promise<RetrievalBenchmarkReport> {
  const cases: RetrievalBenchmarkCase[] = [];

  for (const fixture of fixtures) {
    for (const provider of providers) {
      const started = performance.now();
      const expectedSuccess = fixture.expected[provider.id] ?? false;
      try {
        const result = await extractEvidence(fixture.url, fixture.question, {
          retrievalProvider: provider,
          now: () => new Date("2026-08-30T00:00:00.000Z")
        });
        const phraseFound = fixture.expectedPhrase
          ? result.evidence.some(item =>
              item.text.toLowerCase().includes(fixture.expectedPhrase.toLowerCase())
            )
          : true;
        const success = phraseFound;
        cases.push({
          fixtureId: fixture.id,
          providerId: provider.id,
          success,
          expectedSuccess,
          expectationMatched: success === expectedSuccess,
          evidenceCount: result.evidence.length,
          phraseFound,
          latencyMs: Number((performance.now() - started).toFixed(3))
        });
      } catch (error) {
        cases.push({
          fixtureId: fixture.id,
          providerId: provider.id,
          success: false,
          expectedSuccess,
          expectationMatched: expectedSuccess === false,
          evidenceCount: 0,
          phraseFound: false,
          latencyMs: Number((performance.now() - started).toFixed(3)),
          ...(error instanceof EvidenceSliceError ? { errorCode: error.code } : {})
        });
      }
    }
  }

  return {
    evaluatedAt: "2026-08-30",
    mode: "fixtures",
    externalCostUsd: 0,
    expectationsMatched: cases.filter(item => item.expectationMatched).length,
    cases,
    providers: providers.map(provider => {
      const providerCases = cases.filter(item => item.providerId === provider.id);
      return {
        providerId: provider.id,
        successes: providerCases.filter(item => item.success).length,
        phraseMatches: providerCases.filter(item => item.phraseFound).length
      };
    })
  };
}
