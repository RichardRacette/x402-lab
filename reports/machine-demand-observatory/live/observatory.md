# Machine Demand Observatory

Generated: 2026-08-24T23:54:28.642Z

> Internal product-discovery evidence. Product #2 remains unknown. Fixture data are analytical controls, not live-market claims.

## Sources and methodology

| Source | Mode | Observed | Window | Methodology | Limitations |
| --- | --- | --- | --- | --- | --- |
| x402stats | live | 2026-08-24T23:54:28.642Z | 30-day snapshot ending 2026-08-24 | x402stats raw and organic heuristic 2026-07-01.v1 | Buyer counts in the daily series are per-day and are not summed into a unique window buyer count. Cross-seller buyer overlap and merchant-level transaction histories are unavailable in this feed. Organic classification is a heuristic and may include sophisticated self-dealing or inherit indexer gaps. |
| x402scan public pages — manual research seed | manual | 2026-08-24T00:00:00.000Z | approximately 30-day public dashboard observations | human-researched public x402scan observations round-4-2026-08-24 | Approximate values may have changed since observation. Aggregate pages do not expose enough evidence to calculate buyer concentration or prove buyer independence. Missing volume, resource, price, network, and facilitator values remain unknown rather than zero. Use current source pages or authorized transaction-level evidence before making a product decision. |
| deterministic-fixture | fixture | 2026-08-24T00:00:00.000Z | synthetic 30-day window | deterministic-demand-shapes 1 | Synthetic fixture only; use it to verify analytics, never as market evidence. |

## Ecosystem context

| Source | Raw transactions | Raw volume | Raw buyers | Raw sellers | Organic-heuristic volume | Organic-heuristic sellers | Top-10 volume share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| x402stats-2026-08-24T23:54:28.642Z | 13143968 | 1241037.71 | UNKNOWN | 28621 | 1010013.41 | 74 | 76.1% |
| fixture-demand-shapes-v1 | 1000000 | 100000.00 | 10000 | 2000 | 55000.00 | 125 | 72.0% |

Raw and organic-heuristic values are intentionally not merged. `UNKNOWN` means the source did not provide a compatible value.

## Merchant demand shapes

| Merchant | Source mode | Transactions | Buyers | Tx/buyer | Volume/buyer | Top buyer tx share | Flags |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| BlockRun | manual | 8000000 | 625 | 12800.00 | 313.60 | UNKNOWN | BROAD_ADOPTION, BROAD_AND_REPEAT |
| StableEnrich | manual | 53000 | 501 | 105.79 | 3.19 | UNKNOWN | BROAD_ADOPTION, BROAD_AND_REPEAT |
| People Data Labs x402 access | manual | 1150 | 7 | 164.29 | 4.14 | UNKNOWN | CONCENTRATED_REPEAT |
| x402scan paid market-data API | manual | 1000 | 51 | 19.61 | 0.22 | UNKNOWN | BROAD_ADOPTION, BROAD_AND_REPEAT |
| 402utils | manual | 218 | 22 | 9.91 | UNKNOWN (missing-input) | UNKNOWN | BROAD_ADOPTION, BROAD_AND_REPEAT |
| AgenticFi | manual | 96 | 34 | 2.82 | UNKNOWN (missing-input) | UNKNOWN | BROAD_ADOPTION |
| Generic judgment/search/scrape utility catalog | manual | 0 | 0 | UNKNOWN (zero-denominator) | UNKNOWN (missing-input) | UNKNOWN | LOW_OBSERVED_DEMAND |
| Fixture — broad credential access | fixture | 120 | 24 | 5.00 | 5.00 | 4.2% | BROAD_ADOPTION, BROAD_AND_REPEAT |
| Fixture — few-buyer scarce data | fixture | 60 | 3 | 20.00 | 100.00 | 33.3% | CONCENTRATED_REPEAT |
| Fixture — broad low-repeat infrastructure | fixture | 30 | 25 | 1.20 | 3.00 | 6.7% | BROAD_ADOPTION |
| Fixture — large zero-demand catalog | fixture | 0 | 0 | UNKNOWN (zero-denominator) | UNKNOWN (zero-denominator) | UNKNOWN | LOW_OBSERVED_DEMAND |
| Fixture — single-buyer automation | fixture | 40 | 1 | 40.00 | 80.00 | 100.0% | CONCENTRATED_REPEAT, SINGLE_BUYER_DOMINANCE, CONCENTRATION_RISK |

