/**
 * Pure, framework-agnostic rules for user-management actions.
 * Extracted so they can be unit-tested without a database.
 */

export type DeleteUserCheckInput = {
  /** id of the user attempting the deletion */
  actorId: number;
  /** id of the user being deleted */
  targetId: number;
  /** role of the user being deleted */
  targetRole: "admin" | "user";
  /** total number of admins currently in the system */
  totalAdmins: number;
};

export type RuleResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Determines whether a delete-user action is allowed.
 *
 * Rules:
 * 1. You cannot delete your own account.
 * 2. You cannot delete the last remaining admin.
 */
export function canDeleteUser(input: DeleteUserCheckInput): RuleResult {
  if (input.actorId === input.targetId) {
    return { ok: false, reason: "Você não pode apagar sua própria conta." };
  }

  if (input.targetRole === "admin" && input.totalAdmins <= 1) {
    return {
      ok: false,
      reason: "Não é possível apagar o último administrador.",
    };
  }

  return { ok: true };
}

/**
 * Validates a setup-link request target. The user must exist and have an email.
 */
export function canSendSetupLink(target: {
  exists: boolean;
  email: string | null;
}): RuleResult {
  if (!target.exists) {
    return { ok: false, reason: "Usuário não encontrado." };
  }
  if (!target.email) {
    return { ok: false, reason: "Usuário não possui e-mail cadastrado." };
  }
  return { ok: true };
}
