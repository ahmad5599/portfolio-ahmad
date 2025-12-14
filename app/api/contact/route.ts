import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  website: z.string().optional(), // Honeypot field
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = contactSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message, website } = parsed.data;

    // 1. Honeypot Check
    if (website) {
      // If the hidden field is filled, it's likely a bot.
      // Return success to fool the bot, but don't process.
      return NextResponse.json({ success: true, message: "Message sent" });
    }

    // 2. Rate Limiting (Simple DB check)
    // Check if this email has sent a message in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await prisma.contact.count({
      where: {
        email,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentMessages >= 5) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Save to database
    try {
      await prisma.contact.create({
        data: {
          name,
          email,
          message: `Subject: ${subject}\n\n${message}`,
        },
      });
    } catch (dbError) {
      console.error("Failed to save contact to database:", dbError);
      return NextResponse.json(
        { error: "Failed to save message. Please try again." },
        { status: 500 }
      );
    }

    if (!env.resend.apiKey) {
      console.warn("Resend API key not configured. Logging message instead.");
      console.log("Contact Form Submission:", { name, email, subject, message });
      return NextResponse.json({ success: true, message: "Message logged (dev mode)" });
    }

    const resend = new Resend(env.resend.apiKey);
    const toEmail = env.resend.contactEmail || "onboarding@resend.dev"; // Default to Resend's testing email if not set

    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // Use verified domain in prod
      to: toEmail,
      subject: `[Portfolio] ${subject}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
