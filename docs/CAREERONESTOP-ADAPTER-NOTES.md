# CareerOneStop Adapter Notes — Role Reality V0

Status: **implementation reference for tonight's Codex session**

Date: **2026-08-24**

These notes intentionally reduce the CareerOneStop API surface to the minimum Role Reality V0 needs.

CareerOneStop changes API details over time; re-check official documentation when implementing or debugging.

## Authentication

Base API host:

`https://api.careeronestop.org`

Every request requires:

```http
Authorization: Bearer <CAREERONESTOP_API_TOKEN>
```

The registered CareerOneStop user ID also appears in endpoint paths.

Environment variables:

```text
CAREERONESTOP_USER_ID
CAREERONESTOP_API_TOKEN
```

Never log or return the bearer token.

## Proposed V0 call budget

Normal successful Role Reality fulfillment should aim for **three provider calls**:

1. occupation search / resolution
2. occupation details for wages + projections + alternate titles + skills + metadata
3. Jobs V2 count for a 30-day market-activity indicator

Do not add additional calls unless real sample quality requires them.

## Call 1 — resolve raw title to O*NET occupation

Official endpoint:

```text
GET /v1/occupation/{userId}/{keyword}/{dataLevelOnly}/{startRecord}/{limitRecord}
```

Suggested V0 parameters:

```text
dataLevelOnly=Y
startRecord=0
limitRecord=5
datasettype=onet
```

Relevant response fields:

```json
{
  "RecordCount": 1,
  "DidYouMean": "...",
  "AutoCorrection": "...",
  "Request": {
    "InputOccupation": "...",
    "InputOccupationCode": "...",
    "InputOccupationTitle": "..."
  },
  "OccupationList": [
    {
      "OnetTitle": "...",
      "OnetCode": "...",
      "OccupationDescription": "..."
    }
  ]
}
```

### Conservative mapping rule

Do not blindly select result #1.

Suggested behavior:

- normalize input title and returned `OnetTitle`
- if exactly one returned title is an exact normalized match -> `direct`
- if exactly one result exists but title is not exact -> allow `related` only if the product review accepts this behavior and return the mapping clearly
- if multiple materially plausible results exist with no clear exact match -> `AMBIGUOUS_OCCUPATION`
- if no result -> `NO_OCCUPATION_MATCH`

Do not use an LLM to resolve ambiguity in V0.

If the input is already a valid O*NET code, the implementation may safely shortcut resolution if tests cover it.

## Call 2 — get one occupation's market facts

Official endpoint:

```text
GET /v1/occupation/{userId}/{keyword}/{location}
```

Pass the resolved O*NET code as `keyword` rather than repeating the raw recruiter title.

Enable only the sections needed by V0:

```text
wages=true
alternateOnetTitles=true
projectedEmployment=true
skills=true
enableMetaData=true
```

Leave unrelated optional sections false/default.

Relevant top-level response:

```json
{
  "OccupationDetail": [],
  "RecordCount": 1,
  "DidYouMean": "...",
  "AutoCorrection": "...",
  "MetaData": {}
}
```

### Occupation identity

Use:

- `OnetTitle`
- `OnetCode`
- `OnetDescription` only if needed internally/debugging

### Wages

CareerOneStop exposes wage records under:

```text
Wages.NationalWagesList
Wages.StateWagesList
Wages.BLSAreaWagesList
```

Each wage record includes:

- `RateType`
- `Pct10`
- `Pct25`
- `Median`
- `Pct75`
- `Pct90`
- `Area`
- `AreaName`
- `StFips`

The response also returns `WageYear`.

#### V0 wage-selection rule

Prefer the most local annual/yearly wage row that clearly corresponds to the requested geography:

1. matching BLS-area annual/yearly row when available
2. matching state annual/yearly row
3. national annual/yearly row only as an explicit fallback

Return a `wageScope`/area name internally or in provenance so the product never calls a state/national benchmark "local."

Do **not** convert hourly wages to annual wages in V0 merely by multiplying by 2,080. Use an explicitly annual/yearly source row.

Treat non-numeric, missing, suppressed, or unexpected wage strings as null rather than guessing.

A robust parser should tolerate currency symbols and thousands separators but reject non-numeric sentinel values.

### Projections

Relevant fields:

```text
Projections.EstimatedYear
Projections.ProjectedYear
Projections.Projections[]
```

Rows can include:

- `StateName`
- `Stfips`
- `EstimatedEmployment`
- `ProjectedEmployment`
- `PerCentChange`
- `ProjectedAnnualJobOpening`
- `EstimatedYear`
- `ProjectedYear`

Select the row corresponding to the requested state when possible.

Do not present state projections as city-level projections.

If the correct row is unavailable, return null/insufficient data.

### Alternate titles

Use only bounded output from:

`AlternateTitles[]`

Cap the number returned to the buyer (for example 8–12) so the response remains decision-oriented rather than a dump.

### Skills

`SkillsDataList[]` includes:

- `ElementId`
- `ElementName`
- `ElementDescription`
- `DataValue`
- `Importance`

