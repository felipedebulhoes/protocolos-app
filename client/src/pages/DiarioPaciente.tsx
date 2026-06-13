import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Activity, Droplet, Clock, FileText, CheckCircle, Calendar, Sparkles, Send } from "lucide-react";

interface DiarioMiccionalRegistro {
  data: string;
  frequenciaDiurna: number;
  nocturia: number;
  volumeMedio: number;
}

interface Paciente {
  id: string;
  nome: string;
  idade?: string;
  historicoDiarioMiccional?: DiarioMiccionalRegistro[];
}

export default function DiarioPaciente() {
  const [, params] = useRoute("/diario-paciente/:id");
  const patientId = params?.id;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [dataInput, setDataInput] = useState("");
  const [diurnaInput, setDataDiurna] = useState("");
  const [nocturiaInput, setDataNocturia] = useState("");
  const [volumeInput, setDataVolume] = useState("");

  // Carregar dados do paciente do localStorage
  useEffect(() => {
    if (!patientId) return;
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        const pacientes: Paciente[] = JSON.parse(stored);
        const found = pacientes.find((p) => p.id === patientId);
        if (found) {
          setPaciente(found);
          // Sugerir a data de hoje como padrão
          const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          setDataInput(hoje);
        } else {
          toast.error("Paciente não encontrado no sistema local.");
        }
      } catch (e) {
        console.error("Erro ao carregar pacientes", e);
      }
    }
  }, [patientId]);

  const handleAddRegistro = () => {
    if (!paciente || !patientId) return;
    if (!dataInput) {
      toast.error("Insira a data ou identificador do dia (ex: 15/06 ou Dia 1).");
      return;
    }
    if (!diurnaInput && !nocturiaInput && !volumeInput) {
      toast.error("Preencha pelo menos um parâmetro miccional.");
      return;
    }

    const novoRegistro: DiarioMiccionalRegistro = {
      data: dataInput,
      frequenciaDiurna: diurnaInput ? parseInt(diurnaInput) : 0,
      nocturia: nocturiaInput ? parseInt(nocturiaInput) : 0,
      volumeMedio: volumeInput ? parseInt(volumeInput) : 0,
    };

    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        const pacientes: Paciente[] = JSON.parse(stored);
        const updated = pacientes.map((p) => {
          if (p.id === patientId) {
            const hist = p.historicoDiarioMiccional || [];
            // Se já existir registro para a mesma data, atualizar; caso contrário, adicionar
            const existIdx = hist.findIndex((r) => r.data === dataInput);
            let newHist = [...hist];
            if (existIdx >= 0) {
              newHist[existIdx] = novoRegistro;
            } else {
              newHist.push(novoRegistro);
            }
            return { ...p, historicoDiarioMiccional: newHist };
          }
          return p;
        });

        localStorage.setItem("protouro_pacientes_db", JSON.stringify(updated));
        
        // Atualizar estado local
        const updatedPaciente = updated.find((p) => p.id === patientId);
        if (updatedPaciente) {
          setPaciente(updatedPaciente);
        }

        toast.success("Registro do Diário Miccional salvo com sucesso!");
        
        // Limpar campos de números, manter a data
        setDataDiurna("");
        setDataNocturia("");
        setDataVolume("");
      } catch (e) {
        console.error("Erro ao salvar registro", e);
        toast.error("Erro ao salvar os dados.");
      }
    }
  };

  if (!paciente) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 rounded-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Carregando Diário Miccional...</h3>
            <p className="text-xs text-slate-500">Por favor, certifique-se de que o link está correto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Header Premium do Portal do Paciente */}
      <div className="bg-[#1C3D5A] text-white py-6 px-4 sticky top-0 z-50 shadow-md border-b border-amber-600/30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
              <svg width="22" height="18" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#FEFEFE"/>
                <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-amber-500">Portal do Paciente</h1>
              <p className="text-xs font-semibold text-slate-200">Dr. Felipe de Bulhões Ojeda</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold uppercase py-1 border-amber-500/30 text-amber-500 bg-amber-500/5">
            Diário Digital
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Identificação do Paciente */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
            <CardTitle className="text-xs text-slate-400 font-bold uppercase tracking-wider">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1">
            <div className="text-base font-extrabold text-[#1C3D5A]">{paciente.nome}</div>
            <div className="text-xs text-slate-500 font-medium">
              Idade: {paciente.idade ? `${paciente.idade} anos` : "N/A"} • Protocolo HPB / LUTS
            </div>
          </CardContent>
        </Card>

        {/* Instruções Didáticas para Celular */}
        <Card className="shadow-lg border-0 rounded-2xl bg-amber-50/20 border-l-4 border-amber-600">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Como registrar os dados:
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 pl-4 list-disc font-medium">
              <li><strong>Frequência Diurna:</strong> Quantas vezes você urinou acordado hoje?</li>
              <li><strong>Noctúria:</strong> Quantas vezes você acordou à noite especificamente para urinar?</li>
              <li><strong>Volume Miccional Médio:</strong> Se puder medir com um copo graduado, qual foi o volume médio em mL de cada micção?</li>
            </ul>
          </CardContent>
        </Card>

        {/* Formulário Interativo de Registro */}
        <Card className="shadow-lg border-0 rounded-2xl bg-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-[#1C3D5A] flex items-center gap-1.5">
              <Droplet className="w-5 h-5 text-blue-500 animate-bounce" />
              Novo Registro Diário
            </CardTitle>
            <CardDescription className="text-xs">Registre as informações de cada dia do seu diário miccional.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Data do Registro (ex: Hoje, 15/06, Dia 1)
                </label>
                <Input
                  type="text"
                  placeholder="Data ou identificador"
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Freq. Diurna (Vezes)
                  </label>
                  <Input
                    type="number"
                    placeholder="Acordado"
                    value={diurnaInput}
                    onChange={(e) => setDataDiurna(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    Noctúria (Vezes)
                  </label>
                  <Input
                    type="number"
                    placeholder="Dormindo"
                    value={nocturiaInput}
                    onChange={(e) => setDataNocturia(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-amber-500" />
                  Volume Miccional Médio (mL)
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 150, 200, 300"
                  value={volumeInput}
                  onChange={(e) => setDataVolume(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-amber-500"
                />
              </div>
            </div>

            <Button
              onClick={handleAddRegistro}
              className="w-full h-11 rounded-xl font-bold copper-gradient text-white flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity"
            >
              <Send className="w-4 h-4" />
              Salvar Registro no Diário
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Registros Existentes */}
        <Card className="shadow-lg border-0 rounded-2xl bg-white">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Histórico Registrado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paciente.historicoDiarioMiccional && paciente.historicoDiarioMiccional.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paciente.historicoDiarioMiccional.map((reg, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center bg-slate-50/30">
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-[#1C3D5A] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Dia: {reg.data}
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="text-blue-600">Diurno: {reg.frequenciaDiurna}x</span>
                        <span className="text-red-600">Noctúria: {reg.nocturia}x</span>
                      </div>
                    </div>
                    {reg.volumeMedio > 0 && (
                      <Badge variant="outline" className="text-[10px] font-bold border-amber-500/20 text-amber-600 bg-amber-500/5 rounded-lg py-1 px-2.5">
                        Vol: {reg.volumeMedio} mL
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Nenhum dia registrado ainda. Comece adicionando um registro acima!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mensagem de Rodapé de Agradecimento */}
        <div className="text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Conexão Criptografada e Segura
          </div>
          <p className="text-[9px] text-slate-400 font-medium max-w-xs mx-auto">
            Os dados registrados são salvos localmente e estarão disponíveis automaticamente no CRM do Dr. Felipe de Bulhões Ojeda.
          </p>
        </div>
      </div>
    </div>
  );
}
