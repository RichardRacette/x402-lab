import assert from "node:assert/strict";
import test from "node:test";
import {
  createBuyerTracePreflight,
  renderBuyerTracePreflight
} from "./buyer-trace-preflight.js";

test("Buyer Trace preflight cannot spend or expose a payment execution path", () => {
  const preflight = createBuyerTracePreflight();

  assert.equal(preflight.mode, "DRY_RUN_ONLY");
  assert.equal(preflight.actualSpendUsd, 0);
  assert.equal(preflight.paymentExecutionAvailable, false);
  assert.ok(preflight.targets.every(target => !target.proposedRequest.sendsPayment));
  assert.match(renderBuyerTracePreflight(preflight), /NO PAYMENT MADE/);
});

test("public identifiers produce exact bounded unpaid requests", () => {
  const preflight = createBuyerTracePreflight();
  const addresses = new Set(preflight.targets.map(target => target.merchantAddress));

  assert.equal(preflight.targets.length, 3);
  assert.equal(addresses.size, 3);
  for (const target of preflight.targets) {
    assert.equal(target.identifierStatus, "RESOLVED_FROM_PUBLIC_EVIDENCE");
    assert.equal(target.proposedRequest.method, "GET");
    assert.match(
      target.proposedRequest.url,
      new RegExp(`/merchants/${target.merchantAddress}/transactions\\?`)
    );
    assert.match(target.proposedRequest.url, /page=0/);
    assert.match(target.proposedRequest.url, /page_size=100/);
    assert.match(target.proposedRequest.url, /chain=base/);
  }
});

test("captured challenge preserves current x402 payment requirements", () => {
  const requirement = createBuyerTracePreflight().x402scan.paymentRequirement;

  assert.equal(requirement.x402Version, 2);
  assert.equal(requirement.scheme, "exact");
  assert.equal(requirement.network, "eip155:8453");
  assert.equal(requirement.amountAtomic, "10000");
  assert.equal(requirement.priceUsd, 0.01);
  assert.equal(
    requirement.asset,
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  );
  assert.equal(
    requirement.payTo,
    "0x2EC4545f96A24876764bF2B04D54E66A1351bE71"
  );
  assert.equal(
    requirement.facilitator,
    "UNAVAILABLE_NOT_ADVERTISED_IN_CHALLENGE"
  );
});

test("page estimates are explicit and do not turn samples into full coverage", () => {
  const preflight = createBuyerTracePreflight();
  const pages = Object.fromEntries(
    preflight.targets.map(target => [
      target.id,
      target.approximateFullEnumerationPagesFromDatedAggregate
    ])
  );

  assert.deepEqual(pages, {
    "people-data-labs": 12,
    stableenrich: 530,
    blockrun: 80_000
  });
  assert.equal(preflight.x402scan.pagination.maximumPageSize, 100);
  assert.equal(preflight.x402scan.pagination.totalCountAvailable, false);
  assert.ok(
    preflight.targets.every(target =>
      target.paginationAndCoverageLimitations.some(item =>
        item.includes("one page supports only observed-sample metrics")
      )
    )
  );
});

test("recommended experiment is one People Data Labs page capped at one cent", () => {
  const preflight = createBuyerTracePreflight();

  assert.deepEqual(preflight.recommendedFirstExperiment, {
    targetId: "people-data-labs",
    proposedPaidRequestCount: 1,
    hardMaximumCostUsd: 0.01,
    requiresSeparateOwnerApproval: true
  });
  assert.match(renderBuyerTracePreflight(preflight), /HARD MAXIMUM COST: \$0\.01/);
});

test("compatibility gaps distinguish shopper policy from legacy protocol support", () => {
  const compatibility = createBuyerTracePreflight().currentClientCompatibility;

  assert.equal(compatibility.shopperGateway.status, "INCOMPATIBLE");
  assert.ok(
    compatibility.shopperGateway.gaps.some(gap => gap.includes("eip155:84532"))
  );
  assert.ok(
    compatibility.shopperGateway.gaps.some(gap => gap.includes("$0.003"))
  );
  assert.equal(compatibility.legacyBuyer.status, "INCOMPATIBLE");
  assert.ok(
    compatibility.legacyBuyer.compatibleElements.some(element =>
      element.includes("$0.05")
    )
  );
});

test("expected response evidence supports bounded metrics without overclaiming cross-seller behavior", () => {
  const response =
    createBuyerTracePreflight().x402scan.expectedSuccessfulResponse;

  assert.ok(response.transactionFields.includes("sender"));
  assert.ok(response.transactionFields.includes("recipient"));
  assert.ok(response.transactionFields.includes("amount"));
  assert.ok(response.transactionFields.includes("decimals"));
  assert.match(response.analysisSupport.buyerConcentration, /SUPPORTED/);
  assert.match(response.analysisSupport.repeatBuyerShare, /SUPPORTED/);
  assert.match(response.analysisSupport.crossSellerAnalysis, /INSUFFICIENT/);
});
