import assert from "node:assert/strict";
import test from "node:test";
import {
  extractSourceText,
  rankPassages
} from "./evidence-slice.js";

test("ranks an obviously relevant passage first", () => {
  const relevant =
    "The company announced the factory closure on Thursday and said production will end in November.";
  const result = rankPassages(
    [
      "The company reported quarterly revenue and discussed its international sales outlook.",
      relevant,
      "Employees attended a community volunteer event earlier in the summer."
    ],
    "When was the factory closure announced?"
  );

  assert.equal(result[0]?.text, relevant);
  assert.ok((result[0]?.score ?? 0) > 0.5);
});

test("returns no evidence for an irrelevant question", () => {
  const result = rankPassages(
    [
      "The city council approved a new public park after a six-month planning process.",
      "Construction crews will add walking trails, trees, benches, and a small playground."
    ],
    "Which quantum battery chemistry powers the lunar spacecraft?"
  );

  assert.deepEqual(result, []);
});

test("returns at most three passages", () => {
  const result = rankPassages(
    Array.from(
      { length: 5 },
      (_, index) =>
        `Factory closure passage ${index + 1} says the closure was announced after the operational review.`
    ),
    "When was the factory closure announced?"
  );

  assert.equal(result.length, 3);
  assert.ok(result.every(passage => passage.score >= 0.28));
});

test("extracts visible HTML paragraphs and source title", () => {
  const extracted = extractSourceText(
    `<!doctype html>
      <html>
        <head>
          <title>Factory update</title>
          <style>.hidden { display: none }</style>
        </head>
        <body>
          <nav>This navigation text must not become evidence.</nav>
          <main>
            <p>The company announced the factory closure on Thursday after completing an operational review.</p>
            <p>Production will end in November, while customer deliveries will continue from another facility.</p>
            <script>doNotIncludeThisSecretText()</script>
          </main>
        </body>
      </html>`,
    "text/html",
    "https://public.example/news/factory-update"
  );

  assert.equal(extracted.title, "Factory update");
  assert.equal(extracted.passages.length, 2);
  assert.ok(extracted.normalizedContent.includes("Production will end"));
  assert.ok(!extracted.normalizedContent.includes("navigation"));
  assert.ok(!extracted.normalizedContent.includes("doNotInclude"));
});
