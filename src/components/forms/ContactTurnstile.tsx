"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { contactContent, turnstileConfig } from "@/content/contact";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      language: string;
      theme: string;
      size: string;
      "response-field": boolean;
      "refresh-expired": string;
      "refresh-timeout": string;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface ContactTurnstileProps {
  siteKey: string;
  onTokenChange: (token: string) => void;
}

export function ContactTurnstile({ siteKey, onTokenChange }: ContactTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!siteKey || isReady) return;
    const timeout = window.setTimeout(() => setHasError(true), 20000);
    return () => window.clearTimeout(timeout);
  }, [siteKey, isReady]);

  useEffect(() => {
    const container = containerRef.current;
    const turnstile = window.turnstile;
    if (!siteKey || !isReady || !container || !turnstile) return;

    const clearToken = () => onTokenChange("");
    const widgetId = turnstile.render(container, {
      sitekey: siteKey,
      action: turnstileConfig.action,
      language: "es",
      theme: "light",
      size: container.clientWidth < 300 ? "compact" : "flexible",
      "response-field": false,
      "refresh-expired": "auto",
      "refresh-timeout": "auto",
      callback: (token) => {
        setHasError(false);
        onTokenChange(token);
      },
      "error-callback": () => {
        clearToken();
        setHasError(true);
      },
      "expired-callback": clearToken,
      "timeout-callback": clearToken,
    });

    return () => turnstile.remove(widgetId);
  }, [siteKey, isReady, onTokenChange]);

  return (
    <div className="mb-20">
      {siteKey ? (
        <Script
          id="contact-turnstile"
          src={turnstileConfig.scriptUrl}
          strategy="afterInteractive"
          onReady={() => {
            setHasError(false);
            setIsReady(true);
          }}
          onError={() => {
            onTokenChange("");
            setHasError(true);
          }}
        />
      ) : null}
      <div ref={containerRef} aria-label={contactContent.protection.label} style={{ minHeight: 65 }} />
      {!siteKey || hasError ? (
        <p role="alert" className="form_error">{contactContent.protection.unavailable}</p>
      ) : null}
      <noscript>{contactContent.protection.unavailable}</noscript>
    </div>
  );
}
