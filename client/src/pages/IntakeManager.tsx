import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Aguardando", cls: "bg-slate-200 text-slate-600" },
    submitted: { label: "Recebida", cls: "bg-amber-100 text-amber-700" },
    reviewed: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
  };
  const m = map[status] ?? map.pending;
  return <Badge className={`text-[10px] border-0 ${m.cls}`}>{m.label}</Badge>;
}

export default function IntakeManager() {
  const utils = trpc.useUtils();
  const listQuery = trpc.intake.list.useQuery();
  const createLink = trpc.intake.createLink.useMutation();

  const [open, setOpen] = useState(false);
  const [invitedName, setInvitedName] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [invitedPhone, setInvitedPhone] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function linkFor(token: string) {
    return `${window.location.origin}/ficha/${token}`;
  }

  async function handleCreate() {
    try {
      const res = await createLink.mutateAsync({
        invitedName: invitedName || undefined,
        invitedEmail: invitedEmail || undefined,
        invitedPhone: invitedPhone || undefined,
      });
      setCreatedToken(res.token);
      utils.intake.list.invalidate();
      toast.success("Link gerado com sucesso!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar o link.");
    }
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(linkFor(token));
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 1500);
  }

  function resetDialog() {
    setInvitedName("");
    setInvitedEmail("");
    setInvitedPhone("");
    setCreatedToken(null);
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1C3D5A] flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-[#B87333]" />
              Fichas Pré-Consulta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gere o link para o paciente preencher a ficha e enviar exames antes da consulta.
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) resetDialog();
            }}
          >
            <DialogTrigger asChild>
              <Button className="copper-gradient text-white font-semibold">
                <Plus className="w-4 h-4 mr-1" /> Gerar novo link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar link de ficha pré-consulta</DialogTitle>
              </DialogHeader>
              {!createdToken ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Os dados abaixo são opcionais e servem apenas para identificar o link na sua lista.
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">Nome do paciente</label>
                    <Input value={invitedName} onChange={(e) => setInvitedName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">E-mail (opcional)</label>
                    <Input value={invitedEmail} onChange={(e) => setInvitedEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">Telefone (opcional)</label>
                    <Input value={invitedPhone} onChange={(e) => setInvitedPhone(e.target.value)} />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={createLink.isPending}
                    className="w-full bg-[#1C3D5A] text-white font-semibold"
                  >
                    {createLink.isPending ? "Gerando..." : "Gerar link"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Link pronto para compartilhar</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1">{linkFor(createdToken)}</span>
                    <Button size="sm" variant="outline" className="bg-white" onClick={() => copyLink(createdToken)}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envie esse link ao paciente por WhatsApp ou e-mail. Ao enviar a ficha, ele aparece na lista como
                    "Recebida".
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {listQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
          </div>
        ) : !listQuery.data || listQuery.data.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Nenhuma ficha gerada ainda. Clique em "Gerar novo link" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {listQuery.data.map((f) => {
              const name = f.invitedName || "Paciente sem nome";
              const isSubmitted = f.status !== "pending";
              const row = (
                <Card className="border border-slate-100 hover:border-[#B87333]/40 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C3D5A] truncate">{name}</span>
                        {statusBadge(f.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {f.invitedEmail || f.invitedPhone || "—"}
                        {f.submittedAt && (
                          <> • Enviada em {new Date(f.submittedAt).toLocaleDateString("pt-BR")}</>
                        )}
                      </div>
                    </div>
                    {isSubmitted ? (
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          copyLink(f.token);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" /> Copiar link
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
              return isSubmitted ? (
                <Link key={f.id} href={`/fichas/${f.id}`}>
                  {row}
                </Link>
              ) : (
                <div key={f.id}>{row}</div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
