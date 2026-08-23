import "dotenv/config";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { analyzeJobDescription } from "./analyze-job.js";

const PORT = Number(process.env.PORT ?? 4021);
const NETWORK = "eip155:84532" as const;
const PRICE = "$0.01";
const FACILITATOR_URL = "https://x402.org/facilitator";

const payTo = process.env.X402_PAY_TO;

if (!payTo || !/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
  throw new Error(
    "Set X402_PAY_TO in .env to a valid EVM receiving address before starting the seller."
  );
}

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL
});

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme()
);

const app = express();
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "x402-lab",
    version: "0.1.0",
    network: NETWORK,
    paidEndpoint: "POST /analyze-job",
    price: PRICE
  });
});

app.use(
  paymentMiddleware(
    {
      "POST /analyze-job": {
        accepts: [
          {
            scheme: "exact",
            price: PRICE,
            network: NETWORK,
            payTo
          }
        ],
        description:
          "Normalize a job title and extract recruiting-oriented skill and search signals.",
        mimeType: "application/json"
      }
    },
    resourceServer
  )
);

app.post("/analyze-job", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title : "";
  const description =
    typeof req.body?.description === "string" ? req.body.description : "";

  if (!title.trim() || !description.trim()) {
    res.status(400).json({
      error: "title and description are required strings"
    });
    return;
  }

  if (description.length > 50_000) {
    res.status(413).json({
      error: "description is too large"
    });
    return;
  }

  const analysis = analyzeJobDescription(title, description);

  res.json({
    service: "x402-lab/analyze-job",
    network: NETWORK,
    price: PRICE,
    analysis
  });
});

app.listen(PORT, () => {
  console.log(`x402-lab seller listening on http://localhost:${PORT}`);
  console.log(`free health: GET http://localhost:${PORT}/health`);
  console.log(`paid tool:   POST http://localhost:${PORT}/analyze-job`);
  console.log(`network:     ${NETWORK} (Base Sepolia)`);
  console.log(`price:       ${PRICE}`);
});
