/**
 * Heartbeat handler: remind patients who haven't filled their pre-consultation
 * form after 24 hours.
 *
 * Triggered by a project-level cron created via the sandbox CLI:
 *   manus-heartbeat create \
 *     --name remind-pending-intakes \
 *     --cron "0 0 12 * * *" \
 *     --path /api/scheduled/remindPendingIntakes \
 *     --description "Daily 12:00 UTC: WhatsApp reminder for 24h+ pending forms"
 *
 * The handler is idempotent — it only sends reminders to forms that are still
 * "pending" and were created more than 24h ago.
 */

import type { Request, Response } from "express";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function buildWhatsAppUrl(phone: string, name: string | null, token: string): string {
  const link = `https://paciente.felipebulhoes.com/ficha/${token}`;
  const greeting = name?.trim() ? `Olá, ${name.trim()}!` : "Olá!";
  const message =
    `${greeting} Passando para lembrar que sua ficha pré-consulta com o Dr. Felipe de Bulhões ` +
    `(Urologia & Andrologia) ainda está aguardando preenchimento. ` +
    `Leva poucos minutos e ajuda muito na sua consulta:\n\n${link}`;
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export async function remindPendingIntakesHandler(req: Request, res: Response) {
  // Verify the request comes from the Manus cron platform.
  // The platform gateway restricts /api/scheduled/* to cron callers only,
  // so we trust the x-manus-cron-task-uid header as an extra guard.
  const taskUid = req.headers["x-manus-cron-task-uid"] as string | undefined;
  if (!taskUid) {
    return res.status(403).json({ error: "cron-only endpoint" });
  }

  try {
    const pendingForms = await db.listPendingIntakesOlderThan(TWENTY_FOUR_HOURS_MS);

    if (pendingForms.length === 0) {
      return res.json({ ok: true, reminded: 0, message: "No pending forms older than 24h." });
    }

    // Build the summary for the doctor notification.
    const lines: string[] = [
      `${pendingForms.length} ficha(s) pendente(s) há mais de 24h:`,
      "",
    ];

    for (const form of pendingForms) {
      const name = form.invitedName || "Paciente sem nome";
      const contact = form.invitedPhone || form.invitedEmail || "sem contato";
      const createdAt = form.createdAt
        ? new Date(form.createdAt).toLocaleDateString("pt-BR")
        : "—";

      lines.push(`• ${name} (${contact}) — gerada em ${createdAt}`);

      // If the form has a phone number, build a WhatsApp reminder link.
      if (form.invitedPhone) {
        const waUrl = buildWhatsAppUrl(form.invitedPhone, form.invitedName, form.token);
        lines.push(`  WhatsApp: ${waUrl}`);
      }
    }

    lines.push("");
    lines.push("Acesse o painel para gerenciar as fichas: https://protocolos.felipebulhoes.com/fichas");

    await notifyOwner({
      title: `Lembrete: ${pendingForms.length} ficha(s) pendente(s) há +24h`,
      content: lines.join("\n"),
    });

    return res.json({ ok: true, reminded: pendingForms.length });
  } catch (error) {
    console.error("[remindPendingIntakes] error", error);
    return res.status(500).json({
      error: String(error),
      context: { taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}
