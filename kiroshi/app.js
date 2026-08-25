const root = document.querySelector("#app");
const SVG_NS = "http://www.w3.org/2000/svg";

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

function percent(value) {
  return value === undefined || value === null ? "UNKNOWN" : `${(value * 100).toFixed(1)}%`;
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "UNKNOWN";
}

function displayToken(value) {
  if (value === "HUMAN_REVIEW_REQUIRED") return "NEEDS REVIEW";
  if (value === "AVAILABLE_NOT_RUN") return "AVAILABLE — NOT RUN";
  if (value === "INSUFFICIENT_DATA") return "INSUFFICIENT DATA";
  return value ?? "UNKNOWN";
}

function evidenceDescriptor(source) {
  const map = {
    LIVE_CURRENT: ["LIVE / CURRENT", "live"],
    LIVE_AGING: ["LIVE / AGING", "aging"],
    LIVE_STALE: ["LIVE / STALE", "stale"],
    DATED_MANUAL: ["DATED MANUAL", "manual"],
    SYNTHETIC_FIXTURE: ["SYNTHETIC FIXTURE", "fixture"],
  };
  return map[source.evidenceState] ?? ["UNKNOWN", "unknown"];
}

function evidenceChip(source) {
  const [label, kind] = evidenceDescriptor(source);
  return node("span", `chip ${kind}`, label);
}

function stateChip(label, kind) {
  return node("span", `chip ${kind}`, label);
}

