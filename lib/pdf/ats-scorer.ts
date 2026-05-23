// ─── ATS Resume Scorer ────────────────────────────────────────────────────────
// Scores a resume on a 0-100 scale based on ATS compatibility criteria.
// No external dependencies — pure TypeScript.

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  perfect: boolean;
}

export interface Improvement {
  category: string;
  text: string;
  /** Points available if this is addressed */
  points: number;
  priority: "high" | "medium" | "low";
}

export interface ATSScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  categories: ScoreCategory[];
  improvements: Improvement[];
  scoredAt: string;
}

// ─── Scoring inputs (minimal — only fields actually used) ──────────────────────

export interface ScoringInput {
  profile: {
    bio: string;
    skills: string[];
    socials: Record<string, string> | null | undefined;
  };
  experiences: Array<{ description?: string | null }>;
  educations: Array<{ degree: string }>;
  certifications: Array<{ name: string }>;
  projects: Array<{ githubUrl?: string | null; liveUrl?: string | null }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_VERBS = [
  "built", "developed", "led", "designed", "architected", "shipped",
  "reduced", "improved", "increased", "delivered", "created", "implemented",
  "optimized", "managed", "scaled", "launched", "deployed", "automated",
  "integrated", "migrated", "refactored", "streamlined", "established",
  "collaborated", "maintained", "enhanced", "accelerated", "achieved",
  "coordinated", "executed", "engineered", "produced", "authored",
];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasActionVerb(text: string): boolean {
  const lower = text.toLowerCase();
  return ACTION_VERBS.some((v) => lower.includes(v));
}

function hasQuantifiedResult(text: string): boolean {
  return (
    /\d+\s*%/.test(text) ||
    /\d+x\b/i.test(text) ||
    /\d+\+/.test(text) ||
    /[0-9]{2,}/.test(text) || // any 2+ digit number
    /[0-9]+\s*(users|customers|clients|teams|projects|minutes|seconds|ms|kb|mb|gb|lines|repos)/i.test(text)
  );
}

function priority(points: number): "high" | "medium" | "low" {
  if (points >= 8) return "high";
  if (points >= 4) return "medium";
  return "low";
}

function improvement(
  category: string,
  text: string,
  points: number
): Improvement {
  return { category, text, points, priority: priority(points) };
}

// ─── Per-category scoring functions ───────────────────────────────────────────

function scoreContact(
  socials: Record<string, string> | null | undefined
): { score: number; maxScore: number; improvements: Improvement[] } {
  const s = socials ?? {};
  let score = 0;
  const improvements: Improvement[] = [];

  if (s.email) score += 3;
  else improvements.push(improvement("Contact", "Add your email address", 3));

  if (s.phone) score += 3;
  else improvements.push(improvement("Contact", "Add your phone number — many ATS systems require it for shortlisting", 3));

  if (s.location) score += 3;
  else improvements.push(improvement("Contact", "Add your city/country for location-based job matching", 3));

  if (s.linkedin) score += 3;
  else improvements.push(improvement("Contact", "Add your LinkedIn URL — 87% of recruiters use it to verify candidates", 3));

  if (s.github) score += 3;
  else improvements.push(improvement("Contact", "Add your GitHub URL — essential for software engineering roles", 3));

  return { score, maxScore: 15, improvements };
}

function scoreSummary(bio: string): { score: number; maxScore: number; improvements: Improvement[] } {
  const improvements: Improvement[] = [];

  if (!bio || bio.length < 20) {
    return {
      score: 0,
      maxScore: 15,
      improvements: [
        improvement(
          "Summary",
          "Add a 50–100 word professional summary starting with your role title. Recruiters spend 6–10 seconds on a first pass — this is your pitch.",
          15
        ),
      ],
    };
  }

  let score = 5;

  const wc = wordCount(bio);
  if (wc >= 30 && wc <= 150) {
    score += 5;
  } else if (wc < 30) {
    improvements.push(improvement("Summary", `Summary is too short (${wc} words). Expand to 50–100 words to give a complete picture.`, 5));
  } else {
    improvements.push(improvement("Summary", `Summary is too long (${wc} words). Trim to under 150 words — recruiters skim.`, 5));
  }

  if (hasActionVerb(bio)) {
    score += 5;
  } else {
    improvements.push(improvement("Summary", "Start sentences with action verbs: Built, Developed, Led, Reduced, Shipped, Optimized…", 5));
  }

  return { score, maxScore: 15, improvements };
}

function scoreSkills(skills: string[]): { score: number; maxScore: number; improvements: Improvement[] } {
  const improvements: Improvement[] = [];
  let score = 0;

  if (skills.length === 0) {
    return {
      score: 0,
      maxScore: 15,
      improvements: [
        improvement("Skills", "Add technical skills — this is the primary section ATS systems scan for keyword matches.", 15),
      ],
    };
  }

  score += 5;

  if (skills.length >= 10) {
    score += 5;
  } else {
    improvements.push(improvement("Skills", `Only ${skills.length} skills listed. Aim for 15–25 to cover more job description keywords.`, 5));
  }

  if (skills.length >= 20) {
    score += 5;
  } else {
    improvements.push(improvement("Skills", `Add more skills (currently ${skills.length}). 20+ technical skills helps match a wider range of job descriptions.`, 5));
  }

  return { score, maxScore: 15, improvements };
}

function scoreExperience(
  experiences: ScoringInput["experiences"]
): { score: number; maxScore: number; improvements: Improvement[] } {
  const improvements: Improvement[] = [];
  let score = 0;

  if (experiences.length === 0) {
    return {
      score: 0,
      maxScore: 25,
      improvements: [
        improvement("Experience", "Add work experience — it carries the most weight in any software engineering resume.", 25),
      ],
    };
  }

  score += 5;

  if (experiences.length >= 2) {
    score += 5;
  } else {
    improvements.push(improvement("Experience", "Add a second work experience entry — at least 2 positions shows career progression.", 5));
  }

  const allDesc = experiences.map((e) => e.description ?? "").join("\n");

  if (hasQuantifiedResult(allDesc)) {
    score += 8;
  } else {
    improvements.push(
      improvement(
        "Experience",
        "Quantify your impact. Examples: 'reduced load time by 40%', 'shipped feature to 10,000+ users', 'cut CI/CD pipeline from 12 min to 4 min'.",
        8
      )
    );
  }

  if (hasActionVerb(allDesc)) {
    score += 7;
  } else {
    improvements.push(
      improvement("Experience", "Start every bullet point with an action verb: Built, Developed, Implemented, Reduced, Optimized, Shipped, Automated…", 7)
    );
  }

  return { score, maxScore: 25, improvements };
}

function scoreEducation(
  educations: ScoringInput["educations"]
): { score: number; maxScore: number; improvements: Improvement[] } {
  if (educations.length === 0) {
    return {
      score: 0,
      maxScore: 10,
      improvements: [
        improvement("Education", "Add your education — required by most software engineering job applications.", 10),
      ],
    };
  }
  return { score: 10, maxScore: 10, improvements: [] };
}

function scoreProjects(
  projects: ScoringInput["projects"]
): { score: number; maxScore: number; improvements: Improvement[] } {
  const improvements: Improvement[] = [];
  let score = 0;

  if (projects.length === 0) {
    return {
      score: 0,
      maxScore: 10,
      improvements: [
        improvement("Projects", "Add portfolio projects — critical for demonstrating hands-on skills to tech recruiters.", 10),
      ],
    };
  }

  score += 5;

  if (projects.length >= 2) {
    score += 3;
  } else {
    improvements.push(improvement("Projects", "Add at least 2 projects — variety shows breadth of technical skills.", 3));
  }

  const hasLinks = projects.some((p) => p.githubUrl || p.liveUrl);
  if (hasLinks) {
    score += 2;
  } else {
    improvements.push(improvement("Projects", "Add GitHub or live URLs to your projects — lets recruiters verify your work immediately.", 2));
  }

  return { score, maxScore: 10, improvements };
}

function scoreCertifications(
  certifications: ScoringInput["certifications"]
): { score: number; maxScore: number; improvements: Improvement[] } {
  if (certifications.length === 0) {
    return {
      score: 0,
      maxScore: 5,
      improvements: [
        improvement(
          "Awards & Achievements",
          "Add certifications or awards (AWS, GCP, hackathon wins, MongoDB, Google, etc.) — validates skills and signals achievement. Manage these in the Awards & Achievements admin page.",
          5
        ),
      ],
    };
  }
  return { score: 5, maxScore: 5, improvements: [] };
}

function scoreBonus(
  socials: Record<string, string> | null | undefined
): { score: number; maxScore: number; improvements: Improvement[] } {
  const s = socials ?? {};
  let score = 0;
  const improvements: Improvement[] = [];

  if (s.languages) {
    score += 2;
  } else {
    improvements.push(improvement("Bonus Sections", "Add spoken languages (e.g. English, Urdu) — useful for international companies and bilingual roles.", 2));
  }

  return { score, maxScore: 2, improvements };
}

// ─── Summary text based on score ──────────────────────────────────────────────

function scoreSummaryText(percentage: number): string {
  if (percentage >= 90) return "Excellent! Your CV is highly optimized for ATS systems.";
  if (percentage >= 80) return "Great score. A few small tweaks could push it to the top tier.";
  if (percentage >= 70) return "Good. Address the improvements below to break into the 85+ range.";
  if (percentage >= 60) return "Fair. Your CV needs improvement in several areas to reliably pass ATS screening.";
  if (percentage >= 50) return "Below average. Focus on high-priority improvements — your CV may be filtered before a human sees it.";
  return "Low score. Your CV is likely to be filtered out by ATS. Address all improvements before applying.";
}

function gradeFromPercentage(p: number): "A" | "B" | "C" | "D" | "F" {
  if (p >= 90) return "A";
  if (p >= 75) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function scoreResume(input: ScoringInput): ATSScoreResult {
  const socials =
    input.profile.socials != null
      ? (input.profile.socials as Record<string, string>)
      : null;

  const sections = [
    { name: "Contact Information", ...scoreContact(socials) },
    { name: "Professional Summary", ...scoreSummary(input.profile.bio) },
    { name: "Skills", ...scoreSkills(input.profile.skills) },
    { name: "Work Experience", ...scoreExperience(input.experiences) },
    { name: "Education", ...scoreEducation(input.educations) },
    { name: "Projects", ...scoreProjects(input.projects) },
    { name: "Awards & Achievements", ...scoreCertifications(input.certifications) },
    { name: "Awards & Extra Sections", ...scoreBonus(socials) },
  ];

  const totalScore = sections.reduce((s, c) => s + c.score, 0);
  const maxScore = sections.reduce((s, c) => s + c.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const categories: ScoreCategory[] = sections.map((s) => ({
    name: s.name,
    score: s.score,
    maxScore: s.maxScore,
    perfect: s.score === s.maxScore,
  }));

  // Flatten and sort improvements by highest points first
  const allImprovements: Improvement[] = sections
    .flatMap((s) => s.improvements)
    .sort((a, b) => b.points - a.points);

  return {
    totalScore,
    maxScore,
    percentage,
    grade: gradeFromPercentage(percentage),
    summary: scoreSummaryText(percentage),
    categories,
    improvements: allImprovements,
    scoredAt: new Date().toISOString(),
  };
}