## Buyer behavior

| Buyer | Source modes | Sellers | Transactions | Spend | Categories |
| --- | --- | ---: | ---: | ---: | --- |
| fixture-cross-seller-buyer | fixture | 2 | 7 | $10.00 | credential-access, infrastructure |

## Opportunity-card queue

### BlockRun

- Decision: **UNREVIEWED**
- Buyer breadth: 625 source-defined unique buyers in the stated window
- Repeat intensity: 12800.00
- Concentration caveat: UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.
- Current price band: UNKNOWN — human research required
- Buy-vs-build hypothesis: HUMAN_REVIEW_REQUIRED
- Lawful supply path: HUMAN_REVIEW_REQUIRED
- Rough unit economics: HUMAN_REVIEW_REQUIRED
- Cheapest falsification test: HUMAN_REVIEW_REQUIRED

### StableEnrich

- Decision: **UNREVIEWED**
- Buyer breadth: 501 source-defined unique buyers in the stated window
- Repeat intensity: 105.79
- Concentration caveat: UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.
- Current price band: UNKNOWN — human research required
- Buy-vs-build hypothesis: HUMAN_REVIEW_REQUIRED
- Lawful supply path: HUMAN_REVIEW_REQUIRED
- Rough unit economics: HUMAN_REVIEW_REQUIRED
- Cheapest falsification test: HUMAN_REVIEW_REQUIRED

### People Data Labs x402 access

- Decision: **UNREVIEWED**
- Buyer breadth: 7 source-defined unique buyers in the stated window
- Repeat intensity: 164.29
- Concentration caveat: UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.
- Current price band: UNKNOWN — human research required
- Buy-vs-build hypothesis: HUMAN_REVIEW_REQUIRED
- Lawful supply path: HUMAN_REVIEW_REQUIRED
- Rough unit economics: HUMAN_REVIEW_REQUIRED
- Cheapest falsification test: HUMAN_REVIEW_REQUIRED

### x402scan paid market-data API

- Decision: **UNREVIEWED**
- Buyer breadth: 51 source-defined unique buyers in the stated window
- Repeat intensity: 19.61
- Concentration caveat: UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.
- Current price band: $0.0100
- Buy-vs-build hypothesis: HUMAN_REVIEW_REQUIRED
- Lawful supply path: HUMAN_REVIEW_REQUIRED
- Rough unit economics: HUMAN_REVIEW_REQUIRED
- Cheapest falsification test: HUMAN_REVIEW_REQUIRED

### 402utils

- Decision: **UNREVIEWED**
- Buyer breadth: 22 source-defined unique buyers in the stated window
- Repeat intensity: 9.91
- Concentration caveat: UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.
- Current price band: UNKNOWN — human research required
- Buy-vs-build hypothesis: HUMAN_REVIEW_REQUIRED
- Lawful supply path: HUMAN_REVIEW_REQUIRED
- Rough unit economics: HUMAN_REVIEW_REQUIRED
- Cheapest falsification test: HUMAN_REVIEW_REQUIRED

## Interpretation guardrails

- No single opportunity score is calculated.
- Flags describe demand shapes; they do not prove buyer independence or product viability.
- BROAD_ADOPTION means at least 20 source-defined unique buyers; BROAD_AND_REPEAT additionally requires at least 5 transactions per buyer.
- CONCENTRATED_REPEAT means fewer than 20 source-defined buyers and at least 10 transactions per buyer.
- SINGLE_BUYER_DOMINANCE and CONCENTRATION_RISK require transaction-level records and top-buyer shares of at least 80% and 50%, respectively.
- Missing source values remain unknown and are not converted to zero.
- Live, manual, and fixture sources remain visibly distinct.
- Opportunity cards begin UNREVIEWED and require human competition, supply, economics, advantage, and falsification work.
- Attribution: x402stats — State of x402, x402stats.io.
