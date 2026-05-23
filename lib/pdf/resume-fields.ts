export type ResumeField =
  | "python"
  | "mern"
  | "software-engineer"
  | "app-dev"
  | "node-dev"
  | "backend"
  | "full-stack"
  | "frontend"
  | "aws";

export interface FieldConfig {
  label: string;
  filename: string;
  /** techStack keywords to match (case-insensitive). Empty array = include ALL projects. */
  keywords: string[];
}

export const RESUME_FIELDS: Record<ResumeField, FieldConfig> = {
  python: {
    label: "Python Developer",
    filename: "Resume_Python_Developer.pdf",
    keywords: [
      "Python",
      "Django",
      "Flask",
      "FastAPI",
      "NumPy",
      "Pandas",
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "Jupyter",
    ],
  },
  mern: {
    label: "MERN Stack Developer",
    filename: "Resume_MERN_Stack.pdf",
    keywords: [
      "MongoDB",
      "Express",
      "Express.js",
      "React",
      "React.js",
      "Node",
      "Node.js",
      "MERN",
    ],
  },
  "software-engineer": {
    label: "Software Engineer (General)",
    filename: "Resume_Software_Engineer.pdf",
    keywords: [], // empty = include ALL projects
  },
  "app-dev": {
    label: "App / Mobile Developer",
    filename: "Resume_App_Developer.pdf",
    keywords: [
      "Flutter",
      "React Native",
      "Android",
      "iOS",
      "Expo",
      "Dart",
      "Mobile",
      "Kotlin",
      "Swift",
    ],
  },
  "node-dev": {
    label: "Node.js Developer",
    filename: "Resume_NodeJS_Developer.pdf",
    keywords: [
      "Node.js",
      "Node",
      "Express.js",
      "Express",
      "REST",
      "API",
      "CLI",
      "NPM",
      "Bun",
    ],
  },
  backend: {
    label: "Backend Developer",
    filename: "Resume_Backend_Developer.pdf",
    keywords: [
      "Node.js",
      "Express",
      "Express.js",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "Prisma",
      "Sequelize",
      "REST",
      "API",
      "Strapi",
      "Docker",
      "Redis",
    ],
  },
  "full-stack": {
    label: "Full Stack Developer",
    filename: "Resume_Full_Stack.pdf",
    keywords: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "MERN",
      "Full Stack",
      "TypeScript",
      "JavaScript",
    ],
  },
  frontend: {
    label: "Frontend Developer",
    filename: "Resume_Frontend_Developer.pdf",
    keywords: [
      "React",
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "CSS",
      "HTML",
      "Tailwind",
      "Tailwind CSS",
      "Redux",
      "Redux Toolkit",
      "Ant Design",
      "Material UI",
      "Bootstrap",
      "Framer Motion",
      "Vue",
      "Angular",
    ],
  },
  aws: {
    label: "AWS / AI Engineer",
    filename: "Resume_AWS_AI_Engineer.pdf",
    keywords: [
      "AWS",
      "Amazon",
      "Lex",
      "Bedrock",
      "Lambda",
      "S3",
      "DynamoDB",
      "EC2",
      "Cloud",
      "AI",
      "ML",
      "Machine Learning",
      "LLM",
      "OpenAI",
      "Langchain",
    ],
  },
};

/**
 * Filter projects by field keywords. If keywords is empty or no project matches,
 * returns all projects (never returns an empty list).
 */
export function filterProjectsByField<T extends { techStack: string[] }>(
  projects: T[],
  keywords: string[]
): T[] {
  if (keywords.length === 0) return projects;

  const lower = keywords.map((k) => k.toLowerCase());
  const matched = projects.filter((p) =>
    p.techStack.some((tech) =>
      lower.some((kw) => tech.toLowerCase().includes(kw))
    )
  );

  return matched.length > 0 ? matched : projects;
}
