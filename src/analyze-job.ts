export type Seniority =
  | "intern"
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "director"
  | "executive"
  | "unknown";

export interface JobAnalysis {
  normalizedTitle: string;
  seniority: Seniority;
  skills: string[];
  searchTerms: string[];
  confidence: number;
}

const SKILLS: Array<[RegExp, string]> = [
  [/\btypescript\b/i, "TypeScript"],
  [/\bjavascript\b/i, "JavaScript"],
  [/\bpython\b/i, "Python"],
  [/\bjava\b/i, "Java"],
  [/\bc#\b/i, "C#"],
  [/\breact\b/i, "React"],
  [/\bnext\.?js\b/i, "Next.js"],
  [/\bnode\.?js\b/i, "Node.js"],
  [/\baws\b|amazon web services/i, "AWS"],
  [/\bazure\b/i, "Azure"],
  [/\bgcp\b|google cloud/i, "Google Cloud"],
  [/\bpostgres(?:ql)?\b/i, "PostgreSQL"],
  [/\bmysql\b/i, "MySQL"],
  [/\bsql\b/i, "SQL"],
  [/\bdocker\b/i, "Docker"],
  [/\bkubernetes\b|\bk8s\b/i, "Kubernetes"],
  [/\bterraform\b/i, "Terraform"],
  [/\bsap\b/i, "SAP"],
  [/\bworkday\b/i, "Workday"],
  [/\bsuccessfactors\b/i, "SuccessFactors"],
  [/\bsmartrecruiters\b/i, "SmartRecruiters"],
  [/\bgreenhouse\b/i, "Greenhouse"],
  [/\bpower bi\b/i, "Power BI"],
  [/\btableau\b/i, "Tableau"],
  [/\bexcel\b/i, "Excel"],
  [/\bsupply chain\b/i, "Supply Chain"],
  [/\bfood safety\b|\bfsqa\b/i, "Food Safety / FSQA"]
];

function detectSeniority(text: string): Seniority {
  const checks: Array<[RegExp, Seniority]> = [
    [/\b(chief|ceo|cto|cio|cfo|coo|vp|vice president)\b/i, "executive"],
    [/\bdirector\b/i, "director"],
    [/\bmanager\b/i, "manager"],
    [/\b(principal|staff|lead)\b/i, "lead"],
    [/\b(senior|sr\.?)\b/i, "senior"],
    [/\b(intern|internship)\b/i, "intern"],
    [/\b(entry|junior|jr\.?|associate)\b/i, "entry"]
  ];

  for (const [pattern, seniority] of checks) {
    if (pattern.test(text)) return seniority;
  }

  return "mid";
}

function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*[-–—]\s*(remote|hybrid|onsite).*$/i, "")
    .trim();
}

export function analyzeJobDescription(
  title: string,
  description: string
): JobAnalysis {
  const normalizedTitle = normalizeTitle(title || "Unknown role");
  const corpus = `${normalizedTitle}\n${description}`;

  const skills = SKILLS
    .filter(([pattern]) => pattern.test(corpus))
    .map(([, label]) => label)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 8);

  const seniority = detectSeniority(corpus);
  const searchTerms = [normalizedTitle, ...skills].slice(0, 8);

  let confidence = 0.55;
  if (title.trim()) confidence += 0.15;
  if (description.trim().length >= 80) confidence += 0.1;
  if (skills.length >= 2) confidence += 0.1;
  if (seniority !== "unknown") confidence += 0.05;

  return {
    normalizedTitle,
    seniority,
    skills,
    searchTerms,
    confidence: Math.min(0.95, Number(confidence.toFixed(2)))
  };
}
