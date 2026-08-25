import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { DEFAULT_SNAPSHOT_PATH, writeKiroshiSnapshot } from "./scan.js";

const HOST = "127.0.0.1";
const PORT = Number(process.env.KIROSHI_PORT ?? 4177);
const STATIC_ROOT = resolve("kiroshi");

const ROUTES = new Map([
  ["/", { path: resolve(STATIC_ROOT, "index.html"), type: "text/html; charset=utf-8" }],
  ["/app.js", { path: resolve(STATIC_ROOT, "app.js"), type: "text/javascript; charset=utf-8" }],
  ["/styles.css", { path: resolve(STATIC_ROOT, "styles.css"), type: "text/css; charset=utf-8" }],
  ["/snapshot.json", { path: DEFAULT_SNAPSHOT_PATH, type: "application/json; charset=utf-8" }],
]);

await writeKiroshiSnapshot();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);
  const route = ROUTES.get(url.pathname);
  if (!route || request.method !== "GET") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
    return;
  }
  try {
    const metadata = await stat(route.path);
    response.writeHead(200, {
      "content-type": route.type,
      "content-length": metadata.size,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    createReadStream(route.path).pipe(response);
  } catch {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Kiroshi artifact unavailable\n");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Kiroshi Optics Mk.1: http://${HOST}:${PORT}`);
  console.log("Read-only local viewer. Press Ctrl+C to stop.");
});
