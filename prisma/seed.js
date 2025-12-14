/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("changeme", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash,
      name: "Admin User",
      role: "admin",
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
      role: "admin",
    },
  });

  const projects = [
    {
      title: "Voting App",
      slug: "voting-app",
      summary: "A real-time voting application built with the MERN stack.",
      description: "Developed a full-stack voting application allowing users to create polls and vote in real-time. Implemented secure authentication and real-time updates.",
      techStack: ["MongoDB", "Express.js", "React", "Node.js"],
      featured: true,
      order: 1,
    },
    {
      title: "NPM Package: create-mern-app-structure",
      slug: "create-mern-app-structure",
      summary: "A CLI tool to quickly scaffold MERN stack applications.",
      description: "Published an NPM package that automates the setup of MERN stack projects with a predefined, scalable folder structure.",
      techStack: ["Node.js", "NPM", "CLI"],
      featured: true,
      order: 2,
    },
    {
      title: "CKD Diagnostic System",
      slug: "ckd-diagnostic-system",
      summary: "Diagnostic system for Chronic Kidney Disease using Power Platform.",
      description: "Developed a diagnostic system for Chronic Kidney Disease (CKD) using Microsoft Power Platform and custom C# plugins for complex logic.",
      techStack: ["Microsoft Power Platform", "C#", ".NET"],
      featured: false,
      order: 3,
    },
    {
      title: "Cancer Scan Admin Dashboard",
      slug: "cancer-scan-dashboard",
      summary: "Admin dashboard for a cancer scanning tool.",
      description: "Built comprehensive admin dashboard components for a cancer scan tool, focusing on data visualization and user management.",
      techStack: ["React", "Redux", "Ant Design"],
      featured: false,
      order: 4,
    },
    {
      title: "QabarSafai App",
      slug: "qabarsafai-app",
      summary: "Mobile application for grave maintenance services.",
      description: "Developed a cross-platform mobile application using Flutter and Firebase to connect users with maintenance services.",
      techStack: ["Flutter", "Firebase", "Dart"],
      featured: false,
      order: 5,
    },
    {
      title: "Charity Donation Platform",
      slug: "charity-donation-platform",
      summary: "Web platform for charitable donations.",
      description: "Built a secure and user-friendly charity donation platform integrating Stripe for payments.",
      techStack: ["Next.js 13", "Tailwind CSS", "Stripe"],
      featured: false,
      order: 6,
    },
    {
      title: "Healthcare RCM Platform",
      slug: "healthcare-rcm-platform",
      summary: "Revenue Cycle Management platform for healthcare.",
      description: "Built a healthcare RCM platform to streamline billing and revenue processes.",
      techStack: ["Next.js 13", "Tailwind CSS", "Strapi", "PostgreSQL"],
      featured: false,
      order: 7,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  const blog = await prisma.blogPost.upsert({
    where: { slug: "hello-world" },
    update: {},
    create: {
      title: "Hello World",
      slug: "hello-world",
      excerpt: "First seeded post.",
      content: "Welcome to the new portfolio blog!",
      tags: ["intro", "nextjs"],
      published: true,
      readTime: 1,
    },
  });

  // Profile
  // Check if profile exists to avoid duplicates on re-seed
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    await prisma.profile.create({
      data: {
        name: "Muhammad Ahmad Hamid",
        title: "Software Engineer | Full Stack Developer | MERN Stack Developer",
        bio: "Full Stack Software Engineer specializing in the MERN stack, with 2+ years of experience building and shipping web applications. Strong in React/Next.js and Node.js, with an increasing focus on system architecture, database design, and scalable systems, and comfortable working across multiple stacks as needed.",
        skills: [
          "React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "React Query", "Redux Toolkit", 
          "Context API", "HTML5", "CSS3", "Tailwind CSS", "Ant Design", "Bootstrap", "Material UI", 
          "Node.js", "Express.js", "MongoDB", "PostgreSQL", "MySQL", "SQLite", "JWT", "Firebase", 
          "Stripe", "Jest", "Git", "GitLab CI", "Prisma", "Sequelize", "Docker"
        ],
        socials: {
          github: "https://github.com/ahmad5599",
          linkedin: "https://linkedin.com/in/ahmad-hamid",
          email: "ahmadhamid3244@gmail.com"
        }
      }
    });
  }

  // Experience
  await prisma.experience.deleteMany({}); // Clear old to re-seed
  const experiences = [
    {
      position: "MERN Stack Developer",
      company: "Micro Data Tech Solutions",
      startDate: new Date("2024-11-01"),
      description: "Developed a Chronic Kidney Disease (CKD) diagnostic system using Microsoft Power Platform and custom C# plugins. Built admin dashboard components for a cancer scan tool with React, Redux, and Ant Design. Set up an automated testing pipeline using Jest, DeepSource, and GitLab CI. Integrated Stripe Connect API into a Luma clone and Corpay payment gateway into Zolvat banking platform.",
      technologies: ["React", "Redux", "Ant Design", "Jest", "GitLab CI", "Stripe", "Power Platform", "C#"],
      order: 1
    },
    {
      position: "Software Engineer",
      company: "Cheapoweb LLC",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-08-01"),
      description: "Developed a Flutter mobile app (QabarSafai App) using Firebase. Built a charity donation platform with Next.js 13, Tailwind CSS, and Stripe. Created a mortgage consulting platform with Next.js 13 and Firebase.",
      technologies: ["Flutter", "Firebase", "Next.js", "Tailwind CSS", "Stripe"],
      order: 2
    },
    {
      position: "Freelance Full Stack Developer",
      company: "Fiverr",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2024-01-01"),
      description: "Built a healthcare RCM platform using Next.js 13, Tailwind CSS, Strapi, and PostgreSQL.",
      technologies: ["Next.js", "Tailwind CSS", "Strapi", "PostgreSQL"],
      order: 3
    },
    {
      position: "Junior Web Developer",
      company: "IT Hobbies",
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-08-01"),
      description: "Built a crypto data platform with Next.js 12, Tailwind CSS, and Ant Design, optimizing API calls with IndexedDB.",
      technologies: ["Next.js", "Tailwind CSS", "Ant Design", "IndexedDB"],
      order: 4
    }
  ];

  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }

  // Education
  await prisma.education.deleteMany({});
  await prisma.education.create({
    data: {
      degree: "Bachelor's in Information Technology (BSIT)",
      institution: "University of the Punjab",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2023-01-01"),
      order: 1
    }
  });

  // Certifications
  await prisma.certification.deleteMany({});
  await prisma.certification.create({
    data: {
      name: "MongoDB Node.js Developer Path",
      issuer: "MongoDB",
      date: new Date("2023-01-01"), // Approximate
      order: 1
    }
  });

  const contact = await prisma.contact.create({
    data: {
      name: "Test Sender",
      email: "sender@example.com",
      message: "This is a seeded contact message.",
      read: false,
      replied: false,
    },
  });

  console.log({ admin: admin.email, projectsSeeded: projects.length, blog: blog.slug, contact: contact.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
