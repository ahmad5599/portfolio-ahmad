"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { useActionState, useState } from "react";
import { submitContactForm } from "./actions";

const initialState = {
  success: false,
  message: "",
  requiresCaptcha: false,
  inputs: {
    name: "",
    email: "",
    subject: "",
    message: "",
  }
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const [token, setToken] = useState("");

  if (state.success) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center text-green-600 dark:text-green-400">
        <h3 className="text-lg font-semibold">Message Sent!</h3>
        <p className="mt-2">Thanks for reaching out. I'll get back to you soon.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
         <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {state.message}
         </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <Input 
            id="name" 
            name="name" 
            required 
            placeholder="John Doe" 
            defaultValue={state.inputs?.name}
          />
          {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="john@example.com" 
            defaultValue={state.inputs?.email}
          />
          {state.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">
          Subject
        </label>
        <Input 
          id="subject" 
          name="subject" 
          required 
          placeholder="Project inquiry" 
          defaultValue={state.inputs?.subject}
        />
        {state.errors?.subject && <p className="text-xs text-destructive">{state.errors.subject[0]}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tell me about your project..."
          defaultValue={state.inputs?.message}
        />
        {state.errors?.message && <p className="text-xs text-destructive">{state.errors.message[0]}</p>}
      </div>
      
      {state.requiresCaptcha && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Security Check</label>
          <TurnstileWidget onVerify={setToken} />
          <input type="hidden" name="token" value={token} />
        </div>
      )}

      {/* Honeypot field - hidden from real users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || (state.requiresCaptcha && !token)}>
        {isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
