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

  const project = await prisma.project.upsert({
    where: { slug: "sample-project" },
    update: {},
    create: {
      title: "Sample Project",
      slug: "sample-project",
      summary: "A starter project seeded via Prisma",
      description: "This is a placeholder project. Replace with your real work.",
      techStack: ["Next.js", "TypeScript", "Tailwind", "Prisma"],
      featured: true,
      order: 1,
    },
  });

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

  const contact = await prisma.contact.create({
    data: {
      name: "Test Sender",
      email: "sender@example.com",
      message: "This is a seeded contact message.",
      read: false,
      replied: false,
    },
  });

  console.log({ admin: admin.email, project: project.slug, blog: blog.slug, contact: contact.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
