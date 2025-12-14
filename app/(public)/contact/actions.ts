"use server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  website: z.string().optional(), // Honeypot field
  token: z.string().optional(), // Turnstile token
});

export type ContactFormState = {
  success: boolean;
  message?: string;
  requiresCaptcha?: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  inputs?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
};

async function verifyTurnstileToken(token: string) {
  if (!env.turnstile.secretKey) return true; // Skip if not configured

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: env.turnstile.secretKey,
      response: token,
    }),
  });

  const data = await res.json();
  return data.success;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
    website: formData.get("website") as string,
    token: (formData.get("token") as string) || undefined,
  };

  // Validate input
  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      inputs: rawData,
      requiresCaptcha: prevState.requiresCaptcha,
    };
  }

  const { name, email, subject, message, website, token } = validatedFields.data;

  // 1. Honeypot Check
  if (website) {
    return { success: true, message: "Message sent successfully!" };
  }

  // 2. Rate Limiting & Smart CAPTCHA
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await prisma.contact.count({
      where: {
        email,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Hard block if too many messages
    if (recentMessages >= 5) {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
        inputs: rawData,
      };
    }

    // Conditional CAPTCHA: Require if user has sent > 1 message recently OR if explicitly requested previously
    const shouldRequireCaptcha = recentMessages >= 1 || prevState.requiresCaptcha;

    if (shouldRequireCaptcha) {
      if (!token) {
        return {
          success: false,
          message: "Please complete the security check.",
          inputs: rawData,
          requiresCaptcha: true,
        };
      }

      const isValid = await verifyTurnstileToken(token);
      if (!isValid) {
        return {
          success: false,
          message: "Security check failed. Please try again.",
          inputs: rawData,
          requiresCaptcha: true,
        };
      }
    }

    // Save to database
    await prisma.contact.create({
      data: {
        name,
        email,
        message: `Subject: ${subject}\n\n${message}`,
      },
    });

    // Send email via Resend
    if (env.resend.apiKey) {
      const resend = new Resend(env.resend.apiKey);
      const toEmail = env.resend.contactEmail || "onboarding@resend.dev";

      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: toEmail,
        subject: `[Portfolio] ${subject}`,
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    } else {
      console.warn("Resend API key not configured. Logging message instead.");
      console.log("Contact Form Submission:", { name, email, subject, message });
    }

    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      inputs: rawData,
    };
  }
}
