import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Building2, Briefcase, Save, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Configuracoes() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    specialization: "Urologia",
    location: "Campinas, SP",
    crm: "123456/SP",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implementar chamada ao backend para salvar dados
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações de perfil e dados de administrador</p>
      </div>

      {/* Perfil do Administrador */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B87333] to-[#1C3D5A] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name || "Dr. Felipe de Bulhões"}</h2>
              <p className="text-sm text-muted-foreground">Administrador do ProtoUro</p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className={isEditing ? "" : "bg-[#B87333] hover:bg-[#B87333]/90"}
          >
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </Button>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mail
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="(11) 98112-4455"
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Especialização
            </label>
            <Input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              CRM
            </label>
            <Input
              type="text"
              name="crm"
              value={formData.crm}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-background border-border"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#B87333] hover:bg-[#B87333]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </Card>

      {/* Informações de Segurança */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#B87333]" />
          Segurança
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Senha</p>
            <p className="text-sm text-muted-foreground mb-3">Altere sua senha regularmente para manter sua conta segura</p>
            <Button variant="outline">Alterar Senha</Button>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Sessões Ativas</p>
            <p className="text-sm text-muted-foreground mb-3">Você tem 1 sessão ativa neste navegador</p>
            <Button variant="outline">Gerenciar Sessões</Button>
          </div>
        </div>
      </Card>

      {/* Informações da Conta */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Informações da Conta</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID da Conta:</span>
            <span className="font-mono text-foreground">{user?.openId?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-semibold text-[#B87333]">{user?.role || "admin"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Membro desde:</span>
            <span className="text-foreground">2026</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
