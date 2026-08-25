import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import type { QuestData, SensorReading } from "../types.js";

const execFile = promisify(execFileCallback);

export type ReadOnlyGit = (args: string[]) => Promise<string>;

async function defaultReadOnlyGit(args: string[]): Promise<string> {
  const result = await execFile("git", args, {
    windowsHide: true,
    timeout: 3_000,
  });
  return result.stdout.trim();
}

export async function scanQuest(
  packageJsonPath: string,
  runGit: ReadOnlyGit = defaultReadOnlyGit,
): Promise<SensorReading<QuestData>> {
  const [branch, head, status, packageRaw] = await Promise.all([
    runGit(["branch", "--show-current"]).catch(() => ""),
    runGit(["rev-parse", "HEAD"]).catch(() => ""),
    runGit(["status", "--porcelain"]).catch(() => "__UNKNOWN__"),
    readFile(packageJsonPath, "utf8").catch(() => "{}"),
  ]);
  const parsed = JSON.parse(packageRaw) as { scripts?: Record<string, string> };
  const scripts = parsed.scripts ?? {};
  const worktree =
    status === "__UNKNOWN__" ? "UNKNOWN" : status.length === 0 ? "CLEAN" : "DIRTY";

  return {
    sensorId: "quest-local-readonly",
    module: "QUEST",
    observedAt: new Date().toISOString(),
    source: "Local git and package metadata",
    scope: "Current branch, HEAD, worktree state, and locally declared issue context",
    evidenceRef: ".git + package.json",
    status: branch && head ? "OK" : "UNKNOWN",
    limitations: [
      "Test/typecheck availability is detected, but commands are not run by this sensor.",
      "Issue state is the approved local checkpoint context, not a live GitHub query.",
      "This optic is strictly read-only and does not mutate git or GitHub.",
    ],
    data: {
      branch: branch || null,
      head: head || null,
      worktree,
      checks: (["test", "typecheck"] as const).map((name) => ({
        name,
        state: scripts[name] ? "AVAILABLE_NOT_RUN" : "UNAVAILABLE",
        command: scripts[name] ? `npm run ${name}` : null,
      })),
      activeIssues: [
        {
          number: 15,
          title: "Machine Demand Observatory usefulness checkpoint",
          state: "CHECKPOINT_PASSED",
          url: "https://github.com/RichardRacette/x402-lab/issues/15",
        },
        {
          number: 16,
          title: "Kiroshi Optics Mk.1",
          state: "ACTIVE",
          url: "https://github.com/RichardRacette/x402-lab/issues/16",
        },
      ],
    },
  };
}
