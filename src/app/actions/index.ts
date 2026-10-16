"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { contactContent, turnstileConfig } from "@/content/contact";
import { takeContactAttempt, takeContactEmailSlot } from "@/lib/contact-rate-limit";
import { verifyContactTurnstile } from "@/lib/contact-turnstile";

export type SubmitResult = { ok: boolean; error?: string };

export async function submitContact(formData: FormData): Promise<SubmitResult> {
    if (String(formData.get("website") ?? "").trim()) return { ok: true };

    const name = String(formData.get("nombre_completo") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("telefono") ?? "").trim();
    const projectType = String(formData.get("tipo_proyecto") ?? "").trim();
    const projectStage = String(formData.get("etapa_proyecto") ?? "").trim();
    const hasPlans = String(formData.get("tiene_plano") ?? "").trim();
    const message = String(formData.get("mensaje") ?? "").trim();

    if (
        !name || name.length > 150 ||
        email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
        !phone || phone.length > 50 ||
        !["Cocina", "Ambiente completo", "Casa completa", "Otro"].includes(projectType) ||
        !["Obra nueva", "Remodelación", "Idea a futuro"].includes(projectStage) ||
        !["Sí", "En proceso", "No todavía"].includes(hasPlans) ||
        !message || message.length > 5000
    ) {
        return { ok: false, error: contactContent.invalidData };
    }

    // Read secrets at request time. Static builds need no SMTP credentials.
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? "465");
    const secure = process.env.SMTP_SECURE ?? "true";
    const from = process.env.SMTP_FROM || user;
    const to = process.env.SMTP_TO || user;

    if (
        !host || !user || !pass || !from || !to ||
        !["true", "false"].includes(secure) ||
        !((port === 465 && secure === "true") || (port === 587 && secure === "false"))
    ) {
        console.error("Contact SMTP runtime configuration is incomplete or invalid.");
        return { ok: false, error: contactContent.unavailable };
    }

    // Nginx must overwrite this header. Missing headers share a conservative limit.
    const requestHeaders = await headers();
    const clientIp = requestHeaders.get("x-real-ip") || "unknown";
    if (!takeContactAttempt(clientIp)) return { ok: false, error: contactContent.rateLimited };

    const token = formData.get(turnstileConfig.tokenFieldName);
    const verification = await verifyContactTurnstile(typeof token === "string" ? token.trim() : "", clientIp);
    if (verification !== "verified") {
        return {
            ok: false,
            error: verification === "unavailable" ? contactContent.protection.unavailable : contactContent.protection.invalid,
        };
    }
    if (!takeContactEmailSlot()) return { ok: false, error: contactContent.rateLimited };

    try {
        const transport = nodemailer.createTransport({
            host,
            port,
            secure: secure === "true",
            requireTLS: secure === "false",
            auth: { user, pass },
            tls: { minVersion: "TLSv1.2" },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            disableFileAccess: true,
            disableUrlAccess: true,
        });

        const result = await transport.sendMail({
            from,
            to,
            replyTo: email,
            subject: contactContent.subject,
            text: [
                `Nombre: ${name}`,
                `Email: ${email}`,
                `Teléfono: ${phone}`,
                `Tipo de proyecto: ${projectType}`,
                `Etapa del proyecto: ${projectStage}`,
                `Plano o medidas: ${hasPlans}`,
                "",
                `Mensaje:\n${message}`,
            ].join("\n"),
        });

        if (!result.accepted.length || result.rejected.length) {
            throw new Error("SMTP recipient rejected");
        }
        return { ok: true };
    } catch (error) {
        // Do not log credentials or the visitor's personal data.
        console.error("Contact SMTP submission failed:", error instanceof Error ? error.name : "Unknown error");
        return { ok: false, error: contactContent.sendError };
    }
}
