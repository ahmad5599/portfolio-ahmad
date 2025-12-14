import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact | Portfolio",
  description: "Get in touch with me for freelance work or opportunities.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="mx-auto max-w-xl space-y-8">
        <MotionWrapper className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Contact Me</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a project in mind? Let's talk.
          </p>
        </MotionWrapper>

        <MotionWrapper delay={0.2} className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <ContactForm />
        </MotionWrapper>
      </div>
    </div>
  );
}
