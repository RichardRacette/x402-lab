import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import type { SensorBayData, SensorBayTool, SensorReading } from "../types.js";

const execFile = promisify(execFileCallback);

export type ExecutableFinder = (names: string[]) => Promise<string | null>;

async function defaultFinder(names: string[]): Promise<string | null> {
  for (const name of names) {
    try {
      const command = process.platform === "win32" ? "where.exe" : "which";
      const result = await execFile(command, [name], {
        windowsHide: true,
        timeout: 2_000,
      });
      const first = result.stdout.split(/\r?\n/u).find(Boolean);
      if (first) return first.trim();
    } catch {
      // Absence is an expected sensor result.
    }
  }
  return null;
}

const TOOL_DEFINITIONS: Array<Omit<SensorBayTool, "state" | "executable"> & { names: string[] }> = [
  {
    id: "sysinternals",
    category: "LOCAL_SYSTEM_TELEMETRY",
    names: ["procexp.exe", "tcpview.exe", "autoruns.exe"],
    capability: "Mature local Windows process, connection, or autorun inspection tools",
    policy: "DETECT ONLY — never launch, elevate, configure, or scan",
  },
  {
    id: "trivy",
    category: "DEPENDENCY_AND_IMAGE_POSTURE",
    names: ["trivy"],
    capability: "Local dependency, filesystem, and container posture sensing",
    policy: "DETECT ONLY — never launch or scan",
  },
  {
    id: "github-cli",
    category: "PROJECT_CONTEXT",
    names: ["gh"],
    capability: "Optional authenticated project and issue context",
    policy: "DETECT ONLY — never authenticate or mutate GitHub",
  },
  {
    id: "powershell",
    category: "LOCAL_AUTOMATION",
    names: ["pwsh", "powershell"],
    capability: "Read-only local workstation observations in future authorized sensors",
    policy: "DETECT ONLY — never alter PATH, settings, or system state",
  },
];

export async function scanSensorBay(
  findExecutable: ExecutableFinder = defaultFinder,
): Promise<SensorReading<SensorBayData>> {
  const tools = await Promise.all(
    TOOL_DEFINITIONS.map(async ({ names, ...definition }) => {
      const executable = await findExecutable(names);
      return {
        ...definition,
        state: executable ? ("AVAILABLE" as const) : ("NOT_DETECTED" as const),
        executable,
      };
    }),
  );

  return {
    sensorId: "sensor-bay-availability",
    module: "SENSOR_BAY",
    observedAt: new Date().toISOString(),
    source: "Local executable availability",
    scope: "Presence-only detection for explicitly bounded future optics",
    evidenceRef: "local PATH lookup",
    status: "OK",
    limitations: [
      "Availability does not mean a sensor is integrated or that evidence has been collected.",
      "No tools are installed, launched, elevated, configured, or used to scan.",
    ],
    data: {
      tools,
      futureCategories: [
        { category: "MARKET_DEMAND", state: "PRESENT" },
        { category: "PROJECT_STATE", state: "PRESENT" },
        { category: "BUYER_TRACE", state: "ABSENT" },
        { category: "RUNTIME_TELEMETRY", state: "ABSENT" },
        { category: "DEPENDENCY_POSTURE", state: "ABSENT" },
      ],
    },
  };
}
