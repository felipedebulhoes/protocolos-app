import { useParams } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, ShieldX, Loader2, BadgeCheck } from "lucide-react";

const LOGO = "/manus-storage/assinatura_felipe_1e22a021.png"; // assinatura (fallback visual)

/**
 * Página PÚBLICA de verificação de autenticidade de documentos (orçamentos).
 * Acessível sem login para que o convênio possa escanear o QR Code impresso
 * no documento e confirmar que ele foi realmente emitido pelo consultório.
 * NÃO expõe dados sensíveis do prontuário — apenas confirma a emissão.
 */
export default function VerifyDocument() {
  const params = useParams<{ codigo?: string }>();
  const [manualCode, setManualCode] = useState("");
  const codeFromUrl = (params.codigo || "").toUpperCase();
  const [activeCode, setActiveCode] = useState(codeFromUrl);

  const { data, isLoading, isFetching } = trpc.verification.getByCode.useQuery(
    { code: activeCode },
    { enabled: activeCode.length >= 3 },
  );

  const loading = isLoading || isFetching;

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center px-4 py-10">
      {/* Cabeçalho com identidade */}
      <div className="w-full max-w-xl text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1C3D5A] mb-4">
          <BadgeCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-[#1C3D5A]">
          Verificação de Autenticidade
        </h1>
        <p className="text-sm text-[#5b6b78] mt-2">
          Confirme a autenticidade de um documento emitido pelo consultório do
          Dr. Felipe de Bulhões Ojeda.
        </p>
      </div>

      {/* Caixa de busca manual */}
      <div className="w-full max-w-xl bg-white rounded-xl border border-[#E5E0D5] p-5 mb-6">
        <label className="block text-xs font-medium text-[#5b6b78] mb-2">
          Código de verificação (impresso no documento)
        </label>
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Ex.: ORC-7K3F9A"
            className="flex-1 rounded-lg border border-[#D8D2C5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333]/40"
          />
          <button
            onClick={() => setActiveCode(manualCode.trim())}
            className="rounded-lg bg-[#B87333] px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.97]"
          >
            Verificar
          </button>
        </div>
      </div>

      {/* Resultado */}
      <div className="w-full max-w-xl">
        {loading && activeCode.length >= 3 && (
          <div className="flex items-center justify-center gap-2 text-[#5b6b78] py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Verificando documento...
          </div>
        )}

        {!loading && activeCode.length >= 3 && data && !data.valid && (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
            <ShieldX className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-600">
              Documento não encontrado
            </h2>
            <p className="text-sm text-[#5b6b78] mt-2">
              O código <strong>{activeCode}</strong> não corresponde a nenhum
              documento emitido. Verifique se digitou corretamente.
            </p>
          </div>
        )}

        {!loading && data && data.valid && (
          <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-200 p-5 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-700">
                  Documento autêntico
                </h2>
                <p className="text-xs text-emerald-600">
                  Emitido oficialmente pelo consultório.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <Row label="Código" value={data.code} />
              <Row
                label="Tipo"
                value={data.docType === "orcamento" ? "Orçamento cirúrgico" : "Documento"}
              />
              <Row label="Paciente" value={data.patientName || "—"} />
              <Row label="Procedimento" value={data.procedureName || "—"} />
              {data.totalLabel ? <Row label="Valor" value={data.totalLabel} /> : null}
              <Row label="Emitido por" value={data.issuedByName} />
              <Row label="Registro" value={data.issuedByCrm} />
              <Row
                label="Data de emissão"
                value={
                  data.issuedAt
                    ? new Date(data.issuedAt).toLocaleString("pt-BR")
                    : "—"
                }
              />
              {data.validUntil ? (
                <Row label="Válido até" value={data.validUntil} />
              ) : null}
              {data.icpSigned ? (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1C3D5A]/10 px-3 py-1 text-xs font-medium text-[#1C3D5A]">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Assinado digitalmente (ICP-Brasil)
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#9aa4ac] mt-10 text-center max-w-md">
        Esta página confirma apenas a emissão e a integridade do documento. Nenhum
        dado clínico do prontuário é exibido. Em caso de dúvidas, entre em contato
        com o consultório.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#F0ECE3] pb-2">
      <span className="text-[#9aa4ac]">{label}</span>
      <span className="font-medium text-[#1C3D5A] text-right">{value}</span>
    </div>
  );
}
