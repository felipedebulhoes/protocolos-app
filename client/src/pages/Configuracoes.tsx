import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Building2, Briefcase, Save,
  Shield, ShieldCheck, ShieldOff, QrCode, KeyRound, CheckCircle2,
  AlertCircle, Loader2, Copy, Check, Users, Trash2, Plus, LogOut, ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DoctorGuard } from "@/components/DoctorGuard";

function ConfiguracoesContent() {
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const inviteMember = trpc.team.invite.useMutation({
    onSuccess: (data) => {
      toast.success(`Convite criado para ${data.email}! Copie o link abaixo e envie para o convidado.`);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("viewer");
      setLastInviteUrl(data.inviteUrl);
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Preencha e-mail e nome completo");
      return;
    }
    inviteMember.mutate({
      email: inviteEmail,
      fullName: inviteName,
      role: inviteRole,
    });
  };

  const { data: teamMembers, isLoading: membersLoading } = trpc.team.list.useQuery();
  const removeMember = trpc.team.remove.useMutation({
    onSuccess: () => {
      toast.success("Membro removido com sucesso!");
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });
  const updateMemberRole = trpc.team.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Permissão atualizada!");
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  // ── Perfil ──────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "Urologia",
    location: "",
    crm: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? user?.name ?? "",
        phone: profile.phone ?? "",
        specialization: profile.specialization ?? "Urologia",
        location: profile.location ?? "",
        crm: profile.crm ?? "",
      });
    }
  }, [profile, user]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (err) => toast.error(`Erro ao salvar: ${err.message}`),
  });

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  // ── 2FA TOTP ────────────────────────────────────────────────────────────
  const { data: totpStatus, isLoading: totpLoading } = trpc.totp.status.useQuery();
  const [totpStep, setTotpStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  const setupInit = trpc.totp.setupInit.useMutation({
    onSuccess: (data) => {
      setQrDataUrl(data.qrDataUrl);
      setTotpSecret(data.secret);
      setTotpStep("verify");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const setupVerify = trpc.totp.setupVerify.useMutation({
    onSuccess: () => {
      utils.totp.status.invalidate();
      setTotpStep("idle");
      setTotpCode("");
      toast.success("2FA ativado com sucesso! Sua conta está mais segura.");
    },
    onError: (err) => toast.error(err.message),
  });

  const disableTotp = trpc.totp.disable.useMutation({
    onSuccess: () => {
      utils.totp.status.invalidate();
      setTotpStep("idle");
      setTotpCode("");
      toast.success("2FA desativado.");
    },
    onError: (err) => toast.error(err.message),
  });

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações de perfil e segurança</p>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      {/* ── Perfil do Administrador ── */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B87333] to-[#1C3D5A] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile?.name ?? user?.name ?? "Dr. Felipe de Bulhões"}
              </h2>
              <p className="text-sm text-muted-foreground">Administrador do ProtoUro</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#B87333] hover:bg-[#B87333]/90"
            >
              Editar Perfil
            </Button>
          )}
        </div>

        {profileLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando perfil...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Nome Completo
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> E-mail
              </label>
              <Input
                value={user?.email ?? ""}
                disabled
                className="bg-muted border-border text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Gerenciado pelo provedor de login</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="(11) 98112-4455"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Especialização
              </label>
              <Input
                name="specialization"
                value={formData.specialization}
                onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))}
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Localização
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                disabled={!isEditing}
                placeholder="São Paulo, SP"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> CRM
              </label>
              <Input
                name="crm"
                value={formData.crm}
                onChange={e => setFormData(p => ({ ...p, crm: e.target.value }))}
                disabled={!isEditing}
                placeholder="123456/SP"
                className="bg-background border-border"
              />
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-[#B87333] hover:bg-[#B87333]/90"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        )}
      </Card>

      {/* ── Autenticação de Dois Fatores (2FA) ── */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#B87333]" />
            Autenticação de Dois Fatores (2FA)
          </h3>
          {!totpLoading && (
            <Badge
              className={totpStatus?.enabled
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-muted text-muted-foreground border-border"
              }
            >
              {totpStatus?.enabled ? (
                <><ShieldCheck className="w-3 h-3 mr-1" /> Ativado</>
              ) : (
                <><ShieldOff className="w-3 h-3 mr-1" /> Desativado</>
              )}
            </Badge>
          )}
        </div>

        {totpStep === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adicione uma camada extra de segurança usando um aplicativo autenticador
              (Google Authenticator, Authy, etc.) para gerar códigos de verificação.
            </p>
            {totpStatus?.enabled ? (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setTotpStep("disable")}
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Desativar 2FA
              </Button>
            ) : (
              <Button
                className="bg-[#1C3D5A] hover:bg-[#1C3D5A]/90"
                onClick={() => { setTotpStep("setup"); setupInit.mutate(); }}
                disabled={setupInit.isPending}
              >
                {setupInit.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4 mr-2" />
                )}
                Ativar 2FA
              </Button>
            )}
          </div>
        )}

        {totpStep === "setup" && (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando QR Code...
          </div>
        )}

        {totpStep === "verify" && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">
                1. Escaneie o QR Code com seu aplicativo autenticador
              </p>
              {qrDataUrl && (
                <div className="flex justify-center mb-4">
                  <img src={qrDataUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-lg border border-border" />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mb-2">
                Ou insira o código manualmente:
              </p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs font-mono bg-background border border-border px-3 py-1.5 rounded">
                  {totpSecret}
                </code>
                <Button size="sm" variant="outline" onClick={copySecret}>
                  {secretCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                2. Digite o código de 6 dígitos gerado pelo aplicativo
              </p>
              <div className="flex gap-3">
                <Input
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-widest w-40"
                />
                <Button
                  onClick={() => setupVerify.mutate({ code: totpCode })}
                  disabled={totpCode.length !== 6 || setupVerify.isPending}
                  className="bg-[#B87333] hover:bg-[#B87333]/90"
                >
                  {setupVerify.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Verificar e Ativar
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={() => { setTotpStep("idle"); setTotpCode(""); }}>
              Cancelar
            </Button>
          </div>
        )}

        {totpStep === "disable" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Confirmar desativação do 2FA
              </p>
              <p className="text-sm text-red-600">
                Digite o código atual do seu aplicativo autenticador para confirmar.
              </p>
            </div>
            <div className="flex gap-3">
              <Input
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest w-40"
              />
              <Button
                onClick={() => disableTotp.mutate({ code: totpCode })}
                disabled={totpCode.length !== 6 || disableTotp.isPending}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {disableTotp.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldOff className="w-4 h-4 mr-2" />
                )}
                Confirmar Desativação
              </Button>
            </div>
            <Button variant="outline" onClick={() => { setTotpStep("idle"); setTotpCode(""); }}>
              Cancelar
            </Button>
          </div>
        )}
      </Card>

      {/* ── Informações da Conta ── */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#B87333]" />
          Informações da Conta
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">ID da Conta</span>
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {user?.openId?.slice(0, 12)}...
            </code>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Nível de Acesso</span>
            <Badge className="bg-[#B87333]/10 text-[#B87333] border-[#B87333]/20">
              Administrador
            </Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Autenticação</span>
            <span className="text-foreground font-medium">Google OAuth</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">2FA</span>
            <span className={totpStatus?.enabled ? "text-green-600 font-medium" : "text-muted-foreground"}>
              {totpStatus?.enabled ? "Ativado" : "Desativado"}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Gerenciamento de Membros da Equipe ── */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-[#B87333]" />
            Membros da Equipe
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Convide médicos, residentes ou estagiários para acessar os protocolos. Cada membro receberá um link de convite por e-mail.
        </p>

        {/* Formulário de convite */}
        <div className="space-y-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="font-semibold text-sm">Convidar Novo Membro</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Nome completo"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="bg-background border-border"
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-background border-border"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "viewer" | "editor" | "admin")}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button
            className="w-full bg-[#B87333] hover:bg-[#B87333]/90"
            onClick={handleInvite}
            disabled={inviteMember.isPending}
          >
            {inviteMember.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Gerar Link de Convite
          </Button>

          {lastInviteUrl && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Link de convite gerado — envie para o convidado:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs break-all bg-white border border-green-200 px-2 py-1.5 rounded flex-1">
                  {lastInviteUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => { navigator.clipboard.writeText(lastInviteUrl); toast.success("Link copiado!"); }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de membros */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Membros Ativos</h4>
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#B87333]/10 text-[#B87333] border-[#B87333]/20 text-xs">
                      {member.role === "viewer" ? "Visualizador" : member.role === "editor" ? "Editor" : "Admin"}
                    </Badge>
                    <Badge className={member.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {member.status === "active" ? "Ativo" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum membro adicionado ainda. Convide alguém para começar!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function Configuracoes() {
  return (
    <DoctorGuard>
      <ConfiguracoesContent />
    </DoctorGuard>
  );
}
