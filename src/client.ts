import "dotenv/config";
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;
const apiUrl = process.env.X402_API_URL ?? "http://localhost:4021";

if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
  throw new Error(
    "Set EVM_PRIVATE_KEY in .env to a disposable Base Sepolia buyer wallet private key."
  );
}

const signer = privateKeyToAccount(privateKey);

const client = new x402Client();
client.setSpendControls({
  maxAmountPerPayment: "$0.05"
});
client.register("eip155:*", new ExactEvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const httpClient = new x402HTTPClient(client);

console.log(`buyer wallet: ${signer.address}`);
console.log(`calling: ${apiUrl}/analyze-job`);

const response = await fetchWithPayment(`${apiUrl}/analyze-job`, {
  method: "POST",
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify({
    title: "Senior Software Engineer - Remote",
    description:
      "Build TypeScript APIs on AWS using PostgreSQL and Docker. Partner with product teams and mentor engineers."
  })
});

const result = await httpClient.processResponse(response);

console.log("HTTP status:", response.status);
console.dir(result, { depth: null });

if (!response.ok) {
  process.exitCode = 1;
}
