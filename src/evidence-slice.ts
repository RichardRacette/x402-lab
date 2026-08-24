import { createHash } from "node:crypto";
import { parseDocument } from "htmlparser2";
import { EvidenceSliceError } from "./evidence-error.js";
import {
  fetchPublicSource,
  type PublicSourceOptions
} from "./public-source.js";

const MAX_PASSAGES = 3;
const MIN_PASSAGE_LENGTH = 40;
const MAX_PASSAGE_LENGTH = 800;
const MIN_RELEVANCE_SCORE = 0.28;

const EXCLUDED_ELEMENTS = new Set([
  "canvas",
  "form",
  "head",
  "iframe",
  "nav",
  "noscript",
  "script",
  "style",
  "svg",
  "template"
]);

const PRIMARY_PASSAGE_ELEMENTS = new Set([
  "blockquote",
  "dd",
  "li",
  "p",
  "pre",
  "td"
]);

const FALLBACK_PASSAGE_ELEMENTS = new Set([
  "article",
  "div",
  "main",
  "section"
]);

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "did",
  "do",
  "does",
  "evidence",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "page",
  "question",
  "relevant",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with"
]);

interface HtmlNode {
  type: string;
  name?: string;
  data?: string;
  children?: HtmlNode[];
}

export interface EvidencePassage {
  text: string;
  score: number;
}

export interface ExtractedSource {
  title: string;
  normalizedContent: string;
  passages: string[];
}

export interface EvidenceSliceResult {
  source: {
    url: string;
    title: string;
    retrievedAt: string;
    contentHash: string;
  };
  question: string;
  evidence: EvidencePassage[];
}

