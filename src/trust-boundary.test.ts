import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { executeAuthorizedPurchase } from "./authorized-shopper.js";
import type {
  ShopperConfig,
  ShopperGatewayDependencies,
  ShopperRequest
} from "./shopper-gateway.js";
import {
  assertPurchaseAuthorization,
  ContextTrustError,
  fingerprintPurchaseIntent,
  markUntrusted,
  transformUntrusted,
  type PurchaseAuthorization
} from "./trust-boundary.js";

const request: ShopperRequest = {
  endpoint: "https://store.example/extract-evidence",
  sourceUrl: "https://external.example/page",
  question: "What evidence is relevant?"
};

function ownerAuthorization(
  target: ShopperRequest = request
): PurchaseAuthorization {
  return {
    version: 1,
    authority: "owner-cli",
    scope: "single-purchase",
    approvalSource: "explicit-local-cli-execute",
    requestFingerprint: fingerprintPurchaseIntent(target)
  };
}

function hasTrustCode(code: string): (error: unknown) => boolean {
  return error => error instanceof ContextTrustError && error.code === code;
}

test("decrypting external content does not upgrade its trust", () => {
  const ciphertext = markUntrusted(
    "opaque-ciphertext",
    "web",
    "https://external.example/page"
  );
  const plaintext = transformUntrusted(
    ciphertext,
    "aes-256-gcm-decrypt",
    "attacker-controlled instruction"
  );
  const parsed = transformUntrusted(
    plaintext,
    "json-parse",
    { instruction: plaintext.value }
  );

  assert.equal(plaintext.trust, "untrusted");
  assert.equal(parsed.trust, "untrusted");
  assert.equal(parsed.origin, "web");
  assert.equal(parsed.source, "https://external.example/page");
  assert.deepEqual(parsed.transformations, ["aes-256-gcm-decrypt", "json-parse"]);
});

test("purchase authorization is bound to the exact request", () => {
  const authorization = ownerAuthorization();

  assert.doesNotThrow(() => assertPurchaseAuthorization(request, authorization));
  assert.throws(
    () =>
      assertPurchaseAuthorization(
        { ...request, question: "A mutated question" },
        authorization
      ),
    hasTrustCode("AUTHORIZATION_MISMATCH")
  );
});

test("authorized shopper rejects a mismatched capability before raw gateway execution", async () => {
  const authorization = ownerAuthorization();
  let gatewayDependencyTouched = false;
  const dependencies = {
    fetchChallenge: async () => {
      gatewayDependencyTouched = true;
      throw new Error("Raw gateway must not run.");
    }
  } as unknown as ShopperGatewayDependencies;

  await assert.rejects(
    executeAuthorizedPurchase(
      {
        ...request,
        question: "Changed after approval",
        authorization
      },
      {} as ShopperConfig,
      dependencies
    ),
    hasTrustCode("AUTHORIZATION_MISMATCH")
  );
  assert.equal(gatewayDependencyTouched, false);
});

test("application code cannot bypass the authorized shopper entrypoint", async () => {
  const directory = new URL("./", import.meta.url);
  const entries = await readdir(directory, { withFileTypes: true });
  const rawGatewayAllowlist = new Set([
    "authorized-shopper.ts",
    "shopper-gateway.ts"
  ]);
  const authorityMintAllowlist = new Set([
    "shopper-cli.ts",
    "trust-boundary.ts"
  ]);

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
      continue;
    }

    const source = await readFile(new URL(entry.name, directory), "utf8");

    if (!rawGatewayAllowlist.has(entry.name)) {
      assert.equal(
        /\bexecutePurchase\b/.test(source),
        false,
        `${entry.name} bypasses the authorized shopper boundary.`
      );
    }

    if (!authorityMintAllowlist.has(entry.name)) {
      assert.equal(
        source.includes("explicit-local-cli-execute"),
        false,
        `${entry.name} attempts to mint owner CLI authority.`
      );
    }
  }
});
