# Portfolio Website

A modern, full-stack developer portfolio built with Next.js 15, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15 (App Router), React 19, and TypeScript.
- **Admin Dashboard**: Secure CMS to manage projects, blog posts, and profile details.
- **Authentication**: Secure admin login using NextAuth.js v5.
- **Database**: PostgreSQL database managed via Prisma ORM (hosted on Neon).
- **Image Upload**: Integrated with Cloudinary for media management.
- **Email**: Contact form powered by Resend.
- **Security**: Rate limiting and Cloudflare Turnstile CAPTCHA protection.
- **Responsive Design**: Fully responsive UI with Dark Mode support using shadcn/ui.
- **SEO Optimized**: Dynamic sitemap and robots.txt generation.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon) & [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://authjs.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Email**: [Resend](https://resend.com/)
- **Deployment**: [Netlify](https://www.netlify.com/)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL Database (local or cloud)
- Cloudinary Account
- Resend Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the site.

## 🔐 Environment Variables

See `.env.example` for the full list of required environment variables.

## 📝 License

This project is licensed under the MIT License.
