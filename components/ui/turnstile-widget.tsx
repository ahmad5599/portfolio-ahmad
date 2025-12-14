"use client";

import { env } from "@/lib/env";
import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        element: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed, though usually we keep the script
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !env.turnstile.siteKey) return;

    if (window.turnstile) {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: env.turnstile.siteKey,
        callback: (token) => onVerify(token),
        "error-callback": onError,
        "expired-callback": onExpire,
        theme: "auto",
      });
      setWidgetId(id);
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [scriptLoaded, onVerify, onError, onExpire, widgetId]);

  if (!env.turnstile.siteKey) {
    return (
      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        Turnstile Site Key is missing.
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
