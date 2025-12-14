import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/lib/env";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Muhammad Ahmad Hamid | Full Stack Developer",
    template: "%s | Muhammad Ahmad Hamid",
  },
  description: "Full Stack Software Engineer specializing in the MERN stack, React, Next.js, and Node.js. Building accessible, pixel-perfect, and performant web experiences.",
  keywords: ["Full Stack Developer", "MERN Stack", "React", "Next.js", "Node.js", "Software Engineer", "Portfolio"],
  authors: [{ name: "Muhammad Ahmad Hamid" }],
  creator: "Muhammad Ahmad Hamid",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ahmadhamid.vercel.app",
    title: "Muhammad Ahmad Hamid | Full Stack Developer",
    description: "Full Stack Software Engineer specializing in the MERN stack, React, Next.js, and Node.js.",
    siteName: "Muhammad Ahmad Hamid Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Ahmad Hamid | Full Stack Developer",
    description: "Full Stack Software Engineer specializing in the MERN stack, React, Next.js, and Node.js.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          {children}
          {env.googleAnalyticsId && <GoogleAnalytics gaId={env.googleAnalyticsId} />}
        </ThemeProvider>
      </body>
    </html>
  );
}
