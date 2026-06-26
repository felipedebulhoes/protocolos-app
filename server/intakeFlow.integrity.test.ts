import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Integridade do fluxo de ficha pré-consulta (auditoria 2026-06-26):
 * Garante que os dados preenchidos pelo paciente e os exames enviados
 * sejam persistidos e fiquem acessíveis ao médico.
 *
 * Pontos críticos auditados (asserções sobre o código-fonte, sem custo de DB):
 *  1) Upload público vincula o arquivo ao intakeFormId (ponte paciente→médico).
 *  2) O submit vincula exames órfãos (patientId null) ao paciente criado.
 *  3) O submit persiste as respostas (answers) e o paciente (upsert).
 *  4) O detail do médico devolve answers + examFiles + examResults.
 *  5) A UI do médico expõe download/visualização via fileUrl.
 */

const read = (rel: string) => readFileSync(resolve(__dirname, rel), "utf-8");

describe("Integridade: fluxo de ficha pré-consulta", () => {
  const examsRouter = read("routers/exams.ts");
  const intakeRouter = read("routers/intake.ts");
  const intakeDetailUI = read("../client/src/pages/IntakeDetail.tsx");
  const fichaPublicaUI = read("../client/src/pages/FichaPublica.tsx");

  it("1) upload público resolve intakeFormId a partir do token e persiste o arquivo", () => {
    // O fluxo público deve buscar a ficha pelo token e amarrar o arquivo a ela.
    expect(examsRouter).toContain("getIntakeByToken(input.intakeToken)");
    expect(examsRouter).toContain("intakeFormId = form.id");
    // O arquivo é gravado no storage e registrado no banco.
    expect(examsRouter).toContain("storagePut(");
    expect(examsRouter).toContain("db.createExamFile(");
  });

  it("2) submit reatribui exames órfãos (patientId null) ao paciente criado", () => {
    expect(intakeRouter).toContain("listExamFilesByIntake(form.id)");
    // Reassociação: se o exame não tem paciente, recebe o paciente recém-criado.
    expect(intakeRouter).toContain("if (!ef.patientId)");
    expect(intakeRouter).toContain("updateExamFile(ef.id, { patientId: patient.id })");
  });

  it("3) submit persiste as respostas e faz upsert do paciente", () => {
    expect(intakeRouter).toContain("upsertPatientByEmail(");
    expect(intakeRouter).toContain("updateIntakeForm(form.id");
    expect(intakeRouter).toContain('status: "submitted"');
    expect(intakeRouter).toContain("patientId: patient.id");
    expect(intakeRouter).toContain("answers,");
  });

  it("4) detail do médico devolve answers, examFiles e examResults", () => {
    // A query é protegida por ownerProcedure (somente o médico/owner).
    expect(intakeRouter).toContain("detail: ownerProcedure");
    expect(intakeRouter).toContain("listExamFilesByIntake(form.id)");
    expect(intakeRouter).toContain("listExamResultsByPatient");
    expect(intakeRouter).toContain("return { form, patient, examFiles, examResults }");
  });

  it("5) a UI do médico permite baixar e visualizar os exames via fileUrl", () => {
    expect(intakeDetailUI).toContain("detailQuery.data?.examFiles");
    expect(intakeDetailUI).toContain("f.fileUrl");
    expect(intakeDetailUI).toContain("download={f.fileName}");
  });

  it("6) a ficha pública envia o exame com o intakeToken e depois submete as respostas", () => {
    expect(fichaPublicaUI).toContain("trpc.exams.uploadPublic.useMutation()");
    expect(fichaPublicaUI).toContain("intakeToken: token");
    expect(fichaPublicaUI).toContain("trpc.intake.submit.useMutation()");
    expect(fichaPublicaUI).toContain("submitMutation.mutateAsync({ token, answers })");
  });
});