function metric(label, value, detail = "", state = "") {
  const box = node("div", `metric ${state}`.trim());
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

function metricResult(result, formatter = compact) {
  return result?.availability === "available" ? formatter(result.value) : "UNKNOWN";
}

function keyValue(label, value, state = "") {
  return append(
    node("div", `kv ${state}`.trim()),
    node("span", "", label),
    node("strong", "", displayToken(value)),
  );
}

function flagLabel(flag) {
  return flag.replaceAll("_", " ");
}

function concentrationSummary(target) {
  const metrics = target.analysis.transactionMetrics;
  if (metrics.availability !== "available") {
    return { value: "INSUFFICIENT DATA", detail: "No transaction-level concentration evidence", state: "insufficient" };
  }
  return {
    value: `TOP BUYER ${percent(metrics.topBuyerTransactionShare)}`,
    detail: `Top 3 ${percent(metrics.top3BuyerTransactionShare)} // Top 5 ${percent(metrics.top5BuyerTransactionShare)}`,
    state: "available",
  };
}

function crossSellerSummary(target, snapshot) {
  const analyses = snapshot.marketReading.data.report.buyerAnalyses;
  const hasTrace = analyses.some(
    (buyer) => buyer.sourceIds.includes(target.source.id)
      && buyer.sellers.some((seller) => seller.sellerId === target.merchant.id),
  );
  if (!hasTrace) {
    return { value: "INSUFFICIENT DATA", detail: "Cross-seller buyer evidence unavailable", state: "insufficient" };
  }
  return target.source.dataMode === "fixture"
    ? { value: "AVAILABLE — SYNTHETIC", detail: "Calibration trace only; not market evidence", state: "fixture" }
    : { value: "AVAILABLE", detail: "Buyer analysis present in normalized export", state: "available" };
}

function evidenceGaps(target, snapshot) {
  const gaps = [];
  if (target.source.dataMode === "manual") gaps.push("Dated manual observation; refresh before a product decision.");
  if (target.source.dataMode === "fixture") gaps.push("Synthetic calibration control; not real market evidence.");
  if (target.merchant.uniqueBuyers == null) gaps.push("Unique-buyer breadth unavailable.");
  if (target.analysis.transactionMetrics.availability !== "available") gaps.push("Buyer concentration unavailable.");
  if (crossSellerSummary(target, snapshot).state === "insufficient") gaps.push("Cross-seller behavior unavailable.");
  if (!target.resources.length) gaps.push("Resource and price evidence unavailable.");
  if (!target.opportunityCard) gaps.push("Human opportunity review unavailable.");
  else if (
    target.opportunityCard.buyVsBuildHypothesis === "HUMAN_REVIEW_REQUIRED"
    || target.opportunityCard.cheapestFalsificationTest === "HUMAN_REVIEW_REQUIRED"
  ) gaps.push("Opportunity hypothesis and falsification test need human review.");
  return gaps.length ? gaps : ["No explicit display gap; source limitations still apply."];
}

function renderStatus(snapshot) {
  const rail = node("section", "status-rail");
  const values = [
    ["OPTICAL STATE", snapshot.marketReading.status, "live"],
    ["OBSERVATORY SCHEMA", snapshot.marketReading.sourceVersion, "live"],
    ["SNAPSHOT GENERATED", dateTime(snapshot.generatedAt), ""],
    [
      "LIVE BUYER TRACE",
      snapshot.market.transactionEvidence.state === "AVAILABLE" ? "AVAILABLE" : "INSUFFICIENT DATA",
      snapshot.market.transactionEvidence.state === "AVAILABLE" ? "live" : "insufficient",
    ],
  ];
  values.forEach(([label, value, state]) => {
    append(rail, append(node("div", `status-cell ${state}`.trim()), node("small", "", label), node("strong", "", value)));
  });
  return rail;
}

function renderSources(snapshot) {
  const stack = node("div", "source-stack");
  snapshot.market.sources.forEach((source) => {
    const card = node("article", `source-card source-${source.dataMode}`);
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
    const block = node("div", `ecosystem-block source-${source.dataMode}`);
    const heading = node("div", "source-head");
    append(heading, node("strong", "", source.provider), evidenceChip(source));
    const grid = node("div", "metric-grid");
    append(
      grid,
      metric("RAW TRANSACTIONS", compact(ecosystem.raw.transactions), "provider raw context", ecosystem.raw.transactions == null ? "unknown" : ""),
      metric("RAW VOLUME", money(ecosystem.raw.volumeUsd), "provider raw context", ecosystem.raw.volumeUsd == null ? "unknown" : ""),
      metric("ORGANIC-HEURISTIC VOLUME", money(ecosystem.organicHeuristic?.volumeUsd), "provider-defined heuristic — not proven independent commerce", ecosystem.organicHeuristic?.volumeUsd == null ? "unknown" : ""),
      metric("TOP-10 VOLUME SHARE", percent(ecosystem.publishedConcentration?.top10VolumeShare), "provider-published concentration", ecosystem.publishedConcentration?.top10VolumeShare == null ? "unknown" : ""),
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

function renderTargetDetail(target, snapshot) {
  const detail = node("div", "target-detail");
  const heading = node("div", "target-heading");
  const words = node("div");
  append(
    words,
    node("p", "eyebrow", `TARGET // ${target.merchant.id}`),
    node("h2", "", target.merchant.name ?? target.merchant.id),
    node("p", "", target.merchant.description ?? "Description unavailable."),
  );
  append(heading, words, evidenceChip(target.source));
  detail.append(heading);

  const concentration = concentrationSummary(target);
  const crossSeller = crossSellerSummary(target, snapshot);
  const metrics = node("div", "metric-grid target-metrics");
  append(
    metrics,
    metric("UNIQUE BUYERS", compact(target.merchant.uniqueBuyers), "source-defined", target.merchant.uniqueBuyers == null ? "unknown" : ""),
    metric("TRANSACTIONS / BUYER", metricResult(target.analysis.metrics.transactionsPerBuyer), "Observatory deterministic metric", target.analysis.metrics.transactionsPerBuyer.availability !== "available" ? "unknown" : ""),
    metric("VOLUME / BUYER", metricResult(target.analysis.metrics.volumePerBuyer, money), "Observatory deterministic metric", target.analysis.metrics.volumePerBuyer.availability !== "available" ? "unknown" : ""),
    metric("BUYER CONCENTRATION", concentration.value, concentration.detail, concentration.state),
    metric("CROSS-SELLER BEHAVIOR", crossSeller.value, crossSeller.detail, crossSeller.state),
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
  (target.analysis.flags.length ? target.analysis.flags : ["NO DESCRIPTIVE FLAGS"])
    .forEach((flag) => flags.append(stateChip(flagLabel(flag), "live")));
  evidence.append(flags);

  const resources = node("section", "subpanel review-panel");
  append(resources, node("h3", "", "RESOURCES + HUMAN REVIEW"));
  if (target.resources.length) {
    target.resources.forEach((resource) => append(
      resources,
      keyValue(
        resource.name ?? resource.path ?? resource.id,
        resource.priceUsd == null ? "PRICE UNKNOWN" : money(resource.priceUsd),
        resource.priceUsd == null ? "unknown" : "",
      ),
    ));
  } else {
    resources.append(keyValue("Resources / prices", "UNAVAILABLE", "unknown"));
  }
  const card = target.opportunityCard;
  append(
    resources,
    keyValue("Decision", card?.decision ?? "UNAVAILABLE"),
    keyValue("Concentration caveat", card?.concentrationCaveat ?? "UNKNOWN", card ? "" : "unknown"),
    keyValue("Buy vs build", card?.buyVsBuildHypothesis ?? "HUMAN_REVIEW_REQUIRED", "review"),
    keyValue("Falsification test", card?.cheapestFalsificationTest ?? "HUMAN_REVIEW_REQUIRED", "review"),
  );
  append(columns, evidence, resources);
  detail.append(columns);
  return detail;
}

function targetButton(target, onSelect) {
  const button = node("button", `target-button source-${target.source.dataMode}`);
  button.type = "button";
  button.dataset.targetId = target.merchant.id;
  const [evidenceLabel] = evidenceDescriptor(target.source);
  append(
    button,
    node("span", "", target.merchant.name ?? target.merchant.id),
    node("small", "", evidenceLabel),
    node("b", "", compact(target.merchant.transactions)),
  );
  button.addEventListener("click", () => onSelect(target.merchant.id));
  return button;
}

function createTargetController(snapshot) {
  const panel = node("section", "panel target-optic");
  panel.id = "target-scan";
  const head = node("div", "panel-inner");
  append(head, title("TARGET OPTIC / TARGET SCAN", "Selectable merchant evidence", `${snapshot.market.targets.length} targets // research evidence and calibration controls are separated`));
  panel.append(head);

  const grid = node("div", "target-grid");
  const list = node("nav", "target-list");
  list.setAttribute("aria-label", "Market targets");
  const detailSlot = node("div");
  const targetsById = new Map(snapshot.market.targets.map((target) => [target.merchant.id, target]));
  const buttonsById = new Map();
  const observedTargets = snapshot.market.targets.filter((target) => target.source.dataMode !== "fixture");
  const fixtureTargets = snapshot.market.targets.filter((target) => target.source.dataMode === "fixture");
  let fixtureDetails;

  function select(targetId, options = {}) {
    const target = targetsById.get(targetId);
    const button = buttonsById.get(targetId);
    if (!target || !button) return;
    if (target.source.dataMode === "fixture" && fixtureDetails) fixtureDetails.open = true;
    buttonsById.forEach((candidate) => candidate.classList.remove("active"));
    button.classList.add("active");
    button.setAttribute("aria-current", "true");
    buttonsById.forEach((candidate) => {
      if (candidate !== button) candidate.removeAttribute("aria-current");
    });
    detailSlot.replaceChildren(renderTargetDetail(target, snapshot));
    if (options.focus) button.focus();
    if (options.scroll) panel.scrollIntoView({ block: "start" });
  }

  const observedHeading = node("div", "target-group-heading");
  append(observedHeading, node("span", "", "OBSERVED / RESEARCH EVIDENCE"), stateChip(`${observedTargets.length} TARGETS`, "manual"));
  list.append(observedHeading);
  observedTargets.forEach((target) => {
    const button = targetButton(target, select);
    buttonsById.set(target.merchant.id, button);
    list.append(button);
  });

  fixtureDetails = node("details", "fixture-targets");
  const summary = node("summary", "");
  append(
    summary,
    node("span", "", "SYNTHETIC CALIBRATION CONTROLS"),
    stateChip(`${fixtureTargets.length} TEST TARGETS`, "fixture"),
  );
  fixtureDetails.append(summary, node("p", "fixture-warning", "TEST EVIDENCE ONLY — hidden by default and never a live-market claim."));
  fixtureTargets.forEach((target) => {
    const button = targetButton(target, select);
    buttonsById.set(target.merchant.id, button);
    fixtureDetails.append(button);
  });
  list.append(fixtureDetails);

  list.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const visibleButtons = [...list.querySelectorAll("button")].filter((button) => button.offsetParent !== null);
    const index = visibleButtons.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    visibleButtons[(index + direction + visibleButtons.length) % visibleButtons.length].focus();
  });

  append(grid, list, detailSlot);
  panel.append(grid);
  const initial = observedTargets[0] ?? fixtureTargets[0];
  if (initial) select(initial.merchant.id);
  return { panel, select };
}

function targetOptionGroups(select, targets) {
  const observed = node("optgroup");
  observed.label = "Observed / research evidence";
  const fixtures = node("optgroup");
  fixtures.label = "Synthetic calibration controls";
  targets.forEach((target) => {
    const option = node("option", "", target.merchant.name ?? target.merchant.id);
    option.value = target.merchant.id;
    (target.source.dataMode === "fixture" ? fixtures : observed).append(option);
  });
  append(select, observed, fixtures);
}

function comparisonFields(target, snapshot) {
  const concentration = concentrationSummary(target);
  const crossSeller = crossSellerSummary(target, snapshot);
  return [
    ["PROVENANCE", evidenceDescriptor(target.source)[0]],
    ["SOURCE", target.source.provider],
    ["UNIQUE BUYERS", compact(target.merchant.uniqueBuyers)],
    ["TRANSACTIONS", compact(target.merchant.transactions)],
    ["TRANSACTIONS / BUYER", metricResult(target.analysis.metrics.transactionsPerBuyer)],
    ["VOLUME", money(target.merchant.volumeUsd)],
    ["VOLUME / BUYER", metricResult(target.analysis.metrics.volumePerBuyer, money)],
    ["AVERAGE TRANSACTION", metricResult(target.analysis.metrics.averageTransactionValue, money)],
    ["DEMAND-SHAPE FLAGS", target.analysis.flags.length ? target.analysis.flags.map(flagLabel).join(" · ") : "NO DESCRIPTIVE FLAGS"],
    ["BUYER CONCENTRATION", `${concentration.value} — ${concentration.detail}`],
    ["CROSS-SELLER EVIDENCE", `${crossSeller.value} — ${crossSeller.detail}`],
    ["STRONGEST EVIDENCE GAPS", evidenceGaps(target, snapshot).slice(0, 3).join(" · ")],
  ];
}

function renderCompare(snapshot, targetController) {
  const panel = node("section", "panel compare-optic");
  const inner = node("div", "panel-inner");
  append(inner, title("COMPARE OPTIC / DESCRIPTIVE ONLY", "Two-target calibration", "Side-by-side evidence with no score, rank, or hidden compatibility claim."));
  const controls = node("div", "compare-controls");
  const selectA = node("select");
  const selectB = node("select");
  selectA.setAttribute("aria-label", "Compare target A");
  selectB.setAttribute("aria-label", "Compare target B");
  targetOptionGroups(selectA, snapshot.market.targets);
  targetOptionGroups(selectB, snapshot.market.targets);
  const observed = snapshot.market.targets.filter((target) => target.source.dataMode !== "fixture");
  selectA.value = (observed[0] ?? snapshot.market.targets[0])?.merchant.id ?? "";
  selectB.value = (observed[1] ?? observed[0] ?? snapshot.market.targets[1])?.merchant.id ?? "";
  append(
    controls,
    append(node("label", ""), node("span", "", "TARGET A"), selectA),
    node("span", "compare-crosshair", "×"),
    append(node("label", ""), node("span", "", "TARGET B"), selectB),
  );
  const compatibility = node("div", "methodology-warning");
  const table = node("div", "compare-table");

  function update() {
    const left = snapshot.market.targets.find((target) => target.merchant.id === selectA.value);
    const right = snapshot.market.targets.find((target) => target.merchant.id === selectB.value);
    if (!left || !right) return;
    const sameMethodology = left.source.id === right.source.id
      && left.source.methodology.name === right.source.methodology.name
      && left.source.methodology.version === right.source.methodology.version;
    compatibility.className = `methodology-warning ${sameMethodology ? "same" : "different"}`;
    compatibility.textContent = sameMethodology
      ? "SAME SOURCE CONTEXT — descriptive comparison only; this is not an opportunity score."
      : "METHODOLOGY DIFFERENCE — sources/windows may be incompatible. Values are shown side-by-side, not normalized into a verdict.";

    const leftFields = comparisonFields(left, snapshot);
    const rightFields = new Map(comparisonFields(right, snapshot));
    table.replaceChildren();
    const header = node("div", "compare-row compare-header");
    append(
      header,
      node("strong", "", "READOUT"),
      append(node("div", ""), node("strong", "", left.merchant.name ?? left.merchant.id), evidenceChip(left.source)),
      append(node("div", ""), node("strong", "", right.merchant.name ?? right.merchant.id), evidenceChip(right.source)),
    );
    table.append(header);
    leftFields.forEach(([label, leftValue]) => {
      const row = node("div", "compare-row");
      append(
        row,
        node("span", "compare-label", label),
        node("span", "compare-value", displayToken(leftValue)),
        node("span", "compare-value", displayToken(rightFields.get(label))),
      );
      table.append(row);
    });

    const actions = node("div", "compare-actions");
    const inspectA = node("button", "optic-button", "OPEN TARGET A");
    const inspectB = node("button", "optic-button", "OPEN TARGET B");
    inspectA.type = "button";
    inspectB.type = "button";
    inspectA.addEventListener("click", () => targetController.select(left.merchant.id, { scroll: true }));
    inspectB.addEventListener("click", () => targetController.select(right.merchant.id, { scroll: true }));
    append(actions, inspectA, inspectB);
    table.append(actions);
  }

  selectA.addEventListener("change", update);
  selectB.addEventListener("change", update);
  append(inner, controls, compatibility, table);
  panel.append(inner);
  update();
  return panel;
}

function logTicks(minLog, maxLog) {
  const ticks = [];
  for (let exponent = Math.ceil(minLog); exponent <= Math.floor(maxLog); exponent += 1) {
    ticks.push(10 ** exponent);
  }
  return ticks;
}

function renderBreadthRepeat(snapshot, targetController) {
  const panel = node("section", "panel plot-optic");
  const inner = node("div", "panel-inner");
  append(inner, title("BREADTH × REPEAT / DESCRIPTIVE MAP", "Who is broad, who repeats?", "Logarithmic axes reveal demand shapes across very different scales. No rank or score."));
  const toolbar = node("div", "plot-toolbar");
  const legend = node("div", "plot-legend");
  append(
    legend,
    append(node("span", "legend-item"), node("i", "legend-dot live"), node("span", "", "LIVE / CURRENT")),
    append(node("span", "legend-item"), node("i", "legend-dot manual"), node("span", "", "DATED MANUAL")),
    append(node("span", "legend-item"), node("i", "legend-dot fixture"), node("span", "", "SYNTHETIC FIXTURE")),
  );
  const fixtureToggle = node("input");
  fixtureToggle.type = "checkbox";
  fixtureToggle.id = "show-fixture-points";
  const toggleLabel = node("label", "fixture-toggle");
  toggleLabel.htmlFor = fixtureToggle.id;
  append(toggleLabel, fixtureToggle, node("span", "", "SHOW SYNTHETIC CALIBRATION POINTS"));
  append(toolbar, legend, toggleLabel);
  const chartSlot = node("div", "chart-slot");

  function draw() {
    const candidates = snapshot.market.targets.filter((target) => {
      if (target.source.dataMode === "fixture" && !fixtureToggle.checked) return false;
      const repeat = target.analysis.metrics.transactionsPerBuyer;
      return target.merchant.uniqueBuyers > 0
        && repeat.availability === "available"
        && repeat.value > 0;
    });
    const unavailableCount = snapshot.market.targets.filter((target) => {
      if (target.source.dataMode === "fixture" && !fixtureToggle.checked) return false;
      const repeat = target.analysis.metrics.transactionsPerBuyer;
      return !(target.merchant.uniqueBuyers > 0 && repeat.availability === "available" && repeat.value > 0);
    }).length;
    const syntheticHidden = !fixtureToggle.checked
      ? snapshot.market.targets.filter((target) => target.source.dataMode === "fixture").length
      : 0;

    const width = 960;
    const height = 420;
    const margin = { top: 28, right: 36, bottom: 62, left: 86 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const xValues = candidates.map((target) => target.merchant.uniqueBuyers);
    const yValues = candidates.map((target) => target.analysis.metrics.transactionsPerBuyer.value);
    const xMin = Math.floor(Math.log10(Math.min(...xValues)));
    const xMax = Math.ceil(Math.log10(Math.max(...xValues)));
    const yMin = Math.floor(Math.log10(Math.min(...yValues)));
    const yMax = Math.ceil(Math.log10(Math.max(...yValues)));
    const xSpan = Math.max(1, xMax - xMin);
    const ySpan = Math.max(1, yMax - yMin);
    const xPosition = (value) => margin.left + ((Math.log10(value) - xMin) / xSpan) * plotWidth;
    const yPosition = (value) => margin.top + plotHeight - ((Math.log10(value) - yMin) / ySpan) * plotHeight;
    const svg = svgNode("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Breadth by repeat scatter plot with logarithmic unique-buyer and transactions-per-buyer axes",
    });

    logTicks(xMin, xMax).forEach((tick) => {
      const x = xPosition(tick);
      svg.append(
        svgNode("line", { x1: x, x2: x, y1: margin.top, y2: margin.top + plotHeight, class: "plot-grid" }),
        Object.assign(svgNode("text", { x, y: height - 34, class: "plot-tick", "text-anchor": "middle" }), { textContent: compact(tick) }),
      );
    });
    logTicks(yMin, yMax).forEach((tick) => {
      const y = yPosition(tick);
      svg.append(
        svgNode("line", { x1: margin.left, x2: margin.left + plotWidth, y1: y, y2: y, class: "plot-grid" }),
        Object.assign(svgNode("text", { x: margin.left - 14, y: y + 4, class: "plot-tick", "text-anchor": "end" }), { textContent: compact(tick) }),
      );
    });
    const xLabel = svgNode("text", { x: margin.left + plotWidth / 2, y: height - 8, class: "plot-axis-label", "text-anchor": "middle" });
    xLabel.textContent = "UNIQUE BUYERS — LOG SCALE";
    const yLabel = svgNode("text", { x: 18, y: margin.top + plotHeight / 2, class: "plot-axis-label", transform: `rotate(-90 18 ${margin.top + plotHeight / 2})`, "text-anchor": "middle" });
    yLabel.textContent = "TRANSACTIONS / BUYER — LOG SCALE";
    svg.append(xLabel, yLabel);

    candidates.forEach((target, index) => {
      const repeat = target.analysis.metrics.transactionsPerBuyer.value;
      const x = xPosition(target.merchant.uniqueBuyers);
      const y = yPosition(repeat);
      const [, provenanceClass] = evidenceDescriptor(target.source);
      const point = svgNode("g", {
        class: `plot-point ${provenanceClass}`,
        role: "button",
        tabindex: "0",
        "aria-label": `${target.merchant.name ?? target.merchant.id}: ${target.merchant.uniqueBuyers} unique buyers, ${repeat.toFixed(2)} transactions per buyer, ${evidenceDescriptor(target.source)[0]}`,
      });
      const circle = svgNode("circle", { cx: x, cy: y, r: target.source.dataMode === "fixture" ? 6 : 7 });
      const pointTitle = svgNode("title");
      pointTitle.textContent = `${target.merchant.name ?? target.merchant.id}\n${target.merchant.uniqueBuyers} buyers × ${repeat.toFixed(2)} tx/buyer\n${evidenceDescriptor(target.source)[0]}`;
      circle.append(pointTitle);
      point.append(circle);
      if (target.source.dataMode !== "fixture") {
        const label = svgNode("text", {
          x: x + 10,
          y: y + (index % 2 === 0 ? -9 : 16),
          class: "plot-label",
        });
        label.textContent = target.merchant.name ?? target.merchant.id;
        point.append(label);
      }
      const inspect = () => targetController.select(target.merchant.id, { scroll: true });
      point.addEventListener("click", inspect);
      point.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inspect();
        }
      });
      svg.append(point);
    });

    const note = node("p", "plot-note", `${candidates.length} plotted // ${unavailableCount} excluded because breadth or repeat is missing/zero${syntheticHidden ? ` // ${syntheticHidden} synthetic controls hidden` : ""}. Missing values are not plotted as zero.`);
    chartSlot.replaceChildren(svg, note);
  }

  fixtureToggle.addEventListener("change", draw);
  append(inner, toolbar, chartSlot);
  panel.append(inner);
  draw();
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
    keyValue("Tests", displayToken(quest.checks.find((check) => check.name === "test")?.state) ?? "UNAVAILABLE"),
    keyValue("Typecheck", displayToken(quest.checks.find((check) => check.name === "typecheck")?.state) ?? "UNAVAILABLE"),
  );
  quest.activeIssues.forEach((issue) => panel.append(keyValue(`Issue #${issue.number}`, `${issue.state} // ${issue.title}`)));
  return panel;
}

function renderSensorBay(snapshot) {
  const panel = node("section", "panel");
  append(panel, node("p", "eyebrow", "SENSOR BAY / PRESENCE ONLY"), node("h2", "", "Future optics"));
  const categories = node("div", "flag-row");
  snapshot.sensorBayReading.data.futureCategories.forEach((category) => {
    categories.append(stateChip(`${category.category}: ${category.state}`, category.state === "PRESENT" ? "live" : "unknown"));
  });
  panel.append(categories);
  snapshot.sensorBayReading.data.tools.forEach((tool) => {
    const row = node("div", "tool-row");
    const head = node("div");
    append(head, node("strong", "", tool.id), stateChip(tool.state, tool.state === "AVAILABLE" ? "live" : "unknown"));
    append(row, head, node("p", "", `${tool.capability}. ${tool.policy}.`));
    panel.append(row);
  });
  return panel;
}

function render(snapshot) {
  root.replaceChildren();
  const targetController = createTargetController(snapshot);
  root.append(
    renderStatus(snapshot),
    renderMarket(snapshot),
    targetController.panel,
    renderCompare(snapshot, targetController),
    renderBreadthRepeat(snapshot, targetController),
  );
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