export interface ExtractEvidenceOptions {
  source?: PublicSourceOptions;
  now?: () => Date;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function textContent(node: HtmlNode): string {
  if (node.type === "text") return node.data ?? "";
  if (node.name && EXCLUDED_ELEMENTS.has(node.name.toLowerCase())) return "";
  if (node.name?.toLowerCase() === "br") return " ";
  return (node.children ?? []).map(textContent).join(" ");
}

function hasPrimaryPassageDescendant(node: HtmlNode): boolean {
  return (node.children ?? []).some(child => {
    const name = child.name?.toLowerCase();
    if (name && EXCLUDED_ELEMENTS.has(name)) return false;
    if (name && PRIMARY_PASSAGE_ELEMENTS.has(name)) return true;
    return hasPrimaryPassageDescendant(child);
  });
}

function findFirstElement(node: HtmlNode, name: string): HtmlNode | undefined {
  if (node.name?.toLowerCase() === name) return node;
  for (const child of node.children ?? []) {
    const found = findFirstElement(child, name);
    if (found) return found;
  }
  return undefined;
}

function collectBlocks(node: HtmlNode, blocks: string[]): void {
  const name = node.name?.toLowerCase();
  if (name && EXCLUDED_ELEMENTS.has(name)) return;

  if (name && PRIMARY_PASSAGE_ELEMENTS.has(name)) {
    const text = normalizeWhitespace(textContent(node));
    if (text) blocks.push(text);
    return;
  }

  if (
    name &&
    FALLBACK_PASSAGE_ELEMENTS.has(name) &&
    !hasPrimaryPassageDescendant(node)
  ) {
    const text = normalizeWhitespace(textContent(node));
    if (text) blocks.push(text);
    return;
  }

  for (const child of node.children ?? []) collectBlocks(child, blocks);
}

function splitLongPassage(text: string): string[] {
  if (text.length <= MAX_PASSAGE_LENGTH) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const passages: string[] = [];
  let current = "";

  const flush = () => {
    const normalized = normalizeWhitespace(current);
    if (normalized) passages.push(normalized);
    current = "";
  };

  for (const sentence of sentences) {
    if (sentence.length > MAX_PASSAGE_LENGTH) {
      flush();
      let remainder = sentence;
      while (remainder.length > MAX_PASSAGE_LENGTH) {
        const boundary = remainder.lastIndexOf(" ", MAX_PASSAGE_LENGTH);
        const splitAt = boundary > 0 ? boundary : MAX_PASSAGE_LENGTH;
        passages.push(normalizeWhitespace(remainder.slice(0, splitAt)));
        remainder = remainder.slice(splitAt).trim();
      }
      current = remainder;
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > MAX_PASSAGE_LENGTH) flush();
    current = current ? `${current} ${sentence}` : sentence;
  }

  flush();
  return passages;
}

function finalizePassages(blocks: string[]): string[] {
  const unique = new Set<string>();

  for (const block of blocks) {
    for (const passage of splitLongPassage(normalizeWhitespace(block))) {
      if (passage.length >= MIN_PASSAGE_LENGTH) unique.add(passage);
    }
  }

  return [...unique];
}

function fallbackTitle(url: string): string {
  const parsed = new URL(url);
  const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
  if (!lastSegment) return parsed.hostname;

  try {
    const decoded = decodeURIComponent(lastSegment)
      .replace(/\.[a-z0-9]{1,8}$/i, "")
      .replace(/[-_]+/g, " ");
    return normalizeWhitespace(decoded) || parsed.hostname;
  } catch {
    return parsed.hostname;
  }
}

export function extractSourceText(
  text: string,
  contentType: "text/html" | "text/plain",
  sourceUrl: string
): ExtractedSource {
  let title = fallbackTitle(sourceUrl);
  let blocks: string[];

  if (contentType === "text/html") {
    const document = parseDocument(text) as unknown as HtmlNode;
    const titleNode = findFirstElement(document, "title");
    const parsedTitle = titleNode ? normalizeWhitespace(textContent(titleNode)) : "";
    if (parsedTitle) title = parsedTitle;

    blocks = [];
    collectBlocks(document, blocks);
    if (blocks.length === 0) {
      const bodyNode = findFirstElement(document, "body");
      const bodyText = bodyNode ? normalizeWhitespace(textContent(bodyNode)) : "";
      if (bodyText) blocks.push(bodyText);
    }
  } else {
    blocks = text.split(/\r?\n\s*\r?\n/).map(normalizeWhitespace).filter(Boolean);
  }

  const normalizedBlocks = blocks.map(normalizeWhitespace).filter(Boolean);
  const normalizedContent = normalizedBlocks.join("\n\n");
  if (!normalizedContent) {
    throw new EvidenceSliceError(
      "NO_READABLE_CONTENT",
      "The source did not contain readable paragraph text."
    );
  }

  return {
    title,
    normalizedContent,
    passages: finalizePassages(normalizedBlocks)
  };
}

function stemToken(token: string): string {
  if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokenize(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter(token => token.length >= 2 && !STOP_WORDS.has(token))
    .map(stemToken) ?? [];
}

export function rankPassages(
  passages: readonly string[],
  question: string
): EvidencePassage[] {
  const questionTokens = [...new Set(tokenize(question))];
  if (questionTokens.length === 0) return [];

  const ranked = passages
    .map((text, index) => {
      const passageTokens = tokenize(text);
      const passageTokenSet = new Set(passageTokens);
      const matchedTerms = questionTokens.filter(token => passageTokenSet.has(token));
      const matchedOccurrences = passageTokens.filter(token =>
        matchedTerms.includes(token)
      ).length;
      const coverage = matchedTerms.length / questionTokens.length;
      const density = Math.min(
        1,
        matchedOccurrences / Math.max(questionTokens.length, passageTokens.length * 0.25)
      );
      const score = Number((coverage * 0.85 + density * 0.15).toFixed(3));

      return { text, score, index };
    })
    .filter(result => result.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_PASSAGES);

  return ranked.map(({ text, score }) => ({ text, score }));
}

export async function extractEvidence(
  inputUrl: string,
  question: string,
  options: ExtractEvidenceOptions = {}
): Promise<EvidenceSliceResult> {
  if (
    typeof inputUrl !== "string" ||
    !inputUrl.trim() ||
    inputUrl.length > 2_048 ||
    typeof question !== "string" ||
    !question.trim() ||
    question.length > 1_000
  ) {
    throw new EvidenceSliceError(
      "INVALID_INPUT",
      "url and question are required strings within the Evidence Slice V0 limits."
    );
  }

  const normalizedQuestion = question.trim();
  const fetched = await fetchPublicSource(inputUrl.trim(), options.source);
  const extracted = extractSourceText(fetched.text, fetched.contentType, fetched.url);
  const contentHash = createHash("sha256")
    .update(extracted.normalizedContent)
    .digest("hex");

  return {
    source: {
      url: fetched.url,
      title: extracted.title,
      retrievedAt: (options.now ?? (() => new Date()))().toISOString(),
      contentHash: `sha256:${contentHash}`
    },
    question: normalizedQuestion,
    evidence: rankPassages(extracted.passages, normalizedQuestion)
  };
}
