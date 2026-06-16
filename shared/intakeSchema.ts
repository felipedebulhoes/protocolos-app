// ---------------------------------------------------------------------------
// Shared definition of the pre-consultation intake form.
// Used by both the public patient form (frontend) and the scoring/rapport
// logic (backend). Keep field ids stable — they are persisted as JSON keys.
// ---------------------------------------------------------------------------

export type IntakeFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox" // multiple choice (array of values)
  | "scale"; // 0-10 slider/segmented

export type IntakeOption = { value: string; label: string };

export type IntakeField = {
  id: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: IntakeOption[];
  min?: number;
  max?: number;
  /** Whether this answer should feed the protocol-matching engine. */
  matchable?: boolean;
};

export type IntakeSection = {
  id: string;
  title: string;
  description?: string;
  fields: IntakeField[];
};

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "identificacao",
    title: "Seus dados",
    description:
      "Para criarmos seu cadastro e o Dr. Felipe te receber já conhecendo sua história.",
    fields: [
      { id: "fullName", label: "Nome completo", type: "text", required: true },
      { id: "birthDate", label: "Data de nascimento", type: "date", required: true },
      {
        id: "sex",
        label: "Sexo",
        type: "radio",
        required: true,
        options: [
          { value: "masculino", label: "Masculino" },
          { value: "feminino", label: "Feminino" },
          { value: "outro", label: "Outro" },
        ],
      },
      { id: "phone", label: "Telefone / WhatsApp", type: "text", required: true },
      { id: "email", label: "E-mail", type: "text", required: true },
      { id: "city", label: "Cidade", type: "text" },
      { id: "profession", label: "Profissão", type: "text" },
    ],
  },
  {
    id: "motivo",
    title: "Motivo da consulta",
    description: "Conte com suas palavras o que te traz à consulta.",
    fields: [
      {
        id: "mainComplaint",
        label: "Qual o principal motivo da sua consulta?",
        type: "textarea",
        required: true,
        placeholder: "Ex.: dificuldade de ereção há alguns meses, vontade de fazer vasectomia...",
        matchable: true,
      },
      {
        id: "complaintDuration",
        label: "Há quanto tempo isso acontece?",
        type: "select",
        options: [
          { value: "menos_1_mes", label: "Menos de 1 mês" },
          { value: "1_6_meses", label: "1 a 6 meses" },
          { value: "6_12_meses", label: "6 a 12 meses" },
          { value: "mais_1_ano", label: "Mais de 1 ano" },
        ],
      },
      {
        id: "mainGoal",
        label: "O que você espera resolver/alcançar com a consulta?",
        type: "textarea",
        placeholder: "Ex.: voltar a ter vida sexual ativa, investigar fertilidade, etc.",
        matchable: true,
      },
    ],
  },
  {
    id: "sintomas",
    title: "Sintomas",
    description: "Marque tudo o que você tem sentido. Pode marcar mais de um.",
    fields: [
      {
        id: "symptoms",
        label: "Você tem apresentado algum destes sintomas?",
        type: "checkbox",
        matchable: true,
        options: [
          { value: "disfuncao eretil", label: "Dificuldade de ereção" },
          { value: "ejaculacao precoce", label: "Ejaculação precoce" },
          { value: "ejaculacao retardada", label: "Demora/dificuldade para ejacular" },
          { value: "libido", label: "Queda da libido / desejo" },
          { value: "testosterona baixa", label: "Cansaço, fadiga ou baixa disposição" },
          { value: "jato fraco", label: "Jato urinário fraco" },
          { value: "nocturia", label: "Acordar à noite para urinar" },
          { value: "urgencia urinaria", label: "Urgência para urinar" },
          { value: "ardencia para urinar", label: "Ardência ao urinar" },
          { value: "dor escrotal", label: "Dor nos testículos / bolsa escrotal" },
          { value: "peyronie", label: "Curvatura ou dor no pênis" },
          { value: "infertilidade", label: "Dificuldade para ter filhos" },
          { value: "pedra no rim", label: "Cálculo renal / cólica" },
          { value: "incontinencia", label: "Perda involuntária de urina" },
        ],
      },
      {
        id: "ipssBother",
        label: "O quanto seus sintomas urinários incomodam seu dia a dia? (0 = nada, 10 = muito)",
        type: "scale",
        min: 0,
        max: 10,
      },
      {
        id: "iiefConcern",
        label: "O quanto sua saúde sexual te preocupa hoje? (0 = nada, 10 = muito)",
        type: "scale",
        min: 0,
        max: 10,
      },
    ],
  },
  {
    id: "historico",
    title: "Histórico de saúde",
    description: "Informações que ajudam o Dr. Felipe a personalizar a conduta.",
    fields: [
      {
        id: "comorbidities",
        label: "Você tem alguma destas condições?",
        type: "checkbox",
        matchable: true,
        options: [
          { value: "hipertensao", label: "Pressão alta" },
          { value: "diabetes", label: "Diabetes" },
          { value: "colesterol", label: "Colesterol alto" },
          { value: "cardiopatia", label: "Problema cardíaco" },
          { value: "depressao_ansiedade", label: "Depressão / ansiedade" },
          { value: "obesidade", label: "Sobrepeso / obesidade" },
          { value: "tabagismo", label: "Fumante" },
          { value: "anabolizante", label: "Uso atual/prévio de anabolizantes" },
        ],
      },
      {
        id: "medications",
        label: "Quais medicamentos você usa atualmente?",
        type: "textarea",
        placeholder: "Liste medicações de uso contínuo, se houver.",
      },
      {
        id: "allergies",
        label: "Possui alergias a medicamentos?",
        type: "text",
      },
      {
        id: "surgeries",
        label: "Já realizou alguma cirurgia? Quais?",
        type: "textarea",
        matchable: true,
        placeholder: "Ex.: prostatectomia, vasectomia, hérnia...",
      },
      {
        id: "hasChildren",
        label: "Você tem filhos?",
        type: "radio",
        options: [
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" },
        ],
      },
      {
        id: "wantsChildren",
        label: "Tem desejo de ter filhos (agora ou no futuro)?",
        type: "radio",
        matchable: true,
        options: [
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" },
          { value: "talvez", label: "Talvez / não sei" },
        ],
      },
    ],
  },
  {
    id: "expectativas",
    title: "Mais sobre você",
    description: "Para um atendimento mais humano e personalizado.",
    fields: [
      {
        id: "howFoundUs",
        label: "Como você conheceu o Dr. Felipe?",
        type: "select",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "google", label: "Google" },
          { value: "indicacao", label: "Indicação de amigo/familiar" },
          { value: "outro_medico", label: "Indicação de outro médico" },
          { value: "outro", label: "Outro" },
        ],
      },
      {
        id: "additionalNotes",
        label: "Há algo mais que você gostaria que o Dr. Felipe soubesse antes da consulta?",
        type: "textarea",
        matchable: true,
      },
    ],
  },
];

// Helper: flat list of all fields.
export function allIntakeFields(): IntakeField[] {
  return INTAKE_SECTIONS.flatMap((s) => s.fields);
}

// Helper: label lookup by field id.
export function intakeFieldLabel(id: string): string {
  const f = allIntakeFields().find((x) => x.id === id);
  return f?.label ?? id;
}
