import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { analyzeJobDescription } from "./analyze-job.js";
import { EvidenceSliceError } from "./evidence-error.js";
import { extractEvidence } from "./evidence-slice.js";

const PORT = Number(process.env.PORT ?? 4021);
const NETWORK = "eip155:84532" as const;
const ANALYZE_JOB_PRICE = "$0.01";
const EVIDENCE_SLICE_PRICE = "$0.003";
const EVIDENCE_SLICE_DESCRIPTION =
  "Extract query-relevant evidence from one public webpage. Use after search when you need supporting passages rather than an entire page. No signup or API key required.";
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
app.set("trust proxy", 1);
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "x402-lab",
    version: "0.1.0",
    network: NETWORK,
    paidEndpoint: "POST /analyze-job",
    price: ANALYZE_JOB_PRICE,
    paidEndpoints: [
      { method: "POST", path: "/analyze-job", price: ANALYZE_JOB_PRICE },
      {
        method: "POST",
        path: "/extract-evidence",
        price: EVIDENCE_SLICE_PRICE
      }
    ]
  });
});

app.use(
  paymentMiddleware(
    {
      "POST /analyze-job": {
        accepts: [
          {
            scheme: "exact",
            price: ANALYZE_JOB_PRICE,
            network: NETWORK,
            payTo
          }
        ],
        description:
          "Normalize a job title and extract recruiting-oriented skill and search signals.",
        mimeType: "application/json"
      },
      "POST /extract-evidence": {
        accepts: [
          {
            scheme: "exact",
            price: EVIDENCE_SLICE_PRICE,
            network: NETWORK,
            payTo
          }
        ],
        description: EVIDENCE_SLICE_DESCRIPTION,
        mimeType: "application/json",
        serviceName: "x402-lab",
        tags: ["evidence", "research", "extraction", "agents"],
        extensions: {
          ...declareDiscoveryExtension({
            bodyType: "json",
            input: {
              url: "https://example.com/",
              question: "What is this domain used for?"
            },
            inputSchema: {
              properties: {
                url: {
                  type: "string",
                  format: "uri",
                  description: "Absolute public HTTP(S) webpage URL."
                },
                question: {
                  type: "string",
                  minLength: 1,
                  description:
                    "Question used to rank passages from the page for relevance."
                }
              },
              required: ["url", "question"]
            },
            output: {
              example: {
                service: "x402-lab/evidence-slice",
                network: NETWORK,
                price: EVIDENCE_SLICE_PRICE,
                source: {
                  url: "https://example.com/",
                  title: "Example Domain",
                  retrievedAt: "2026-08-24T01:44:30.214Z",
                  contentHash:
                    "sha256:c98b4887d6d7251da51012d6341b698e028044d36909af5a2996b34922cb7c52"
                },
                question: "What is this domain used for?",
                evidence: [
                  {
                    text: "This domain is for use in documentation examples without needing permission. Avoid use in operations.",
                    score: 0.485
                  }
                ]
              }
            }
          })
        }
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
    price: ANALYZE_JOB_PRICE,
    analysis
  });
});

app.post("/extract-evidence", async (req, res) => {
  const url = typeof req.body?.url === "string" ? req.body.url : "";
  const question =
    typeof req.body?.question === "string" ? req.body.question : "";

  try {
    const result = await extractEvidence(url, question);

    res.json({
      service: "x402-lab/evidence-slice",
      network: NETWORK,
      price: EVIDENCE_SLICE_PRICE,
      ...result
    });
  } catch (error) {
    const evidenceError =
      error instanceof EvidenceSliceError
        ? error
        : new EvidenceSliceError(
            "FETCH_FAILED",
            "Evidence Slice could not process the public source.",
            true
          );

    res.status(evidenceError.status).json({
      error: {
        code: evidenceError.code,
        message: evidenceError.message,
        retryable: evidenceError.retryable
      }
    });
  }
});

const jsonBodyErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  const bodyError = error as { status?: number; type?: string };
  if (
    bodyError.type !== "entity.parse.failed" &&
    bodyError.type !== "entity.too.large"
  ) {
    next(error);
    return;
  }

  res.status(bodyError.status ?? 400).json({
    error: {
      code: "INVALID_INPUT",
      message:
        bodyError.type === "entity.too.large"
          ? "The JSON request body is too large."
          : "The request body must be valid JSON.",
      retryable: false
    }
  });
};

app.use(jsonBodyErrorHandler);

app.listen(PORT, () => {
  console.log(`x402-lab seller listening on http://localhost:${PORT}`);
  console.log(`free health: GET http://localhost:${PORT}/health`);
  console.log(
    `paid tool:   POST http://localhost:${PORT}/analyze-job (${ANALYZE_JOB_PRICE})`
  );
  console.log(
    `paid tool:   POST http://localhost:${PORT}/extract-evidence (${EVIDENCE_SLICE_PRICE})`
  );
  console.log(`network:     ${NETWORK} (Base Sepolia)`);
});
