const root = document.querySelector("#app");

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function append(parent, ...children) {
  parent.append(...children.filter(Boolean));
  return parent;
}

function compact(value) {
  if (value === undefined || value === null) return "UNKNOWN";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

function money(value) {
  if (value === undefined || value === null) return "UNKNOWN";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
}

function percent(value) {
  return value === undefined || value === null ? "UNKNOWN" : `${(value * 100).toFixed(1)}%`;
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "UNKNOWN";
}

function evidenceChip(source) {
  const map = {
    LIVE_CURRENT: ["LIVE / CURRENT", ""],
    LIVE_AGING: ["LIVE / AGING", "manual"],
    LIVE_STALE: ["LIVE / STALE", "stale"],
    DATED_MANUAL: ["DATED MANUAL", "manual"],
    SYNTHETIC_FIXTURE: ["SYNTHETIC FIXTURE", "fixture"],
  };
  const [label, kind] = map[source.evidenceState] ?? ["UNKNOWN", "unknown"];
  return node("span", `chip ${kind}`, label);
}

function metric(label, value, detail = "", unknown = false) {
  const box = node("div", `metric${unknown ? " unknown" : ""}`);
  append(box, node("small", "", label), node("strong", "", value));
  if (detail) append(box, node("em", "", detail));
  return box;
}

function title(eyebrow, heading, description) {
  const wrap = node("div", "optic-title");
  const words = node("div");
  append(words, node("p", "eyebrow", eyebrow), node("h2", "", heading));
  append(wrap, words, node("p", "", description));
  return wrap;
}

function renderStatus(snapshot) {
  const rail = node("section", "status-rail");
  const values = [
    ["OPTICAL STATE", snapshot.marketReading.status],
    ["OBSERVATORY SCHEMA", snapshot.marketReading.sourceVersion],
    ["SNAPSHOT GENERATED", dateTime(snapshot.generatedAt)],
    ["LIVE BUYER TRACE", snapshot.market.transactionEvidence.state === "AVAILABLE" ? "AVAILABLE" : "INSUFFICIENT DATA"],
  ];
  values.forEach(([label, value]) => {
    append(rail, append(node("div", "status-cell"), node("small", "", label), node("strong", "", value)));
  });
  return rail;
}

function renderSources(snapshot) {
  const stack = node("div", "source-stack");
  snapshot.market.sources.forEach((source) => {
    const card = node("article", "source-card");
    const head = node("div", "source-head");
    append(head, node("strong", "", source.provider), evidenceChip(source));
    append(
      card,
      head,
      node("p", "", `Observed ${dateTime(source.observedAt)} // ${Math.floor(source.ageHours)}h old // ${source.window.label}`),
      node("p", "", `${source.methodology.name}${source.methodology.version ? ` ${source.methodology.version}` : ""}`),
      node("p", "", source.limitations[0] ?? "No limitation supplied."),
    );
    append(stack, card);
  });
  return stack;
}

function renderMarket(snapshot) {
  const panel = node("section", "panel");
  const inner = node("div", "panel-inner");
  append(inner, title("MARKET OPTIC / MARKET SCAN", "Machine demand field", "Source methodology stays attached. No scoring. No invented certainty."));
  const layout = node("div", "market-layout");
  const economics = node("div", "subpanel");
  append(economics, node("h3", "", "ECOSYSTEM READINGS"));

  snapshot.market.ecosystems.forEach(({ snapshot: ecosystem, source }) => {
    const block = node("div");
    const heading = node("div", "source-head");
    append(heading, node("strong", "", source.provider), evidenceChip(source));
    const grid = node("div", "metric-grid");
    append(
      grid,
      metric("RAW TRANSACTIONS", compact(ecosystem.raw.transactions), "provider raw context", ecosystem.raw.transactions == null),
      metric("RAW VOLUME", money(ecosystem.raw.volumeUsd), "provider raw context", ecosystem.raw.volumeUsd == null),
      metric("ORGANIC-HEURISTIC VOLUME", money(ecosystem.organicHeuristic?.volumeUsd), "provider-defined heuristic — not proven independent commerce", ecosystem.organicHeuristic?.volumeUsd == null),
      metric("TOP-10 VOLUME SHARE", percent(ecosystem.publishedConcentration?.top10VolumeShare), "provider-published concentration", ecosystem.publishedConcentration?.top10VolumeShare == null),
    );
    append(block, heading, node("p", "note", `WINDOW // ${source.window.label}`), grid);
    economics.append(block);
  });

  const provenance = node("div", "subpanel");
  append(provenance, node("h3", "", "PROVENANCE CHANNELS"), renderSources(snapshot));
  append(layout, economics, provenance);
  append(inner, layout);
  panel.append(inner);
  return panel;
}

function metricResult(result, formatter = compact) {
  return result?.availability === "available" ? formatter(result.value) : "UNKNOWN";
}

function keyValue(label, value) {
  return append(node("div", "kv"), node("span", "", label), node("strong", "", value ?? "UNKNOWN"));
}

function renderTargetDetail(target) {
  const detail = node("div", "target-detail");
  const heading = node("div", "target-heading");
  const words = node("div");
  append(words, node("p", "eyebrow", `TARGET // ${target.merchant.id}`), node("h2", "", target.merchant.name ?? target.merchant.id), node("p", "", target.merchant.description ?? "Description unavailable."));
  append(heading, words, evidenceChip(target.source));
  detail.append(heading);

  const metrics = node("div", "metric-grid target-metrics");
  append(
    metrics,
    metric("UNIQUE BUYERS", compact(target.merchant.uniqueBuyers), "source-defined", target.merchant.uniqueBuyers == null),
    metric("TRANSACTIONS / BUYER", metricResult(target.analysis.metrics.transactionsPerBuyer), "aggregate deterministic metric", target.analysis.metrics.transactionsPerBuyer.availability !== "available"),
    metric("VOLUME / BUYER", metricResult(target.analysis.metrics.volumePerBuyer, money), "aggregate deterministic metric", target.analysis.metrics.volumePerBuyer.availability !== "available"),
    metric("TOP BUYER TX SHARE", target.analysis.transactionMetrics.availability === "available" ? percent(target.analysis.transactionMetrics.topBuyerTransactionShare) : "UNKNOWN", target.analysis.transactionMetrics.availability === "available" ? "transaction evidence" : "INSUFFICIENT DATA", target.analysis.transactionMetrics.availability !== "available"),
    metric("CROSS-SELLER BEHAVIOR", "UNKNOWN", "INSUFFICIENT LIVE TRACE DATA", true),
  );
  detail.append(metrics);

  const columns = node("div", "target-columns");
  const evidence = node("section", "subpanel");
  append(evidence, node("h3", "", "DEMAND SHAPE + PROVENANCE"));
  append(
    evidence,
    keyValue("Observed transactions", compact(target.merchant.transactions)),
    keyValue("Observed volume", money(target.merchant.volumeUsd)),
    keyValue("Average tx value", metricResult(target.analysis.metrics.averageTransactionValue, money)),
    keyValue("Source", target.source.provider),
    keyValue("Observed at", dateTime(target.source.observedAt)),
    keyValue("Methodology", target.source.methodology.name),
  );
  const flags = node("div", "flag-row");
  (target.analysis.flags.length ? target.analysis.flags : ["NO_FLAGS"]).forEach((flag) => flags.append(node("span", "chip", flag)));
  evidence.append(flags);

  const resources = node("section", "subpanel");
  append(resources, node("h3", "", "RESOURCES + HUMAN REVIEW"));
  if (target.resources.length) {
    target.resources.forEach((resource) => append(resources, keyValue(resource.name ?? resource.path ?? resource.id, resource.priceUsd == null ? "PRICE UNKNOWN" : money(resource.priceUsd))));
  } else {
    resources.append(keyValue("Resources / prices", "UNAVAILABLE"));
  }
  const card = target.opportunityCard;
  append(
    resources,
    keyValue("Decision", card?.decision ?? "UNAVAILABLE"),
    keyValue("Concentration caveat", card?.concentrationCaveat ?? "UNKNOWN"),
    keyValue("Buy vs build", card?.buyVsBuildHypothesis ?? "HUMAN_REVIEW_REQUIRED"),
    keyValue("Falsification test", card?.cheapestFalsificationTest ?? "HUMAN_REVIEW_REQUIRED"),
  );
  append(columns, evidence, resources);
  detail.append(columns);
  return detail;
}

function renderTargets(snapshot) {
  const panel = node("section", "panel target-optic");
  const head = node("div", "panel-inner");
  append(head, title("TARGET OPTIC / TARGET SCAN", "Selectable merchant evidence", `${snapshot.market.targets.length} normalized targets // manual and fixture evidence never masquerade as live`));
  panel.append(head);
  const grid = node("div", "target-grid");
  const list = node("nav", "target-list");
  list.setAttribute("aria-label", "Market targets");
  list.append(node("label", "", "SELECT TARGET CHANNEL"));
  const detailSlot = node("div");

  function select(target, button) {
    list.querySelectorAll("button").forEach((candidate) => candidate.classList.remove("active"));
    button.classList.add("active");
    detailSlot.replaceChildren(renderTargetDetail(target));
  }

  snapshot.market.targets.forEach((target, index) => {
    const button = node("button", "target-button");
    button.type = "button";
    append(button, node("span", "", target.merchant.name ?? target.merchant.id), node("small", "", target.source.dataMode), node("b", "", compact(target.merchant.transactions)));
    button.addEventListener("click", () => select(target, button));
    list.append(button);
    if (index === 0) select(target, button);
  });
  append(grid, list, detailSlot);
  panel.append(grid);
  return panel;
}

function renderSignals(snapshot) {
  const panel = node("section", "panel");
  append(panel, node("p", "eyebrow", "CORRELATION / FACTUAL BLOCKERS"), node("h2", "", "Signal stack"));
  const stack = node("div", "signal-stack");
  snapshot.signals.forEach((signal) => {
    append(stack, append(node("article", `signal ${signal.severity}`), node("strong", "", signal.title), node("p", "", signal.detail)));
  });
  panel.append(stack);
  return panel;
}

function renderQuest(snapshot) {
  const quest = snapshot.questReading.data;
  const panel = node("section", "panel");
  append(panel, node("p", "eyebrow", "QUEST OPTIC / READ-ONLY"), node("h2", "", "Project state"));
  append(
    panel,
    keyValue("Branch", quest.branch ?? "UNKNOWN"),
    keyValue("HEAD", quest.head ? quest.head.slice(0, 12) : "UNKNOWN"),
    keyValue("Worktree", quest.worktree),
    keyValue("Tests", quest.checks.find((check) => check.name === "test")?.state ?? "UNAVAILABLE"),
    keyValue("Typecheck", quest.checks.find((check) => check.name === "typecheck")?.state ?? "UNAVAILABLE"),
  );
  quest.activeIssues.forEach((issue) => panel.append(keyValue(`Issue #${issue.number}`, `${issue.state} // ${issue.title}`)));
  return panel;
}

function renderSensorBay(snapshot) {
  const panel = node("section", "panel");
  append(panel, node("p", "eyebrow", "SENSOR BAY / PRESENCE ONLY"), node("h2", "", "Future optics"));
  const categories = node("div", "flag-row");
  snapshot.sensorBayReading.data.futureCategories.forEach((category) => {
    categories.append(node("span", `chip ${category.state === "PRESENT" ? "" : "unknown"}`, `${category.category}: ${category.state}`));
  });
  panel.append(categories);
  snapshot.sensorBayReading.data.tools.forEach((tool) => {
    const row = node("div", "tool-row");
    const head = node("div");
    append(head, node("strong", "", tool.id), node("span", `chip ${tool.state === "AVAILABLE" ? "" : "unknown"}`, tool.state));
    append(row, head, node("p", "", `${tool.capability}. ${tool.policy}.`));
    panel.append(row);
  });
  return panel;
}

function render(snapshot) {
  root.replaceChildren();
  root.append(renderStatus(snapshot), renderMarket(snapshot), renderTargets(snapshot));
  const lower = node("section", "lower-grid");
  append(lower, renderSignals(snapshot), renderQuest(snapshot), renderSensorBay(snapshot));
  root.append(lower);
}

fetch("/snapshot.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`Snapshot request failed: HTTP ${response.status}`);
    return response.json();
  })
  .then((snapshot) => {
    if (snapshot.schemaVersion !== "kiroshi-optics/mk1") throw new Error("Unsupported Kiroshi snapshot schema.");
    render(snapshot);
  })
  .catch((error) => {
    root.replaceChildren(append(node("section", "boot panel"), node("p", "eyebrow error", "OPTICAL LINK ERROR"), node("h2", "", error.message)));
  });