For V0, return only a small ranked/bounded set based on source importance/value where semantics are clear.

Do not invent a candidate-supply count from these skills.

### Metadata / source receipts

Preserve useful provider metadata:

- `Publisher`
- `Sponsor`
- `LastAccessDate`
- `CitationSuggested`
- each `DataSource` entry's name, URL, last update, vintage/version and citation

These fields are valuable product output, not implementation trivia.

## Call 3 — current job-market activity count

Official Jobs V2 endpoint:

```text
GET /v2/jobsearch/{userId}/{keyword}/{location}/{radius}/{sortColumns}/{sortOrder}/{startRecord}/{pageSize}/{days}
```

Use the resolved O*NET code as `keyword` when CareerOneStop supports it.

Suggested V0 request:

```text
location=<validated input>
radius=<0-100 input/default 50>
sortColumns=0
sortOrder=0
startRecord=0
pageSize=1
days=30
enableJobDescriptionSnippet=false
enableMetaData=true
```

The API returns:

```json
{
  "JobCount": "123",
  "ErrorMessage": "",
  "Jobs": [],
  "JobsKeywordLocations": {
    "Keyword": "...",
    "Location": "...",
    "IsValidLocation": true,
    "Radius": "...",
    "IsCode": true,
    "Title": "...",
    "LocationState": "..."
  },
  "MetaData": {}
}
```

### Important V0 rule

Use `JobCount` as a **recent market-activity / advertised-demand indicator** only.

Do not describe it as:

- number of unique employers
- number of unfilled positions
- labor demand divided by supply
- exact market competition

The count represents jobs returned by the provider's search definition/window.

Return the fixed `30`-day window and radius so its meaning is explicit.

Set `pageSize=1` unless a real sample demonstrates that inspecting individual jobs adds required value. We need the count, not a job feed.

## Data types are not trustworthy just because the JSON says "string"

The documented API returns many numeric values as strings.

Create strict parsing helpers:

```text
parseFiniteNumberOrNull
parseIntegerOrNull
parseMoneyOrNull
```

Behavior:

- strip only well-understood formatting such as `$` and commas
- reject empty strings
- reject `N/A`, `-`, suppressed, or unknown values
- reject Infinity/NaN
- never silently coerce bad data to zero

Zero and missing are economically different.

## Geography handling

CareerOneStop documents location inputs such as:

- `City, State`
- state abbreviation
- ZIP code

V0 should return the provider-normalized location information where possible.

Before making compensation claims, attach the actual wage scope selected:

- metro/BLS area
- state
- national fallback

Before making projection claims, attach the projection geography (usually state).

This avoids a false impression that every fact is measured at the same geographic level.

## Provider error mapping

Map upstream behavior into Role Reality errors rather than returning provider internals.

Suggested mapping:

### 401

`PROVIDER_NOT_CONFIGURED` or provider-auth configuration error; not retryable until operator fixes credentials.

### 400

Usually `INVALID_INPUT` / provider rejected request; inspect safely.

### 404 / empty record set

`NO_OCCUPATION_MATCH` or `INSUFFICIENT_MARKET_DATA` depending on call.

### 429 / 5xx / timeout

`PROVIDER_UNAVAILABLE`, retryable.

Do not leak token/user ID in error messages or logs.

## Timeout and call bounds

Recommended starting posture for validation:

- one overall Role Reality fulfillment deadline
- each provider call has an AbortSignal timeout
- max 3 ordinary provider calls per successful V0 request
- no automatic unbounded retry loop
- at most one deliberate retry for a clearly transient failure only if the total deadline remains bounded

Tests should verify timeout/abort behavior.

## Fixture design

Provider fixtures should mirror documented CareerOneStop response shapes, including numeric strings and metadata.

Create at least:

1. exact occupation match with BLS-area annual wages
2. state-only wage fallback
3. multiple ambiguous occupation matches
4. missing/suppressed wage values
5. valid projections
6. no projection row for requested state
7. Jobs V2 with `JobCount`
8. Jobs V2 invalid location
9. provider 429
10. provider 500/timeout

The domain engine tests should use normalized `RoleMarketFacts`, while adapter tests use these provider-shaped fixtures.

## V0 call-flow summary

```text
raw req
  ↓
validate U.S. input
  ↓
occupation keyword lookup
  ↓
exact/acceptable O*NET mapping OR stop for ambiguity
  ↓
occupation details (wages + projections + titles + skills + metadata)
  ↓
Jobs V2 count (30 days)
  ↓
normalize facts
  ↓
Role Reality deterministic rules
  ↓
source-backed packet
```

## Deliberately unused CareerOneStop APIs in first slice

Do not add these unless sample review proves a need:

- certification finder
- license finder
- training programs
- standalone LMI endpoint
- skills matcher
- tools/technology endpoint
- job-detail endpoint

The occupation-details response already packages many of the facts we need.

## Provider-source reminder

CareerOneStop's current developer documentation says API customers can integrate its quality-controlled data into their own experiences and states that data available through its APIs are open data under USDOL's Open Data Policy.

Preserve source/citation metadata and re-check terms/documentation before commercial mainnet launch.
