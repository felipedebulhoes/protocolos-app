// One-time data migration: encrypts any patient.cpf values that are still
// stored in plaintext (legacy rows, or rows inserted before CPF encryption
// existed). Safe to re-run — already-encrypted values ("v1:...") are
// skipped, so this is idempotent.
//
// Run after applying drizzle/migrations/0001_*.sql (which widens the cpf
// column) and after setting CPF_ENCRYPTION_KEY in the environment:
//
//   npx tsx scripts/encrypt-existing-cpfs.ts
//
import "dotenv/config";
import { db } from "../server/_core/dbClient";
import { patients } from "../drizzle/schema";
import { encryptCpf, hasCpfEncryptionKey } from "../server/_core/crypto";
import { isNotNull } from "drizzle-orm";
import { eq } from "drizzle-orm";

async function main() {
  if (!hasCpfEncryptionKey()) {
    console.error(
      "CPF_ENCRYPTION_KEY is not set. Set it in your environment before running this script.",
    );
    process.exit(1);
  }

  const rows = await db
    .select({ id: patients.id, cpf: patients.cpf })
    .from(patients)
    .where(isNotNull(patients.cpf));

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.cpf) continue;
    if (row.cpf.startsWith("v1:")) {
      skipped++;
      continue;
    }
    await db.update(patients).set({ cpf: encryptCpf(row.cpf) }).where(eq(patients.id, row.id));
    migrated++;
  }

  console.log(`Done. Encrypted ${migrated} plaintext CPF value(s), skipped ${skipped} already-encrypted.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
