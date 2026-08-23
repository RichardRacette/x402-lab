# First x402 transaction

Status: **completed successfully**

This is the permanent record of the first successful machine-to-machine purchase from x402-lab.

## Seller

- endpoint: `POST /analyze-job`
- environment: Base Sepolia (`eip155:84532`)
- x402 version: 2
- price: `$0.01` test USDC (`10,000` atomic units)
- receiving address: `0x36a4C8E542055c409bc9a020e7F1cf1F6E988732`

## Buyer

- client: local `src/client.ts` x402 buyer
- buyer wallet address: `0xf3A0CD066B47c9F82076655Ee2D40835399E3432`
- disposable test wallet: yes
- max-per-payment guardrail: `$0.05`

## Result

- date: 2026-08-23
- HTTP first response: `402 Payment Required`
- automatic retry: successful
- final HTTP status: `200`
- payment status: `settled`
- settlement success: `true`
- amount paid: `0.01` test USDC
- transaction hash: `0xd36cf4bb86fbdb97e3ccca01acdf4ea46edf5fd20a4580bf5ae64ab1344d48be`
- Base Sepolia block: `45874710`
- seller received payment: yes
- endpoint result returned: yes

Transaction explorer:

`https://sepolia.basescan.org/tx/0xd36cf4bb86fbdb97e3ccca01acdf4ea46edf5fd20a4580bf5ae64ab1344d48be`

## Endpoint result

```json
{
  "service": "x402-lab/analyze-job",
  "network": "eip155:84532",
  "price": "$0.01",
  "analysis": {
    "normalizedTitle": "Senior Software Engineer",
    "seniority": "senior",
    "skills": ["TypeScript", "AWS", "PostgreSQL", "Docker"],
    "searchTerms": [
      "Senior Software Engineer",
      "TypeScript",
      "AWS",
      "PostgreSQL",
      "Docker"
    ],
    "confidence": 0.95
  }
}
```

## What happened

A local automated buyer requested the paid endpoint. The seller returned an x402 v2 `402 Payment Required` challenge for Base Sepolia. The buyer recognized the payment requirement, remained within its `$0.05` spend guardrail, signed the authorization, retried automatically, and received the service response. The facilitator settled `0.01` test USDC from the disposable buyer to the controlled seller address. No human approval was required inside the transaction loop.

This proved the original x402-lab north-star milestone: an automated client can pay this service over x402, receive a useful result, and continue its task.

## What surprised us

The x402 protocol path itself was comparatively low-friction once configured. The most frustrating part of the experiment was obtaining test funds: one faucet path introduced account, API-key, and verification friction while a permissionless alternative reduced the task to network + address + send. That experience strengthened the project's product thesis that machine buyers will favor services that minimize total decision and transaction friction, not merely nominal price.

## Next change

Formalize **x402-lab Product Thesis v0.1** before adding another endpoint, model, MCP tool, deployment target, or mainnet configuration.

The governing thesis to preserve is:

> Reduce transaction friction so aggressively that choosing us becomes cheaper for the agent than thinking about alternatives.
