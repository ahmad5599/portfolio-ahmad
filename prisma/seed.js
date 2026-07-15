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
      name: "Muhammad Ahmad Hamid",
      role: "admin",
    },
    create: {
      email: "admin@example.com",
      name: "Muhammad Ahmad Hamid",
      passwordHash,
      role: "admin",
    },
  });

  // Projects
  const projects = [
    {
      title: "Personal Portfolio",
      slug: "personal-portfolio",
      summary: "A responsive personal portfolio built with Next.js and Three.js.",
      description: "Developed a responsive personal portfolio using Next.js, Three.js, React Hooks, and Tailwind CSS, showcasing projects and technical skills with interactive 3D elements.",
      image: null,
      githubUrl: "https://github.com/ahmad5599",
      liveUrl: "http://ahmadhamid.vercel.app",
      techStack: ["Next.js", "Three.js", "React Hooks", "Tailwind CSS"],
      featured: true,
      isPersonal: true,
      order: 1,
    },
    {
      title: "Voting App Backend",
      slug: "voting-app-backend",
      summary: "A scalable voting backend built with Node.js and MongoDB.",
      description: "Designed a scalable voting Backend using Node.js, MongoDB, JWT authentication, and RESTful APIs with Express.js for secure, reliable, and efficient data communication.",
      image: null,
      githubUrl: "https://github.com/ahmad5599/Voting-Node-App",
      liveUrl: null,
      techStack: ["Node.js", "MongoDB", "JWT", "RESTful APIs", "Express.js"],
      featured: true,
      isPersonal: true,
      order: 2,
    },
    {
      title: "project-tree-generator",
      slug: "project-tree-generator",
      summary: "An NPM CLI tool to generate clean, visual folder structures for project documentation.",
      description: "Published project-tree-generator on NPM, a CLI tool to generate clean, visual folder structures for project documentation.",
      image: null,
      githubUrl: "https://github.com/ahmad5599/project-tree-generator",
      liveUrl: "https://www.npmjs.com/package/project-tree-generator",
      techStack: ["Node.js", "NPM", "CLI"],
      featured: true,
      isPersonal: true,
      order: 3,
    },
    {
      title: "CKD Diagnostic System",
      slug: "ckd-diagnostic-system",
      summary: "Diagnostic system for Chronic Kidney Disease using Power Platform.",
      description: "Developed a diagnostic system for Chronic Kidney Disease (CKD) using Microsoft Power Platform (Power Apps, Power Automate, Model-Driven Apps) and custom C# plugins for complex logic, helping improve diagnostic workflow and reduce manual errors compared to traditional methods.",
      image: null,
      githubUrl: null,
      liveUrl: null,
      techStack: ["Microsoft Power Platform", "Power Apps", "Power Automate", "Model-Driven Apps", "C#", ".NET"],
      featured: false,
      isPersonal: false,
      order: 4,
    },
    {
      title: "Cancer Scan Admin Dashboard",
      slug: "cancer-scan-dashboard",
      summary: "Admin dashboard for a cancer scanning tool.",
      description: "Built comprehensive admin dashboard components for a cancer scan tool with React, Styled Components, Redux, and Ant Design, focusing on improving UI consistency, data visualization, and maintainability.",
      image: null,
      githubUrl: null,
      liveUrl: null,
      techStack: ["React", "Styled Components", "Redux", "Ant Design"],
      featured: false,
      isPersonal: false,
      order: 5,
    },
    {
      title: "QabarSafai App",
      slug: "qabarsafai-app",
      summary: "Mobile application for Grave Maintenance & Care services.",
      description: "Developed a cross-platform mobile application using Flutter and Firebase to connect users with grave maintenance services, using Firebase for media uploads, real-time data, and serverless backend logic.",
      image: null,
      githubUrl: null,
      liveUrl: "https://play.google.com/store/apps/details?id=com.qabarsafai.app&hl=en&pli=1",
      techStack: ["Flutter", "Firebase", "Dart"],
      featured: false,
      isPersonal: false,
      order: 6,
    },
    {
      title: "Charity Donation Platform",
      slug: "charity-donation-platform",
      summary: "Web platform for charitable donations.",
      description: "Built a secure and user-friendly charity donation platform integrating Stripe for payment processing, using Next.js 13, Tailwind CSS, Ant Design, and Firestore.",
      image: null,
      githubUrl: null,
      liveUrl: "https://eid-qurbani.vercel.app/",
      techStack: ["Next.js 13", "Tailwind CSS", "Ant Design", "Firestore", "Stripe"],
      featured: false,
      isPersonal: false,
      order: 7,
    },
    {
      title: "Mortgage Consulting Platform",
      slug: "mortgage-consulting-platform",
      summary: "Web platform for mortgage consulting services.",
      description: "Created a mortgage consulting platform with Next.js 13 and Firebase, featuring responsive service pages and a dynamic contact form.",
      image: null,
      githubUrl: null,
      liveUrl: "https://perfect-choice.vercel.app/",
      techStack: ["Next.js 13", "Firebase", "Tailwind CSS"],
      featured: false,
      isPersonal: false,
      order: 8,
    },
    {
      title: "Healthcare RCM Platform",
      slug: "healthcare-rcm-platform",
      summary: "Revenue Cycle Management platform for healthcare.",
      description: "Built a healthcare RCM platform using Next.js 13, Tailwind CSS, Strapi, and PostgreSQL, integrating Strapi CMS for scalable content and data management to streamline billing and revenue processes.",
      image: null,
      githubUrl: null,
      liveUrl: null,
      techStack: ["Next.js 13", "Tailwind CSS", "Strapi", "PostgreSQL"],
      featured: false,
      isPersonal: false,
      order: 9,
    },
  ];

  // Clean old projects first to avoid unique constraint violations on slug
  await prisma.project.deleteMany({});
  for (const p of projects) {
    await prisma.project.create({
      data: p,
    });
  }

  // Blog seeding
  const blogs = [
    {
      title: "Mastering Multi-Tenant Stripe Connect Integrations in Next.js",
      slug: "mastering-stripe-connect-nextjs",
      excerpt: "A deep dive into integrating Stripe Connect for marketplace onboarding, vendor payouts, and handling secure webhooks in Next.js App Router.",
      content: `Integrating payment gateways is a critical milestone for any modern SaaS or marketplace platform. When building marketplace applications (like a Luma clone), standard Stripe integrations fall short. You need **Stripe Connect** to handle multi-tenant account onboarding, identity verification, and split payouts.

In this post, we’ll explore how to architect a secure, scalable Stripe Connect integration using Next.js App Router and Prisma.

### Why Stripe Connect?
Stripe Connect allows your platform to facilitate payments on behalf of other users (connected accounts). There are three types of accounts:
1. **Standard**: Easiest to integrate, Stripe handles co-branding and dashboard.
2. **Express**: Stripe handles onboarding and identity verification, but you control the payout schedules and branding.
3. **Custom**: You own the entire UI, but you are responsible for collecting verification documents (high compliance overhead).

For most platforms, **Express Accounts** offer the perfect balance of branding control and low compliance risk.

### 1. Initiating the Onboarding Flow (Server Actions)
When a vendor wants to connect their account, we first create an account token and generate an onboarding link. Here is how you can handle this with a Next.js Server Action:

\`\`\`typescript
"use server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createConnectAccount(userId: string) {
  // 1. Create the Express Account
  const account = await stripe.accounts.create({
    type: "express",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // 2. Save the Connect ID to the database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeConnectId: account.id },
  });

  // 3. Create the Account Link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: \`\${process.env.NEXTAUTH_URL}/admin/billing?error=onboarding_refreshed\`,
    return_url: \`\${process.env.NEXTAUTH_URL}/admin/billing?success=onboarding_complete\`,
    type: "account_onboarding",
  });

  return accountLink.url;
}
\`\`\`

### 2. Handling Webhook Events
Verification statuses change asynchronously. A user might submit their details, and Stripe might take a few minutes to verify their ID. You must listen to Stripe Webhooks (specifically \`account.updated\`) to update the vendor's status in your database.

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(\`Webhook Error: \${err.message}\`, { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;

    await prisma.profile.updateMany({
      where: { stripeConnectId: account.id },
      data: {
        billingSetupComplete: payoutsEnabled && detailsSubmitted,
      },
    });
  }

  return NextResponse.json({ received: true });
}
\`\`\`

### Summary
Building Stripe Connect flows requires deep understanding of asynchronous status updates and secure server-to-server communication. By utilizing Next.js Server Actions and robust webhook handlers, you can build a seamless onboarding experience that keeps your database in sync.`,
      tags: ["Stripe", "Next.js", "Fintech", "Webhooks"],
      published: true,
      readTime: 6,
    },
    {
      title: "Scaffolding Scalable MERN Apps: The CLI Automation Approach",
      slug: "scaffolding-mern-apps-cli-automation",
      excerpt: "How automating directory scaffolding using custom CLI tools can boost productivity and keep codebases clean and standard across teams.",
      content: `# Scaffolding Scalable MERN Apps: The CLI Automation Approach

When starting a new MERN (MongoDB, Express, React, Node.js) stack project, developers often spend the first few hours doing repetitive setup tasks: creating directories, configuring ESLint, setting up Express routers, and writing boilerplate database connection code.

Automating this using a custom command-line interface (CLI) tool (such as \`project-tree-generator\`) can ensure directory consistency, enforce best practices, and shave hours off setup time.

---

### The Anatomy of a Scalable MERN Structure

Before automating, we need a structure that handles growth. A flat folder structure breaks down quickly as features grow. Instead, we advocate for a **domain-driven or feature-driven** architecture on the frontend, and a **layered** architecture on the backend.

#### Recommended Backend Structure
\`\`\`text
src/
├── config/             # DB connection, env variables, Stripe client
├── controllers/        # Request handlers & validation
├── middlewares/        # Auth guards, error handlers
├── models/             # Mongoose/Sequelize models
├── routes/             # API route definitions
└── app.js              # Application entry point
\`\`\`

#### Recommended Frontend Structure
\`\`\`text
src/
├── components/         # Global UI components (buttons, inputs)
├── features/           # Feature modules (auth, projects, profile)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api.ts
├── hooks/              # Global custom hooks
└── services/           # Axios/Fetch clients
\`\`\`

---

### Building the Scaffolder CLI

We can build a simple Node.js CLI tool using packages like \`commander\` (for CLI commands) and \`fs-extra\` (for simplified filesystem actions).

Here is a snippet showing how to implement a CLI command that generates this structure recursively:

\`\`\`javascript
#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');

program
  .version('1.0.0')
  .description('Scaffolds a clean structure for MERN stack applications');

const createStructure = async (targetDir) => {
  const folders = [
    'src/config',
    'src/controllers',
    'src/middlewares',
    'src/models',
    'src/routes',
    'tests'
  ];

  for (const folder of folders) {
    await fs.ensureDir(path.join(targetDir, folder));
  }

  // Create basic boilerplate server file
  const appBoilerplate = \`
const express = require('express');
const app = express();
app.use(express.json());
module.exports = app;
  \`;

  await fs.writeFile(path.join(targetDir, 'src/app.js'), appBoilerplate.trim());
  console.log('✅ Standard directory structure created successfully!');
};

program
  .command('init <project-name>')
  .action(async (projectName) => {
    const targetPath = path.resolve(process.cwd(), projectName);
    await fs.ensureDir(targetPath);
    await createStructure(targetPath);
  });

program.parse(process.argv);
\`\`\`

### Publishing to NPM
To make this tool globally accessible to your team, publish it as an NPM package:
1. Initialize npm in your CLI package: \`npm init\`
2. Add a \`bin\` property to your \`package.json\`:
   \`\`\`json
   "bin": {
     "create-mern-structure": "./bin/index.js"
   }
   \`\`\`
3. Log in to npm: \`npm login\`
4. Publish: \`npm publish --access public\`

Now, anyone can run \`npx create-mern-structure my-new-project\` to bootstrap a standardized project in seconds.

### Conclusion
CLI tools are the backbone of developer operations (DevOps) for frontend and backend engineers. Standardizing your folder layouts via a CLI prevents architectural drift, guarantees that security middlewares are always configured in the same place, and helps new developers onboard instantly.`,
      tags: ["Node.js", "NPM", "CLI", "MERN", "Automation"],
      published: true,
      readTime: 5,
    },
    {
      title: "Bridging the Gap: Integrating Microsoft Power Platform with Custom C# Plugins",
      slug: "integrating-power-platform-custom-csharp-plugins",
      excerpt: "Unlocking enterprise-grade business logic in Power Apps and Dynamics 365 by writing and deploying custom C# plugins.",
      content: `Microsoft Power Platform is widely recognized as a low-code/no-code leader, letting developers build internal tools, database forms (Model-Driven Apps), and automated workflows (Power Automate) rapidly. However, complex enterprise processes often require heavy computational logic, secure cryptography, or precise data transformations that low-code tools cannot perform efficiently.

This is where **custom C# plugins** come in. By writing server-side plugins, you can run high-performance, custom business logic during the Microsoft Dataverse transaction pipeline.

### The Dataverse Event Pipeline
When an action is performed on an entity (such as creating a diagnostic record in a Chronic Kidney Disease system), it passes through a multi-stage pipeline:
1. **Pre-Validation**: Runs outside the database transaction. Best for checking authorization or initial state validation.
2. **Pre-Operation**: Runs inside the database transaction *before* the main database operation. Great for updating values on the entity itself.
3. **Main Operation**: The system performs the database write (create, update, delete).
4. **Post-Operation**: Runs inside the database transaction *after* the main operation. Ideal for creating related records or making external API calls.

---

### Writing a Custom C# Plugin
To write a plugin, create a C# Class Library project targeting **.NET Framework 4.6.2** (Dataverse requirements) and import the \`Microsoft.CrmSdk.CoreAssemblies\` NuGet package.

Here is a sample plugin that calculates a clinical score (e.g., estimating kidney function indices) automatically when a patient record is updated:

\`\`\`csharp
using System;
using Microsoft.Xrm.Sdk;

namespace ClinicalPlugins
{
    public class CalculateKidneyScore : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // 1. Obtain the execution context
            IPluginExecutionContext context = (IPluginExecutionContext)
                serviceProvider.GetService(typeof(IPluginExecutionContext));

            // 2. Check if the target is an Entity and the message is Update/Create
            if (context.InputParameters.Contains("Target") &&
                context.InputParameters["Target"] is Entity)
            {
                Entity entity = (Entity)context.InputParameters["Target"];

                // Verify the entity logical name matches our record type
                if (entity.LogicalName != "new_diagnostic_record") return;

                // 3. Extract inputs (e.g., Creatinine levels)
                decimal creatinine = entity.Contains("new_creatinine") 
                    ? ((decimal)entity["new_creatinine"]) 
                    : 0;

                int age = entity.Contains("new_age") 
                    ? ((int)entity["new_age"]) 
                    : 30;

                // 4. Calculate Diagnostic Score (Mock formula)
                decimal diagnosticScore = (creatinine > 0) 
                    ? (186 / (decimal)Math.Pow((double)creatinine, 1.154) * (decimal)Math.Pow(age, -0.203)) 
                    : 0;

                // 5. Update output field directly in Pre-Operation
                entity["new_egfr_score"] = diagnosticScore;
            }
        }
    }
}
\`\`\`

---

### Deploying Your Plugin
Once built, you deploy the assembly using Microsoft's **Plugin Registration Tool**:
1. Connect to your Dataverse/Power Platform environment.
2. Register the compiled \`ClinicalPlugins.dll\` assembly.
3. Register a **New Step** on the assembly (e.g., Message: \`Update\`, Primary Entity: \`new_diagnostic_record\`, Pipeline Stage: \`Pre-operation\`).
4. Click Register.

Now, whenever a user updates a diagnostic record in the Model-Driven App, Dataverse executes the C# plugin synchronously, instantly updating the calculated score.

### Conclusion
By combining low-code application development with custom C# plugins, teams can prototype user interfaces in hours while maintaining the power to execute complex, secure, and performant backend code. It represents the best of low-code productivity and professional developer flexibility.`,
      tags: ["Power Platform", "C#", ".NET", "Enterprise", "Architecture"],
      published: true,
      readTime: 8,
    },
  ];

  // Clean old blog posts first
  await prisma.blogPost.deleteMany({});
  for (const b of blogs) {
    await prisma.blogPost.create({
      data: b,
    });
  }


  // Profile
  await prisma.profile.deleteMany({});
  await prisma.profile.create({
    data: {
      name: "Muhammad Ahmad Hamid",
      title: "Software Engineer | Full Stack Developer | MERN Stack Developer",
      bio: "Software Engineer with 3+ years of experience building scalable full-stack web applications using the MERN stack. Experienced in payment integrations, dashboards, and production systems across healthcare, fintech, and SaaS domains. Comfortable owning features end-to-end from design to deployment.",
      skills: [
        "React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "React Query", "Redux Toolkit", 
        "Context API", "HTML5", "CSS3", "Tailwind CSS", "Ant Design", "Bootstrap", "Material UI", 
        "Responsive Design", "RESTful APIs", "PWA", "Node.js", "Express.js", "MongoDB", "PostgreSQL", 
        "MySQL", "SQLite", "JWT", "Firebase", "Stripe", "Jest", "Git", "GitLab CI", "Prisma", 
        "Sequelize", "Docker", "MVC", "Microservices", "Micro frontends", "Role-Based Access Control"
      ],
      socials: {
        github: "https://github.com/ahmad5599",
        linkedin: "https://linkedin.com/in/ahmad-hamid",
        email: "ahmadhamid3244@gmail.com",
        phone: "+923494468978",
        portfolio: "http://muhammad-ahmad-hamid.netlify.app"
      }
    }
  });

  // Experience
  await prisma.experience.deleteMany({});
  const experiences = [
    {
      position: "MERN Stack Developer",
      company: "Micro Data Tech Solutions",
      location: "Lahore, Pakistan",
      startDate: new Date("2024-11-01"),
      description: "Developed a Chronic Kidney Disease (CKD) diagnostic system using Microsoft Power Platform, including Power Apps, Power Automate, Model-Driven Apps, and custom C# plugins, helping improve diagnostic workflow and reduce manual errors compared to traditional methods.\n\n" +
        "Built admin dashboard components for a cancer scan tool with React, Styled Components, Redux, and Ant Design, improving UI consistency and maintainability.\n\n" +
        "Set up an automated testing pipeline using Jest, DeepSource, and GitLab CI, increasing test coverage and improving code quality.\n\n" +
        "Integrated third-party Stripe Connect API into a Luma clone for account onboarding and linking flows, along with frontend UI enhancements.\n\n" +
        "Integrated the Corpay payment gateway into Zolvat, a multicurrency banking platform built with Go (microservices architecture) and Vue.js, enabling seamless non-Euro transactions (send and receive) in addition to existing Euro-based transfers.\n\n" +
        "Collaborated with the QA team and directly with clients to identify and resolve bugs, implement feedback-driven improvements, and enhance overall user experience in Logilux, an event management system built with Laravel and Livewire.",
      technologies: ["React", "Redux", "Ant Design", "Jest", "GitLab CI", "Stripe", "Power Platform", "C#", "Go", "Vue.js", "Laravel", "Livewire"],
      order: 1
    },
    {
      position: "Software Engineer",
      company: "Cheapoweb LLC",
      location: "Lahore, Pakistan",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-08-01"),
      description: "Developed a Flutter mobile app QabarSafai App (for Grave Maintenance & Care services), using Firebase for media uploads, real-time data, and serverless backend logic.\n\n" +
        "Built a charity donation platform with Next.js 13, Tailwind CSS, Ant Design, Firestore, and Stripe for secure payment processing.\n\n" +
        "Created a mortgage consulting platform with Next.js 13 and Firebase, featuring responsive service pages and a dynamic contact form.",
      technologies: ["Flutter", "Firebase", "Next.js", "Tailwind CSS", "Ant Design", "Firestore", "Stripe"],
      order: 2
    },
    {
      position: "Freelance Full Stack Developer",
      company: "Fiverr",
      location: "Remote",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2024-01-01"),
      description: "Built a healthcare RCM platform using Next.js 13, Tailwind CSS, Strapi, and PostgreSQL, integrating Strapi CMS for scalable content and data management.",
      technologies: ["Next.js", "Tailwind CSS", "Strapi", "PostgreSQL"],
      order: 3
    },
    {
      position: "Junior Web Developer",
      company: "IT Hobbies",
      location: "Lahore, Pakistan",
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-08-01"),
      description: "Built a crypto data platform with Next.js 12, Tailwind CSS, and Ant Design, reducing API calls by using IndexedDB caching for faster load times.",
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
      location: "Lahore, Pakistan",
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
      date: new Date("2023-01-01"),
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

  console.log({ admin: admin.email, projectsSeeded: projects.length, blog: "hello-world", contact: contact.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

