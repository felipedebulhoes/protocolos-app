import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  FileText, 
  Activity, 
  Check, 
  X, 
  Calendar, 
  Clipboard,
  AlertCircle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";

interface HormonioRegistro {
  data: string;
  total: number;
  livre?: number;
  shbg?: number;
}

interface DocumentoVinculado {
  id: string;
  titulo: string;
  tipo: "receita" | "atestado" | "laudo";
  data: string;
  conteudo: string;
}

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  queixa: string;
  testosterona: string;
  psa: string;
  hematocrito: string;
  notas: string;
  dataCadastro: string;
  shbg?: string;
  testoLivre?: string;
  historicoHormonal?: HormonioRegistro[];
  documentos?: DocumentoVinculado[];
}

export default function Patients() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [queixa, setQueixa] = useState("");
  const [testosterona, setTestosterona] = useState("");
  const [psa, setPsa] = useState("");
  const [hematocrito, setHematocrito] = useState("");
  const [notas, setNotas] = useState("");
  const [shbg, setShbg] = useState("");
  const [testoLivre, setTestoLivre] = useState("");
  const [expandedId, setEditingExpandedId] = useState<string | null>(null);

  // Estados para inserção de novo ponto no gráfico
  const [newTotal, setNewTotal] = useState("");
  const [newLivre, setNewLivre] = useState("");
  const [newShbg, setNewShbg] = useState("");
  const [newDataPonto, setNewDataPonto] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));

  // Carregar pacientes do LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        setPacientes(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao carregar pacientes:", e);
      }
    }
  }, []);

  // Salvar pacientes no LocalStorage
  const saveToStorage = (newPacientes: Paciente[]) => {
    setPacientes(newPacientes);
    localStorage.setItem("protouro_pacientes_db", JSON.stringify(newPacientes));
  };

  const handleSavePaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("O nome do paciente é obrigatório.");
      return;
    }

    if (editingId) {
      // Editar paciente existente
      const updated = pacientes.map(p => {
        if (p.id === editingId) {
          // Criar registro hormonal se houver valor de testosterona
          const hist = p.historicoHormonal || [];
          if (testosterona && (!hist.length || hist[hist.length - 1].total !== parseFloat(testosterona))) {
            hist.push({
              data: new Date().toLocaleDateString("pt-BR").substring(0, 5),
              total: parseFloat(testosterona),
              livre: testoLivre ? parseFloat(testoLivre) : undefined,
              shbg: shbg ? parseFloat(shbg) : undefined
            });
          }

          return {
            ...p,
            nome: nome.trim(),
            idade,
            queixa: queixa.trim(),
            testosterona,
            psa,
            hematocrito,
            notas: notas.trim(),
            shbg,
            testoLivre,
            historicoHormonal: hist
          };
        }
        return p;
      });
      saveToStorage(updated);
      toast.success("Paciente atualizado com sucesso!");
      setEditingId(null);
    } else {
      // Criar novo paciente
      const hist: HormonioRegistro[] = [];
      if (testosterona) {
        hist.push({
          data: new Date().toLocaleDateString("pt-BR").substring(0, 5),
          total: parseFloat(testosterona),
          livre: testoLivre ? parseFloat(testoLivre) : undefined,
          shbg: shbg ? parseFloat(shbg) : undefined
        });
      }

      const novo: Paciente = {
        id: "paciente_" + Date.now(),
        nome: nome.trim(),
        idade,
        queixa: queixa.trim(),
        testosterona,
        psa,
        hematocrito,
        notas: notas.trim(),
        shbg,
        testoLivre,
        dataCadastro: new Date().toLocaleDateString("pt-BR"),
        historicoHormonal: hist,
        documentos: []
      };
      saveToStorage([novo, ...pacientes]);
      toast.success("Paciente cadastrado com sucesso!");
      setIsAdding(false);
    }

    // Resetar formulário
    resetForm();
  };

  const handleEdit = (p: Paciente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir expansão
    setEditingId(p.id);
    setNome(p.nome);
    setIdade(p.idade);
    setQueixa(p.queixa);
    setTestosterona(p.testosterona);
    setPsi(p.psa); // Corrige atribuição de PSA
    setHematocrito(p.hematocrito);
    setNotas(p.notas);
    setShbg(p.shbg || "");
    setTestoLivre(p.testoLivre || "");
    setIsAdding(true);
  };

  const handleAddHormonioPonto = (pacienteId: string) => {
    if (!newTotal) {
      toast.error("O valor de Testosterona Total é obrigatório.");
      return;
    }
    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoHormonal || [];
        const novoPonto: HormonioRegistro = {
          data: newDataPonto || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          total: parseFloat(newTotal),
          livre: newLivre ? parseFloat(newLivre) : undefined,
          shbg: newShbg ? parseFloat(newShbg) : undefined
        };
        return {
          ...p,
          testosterona: newTotal, // Atualizar valor atual
          testoLivre: newLivre || p.testoLivre,
          shbg: newShbg || p.shbg,
          historicoHormonal: [...hist, novoPonto]
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Novo ponto hormonal registrado!");
    setNewTotal("");
    setNewLivre("");
    setNewShbg("");
  };

  const toggleExpand = (id: string) => {
    setEditingExpandedId(expandedId === id ? null : id);
  };

  // Alias para corrigir o erro de digitação do setPsi
  const setPsi = (val: string) => setPsa(val);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir expansão
    if (confirm("Deseja realmente remover este paciente do banco de dados local?")) {
      const filtered = pacientes.filter(p => p.id !== id);
      saveToStorage(filtered);
      toast.success("Paciente removido com sucesso.");
    }
  };

  const resetForm = () => {
    setNome("");
    setIdade("");
    setQueixa("");
    setTestosterona("");
    setPsa("");
    setHematocrito("");
    setNotas("");
    setShbg("");
    setTestoLivre("");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.queixa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-2">
              <Users className="w-8 h-8 text-accent" />
              Gestão de Pacientes
            </h2>
            <p className="text-muted-foreground text-sm">
              Banco de dados clínico local para acompanhamento rápido de parâmetros e histórico.
            </p>
          </div>
          {!isAdding && (
            <Button 
              onClick={() => setIsAdding(true)} 
              className="copper-gradient text-white rounded-xl font-semibold flex items-center gap-2 self-start sm:self-center shadow-md shadow-accent/10"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Paciente
            </Button>
          )}
        </div>

        {/* Formulário de Cadastro / Edição */}
        {isAdding && (
          <Card className="border-accent/20 bg-card shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-border/40 bg-accent/[0.02]">
              <CardTitle className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#B87333]" />
                {editingId ? "Editar Dados Clínicos" : "Novo Cadastro de Paciente"}
              </CardTitle>
              <CardDescription className="text-xs">
                Todos os dados são salvos localmente de forma segura no seu navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSavePaciente} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nome" className="text-xs font-bold text-primary uppercase tracking-wider">Nome Completo *</Label>
                    <Input 
                      id="nome" 
                      placeholder="Ex: João Silva de Oliveira" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade" className="text-xs font-bold text-primary uppercase tracking-wider">Idade</Label>
                    <Input 
                      id="idade" 
                      type="number" 
                      placeholder="Ex: 52" 
                      value={idade}
                      onChange={(e) => setIdade(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queixa" className="text-xs font-bold text-primary uppercase tracking-wider">Queixa Principal / Diagnóstico</Label>
                  <Input 
                    id="queixa" 
                    placeholder="Ex: Disfunção erétil leve + Sintomas de hipogonadismo (DAEM)" 
                    value={queixa}
                    onChange={(e) => setQueixa(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 border-t border-border/40 pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="testo" className="text-xs font-bold text-primary uppercase tracking-wider">Testo Total (ng/dL)</Label>
                    <Input 
                      id="testo" 
                      type="number" 
                      placeholder="Ex: 240" 
                      value={testosterona}
                      onChange={(e) => setTestosterona(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testoLivre" className="text-xs font-bold text-primary uppercase tracking-wider">Testo Livre (ng/dL)</Label>
                    <Input 
                      id="testoLivre" 
                      placeholder="Ex: 4.8" 
                      value={testoLivre}
                      onChange={(e) => setTestoLivre(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shbg" className="text-xs font-bold text-primary uppercase tracking-wider">SHBG (nmol/L)</Label>
                    <Input 
                      id="shbg" 
                      placeholder="Ex: 32" 
                      value={shbg}
                      onChange={(e) => setShbg(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psa" className="text-xs font-bold text-primary uppercase tracking-wider">PSA Total (ng/mL)</Label>
                    <Input 
                      id="psa" 
                      placeholder="Ex: 1.2" 
                      value={psa}
                      onChange={(e) => setPsa(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hema" className="text-xs font-bold text-primary uppercase tracking-wider">Hematócrito (%)</Label>
                    <Input 
                      id="hema" 
                      placeholder="Ex: 46.5" 
                      value={hematocrito}
                      onChange={(e) => setHematocrito(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-5">
                  <Label htmlFor="notas" className="text-xs font-bold text-primary uppercase tracking-wider">Notas Clínicas / Histórico de Condutas</Label>
                  <textarea 
                    id="notas" 
                    placeholder="Ex: Iniciado Gel de Testosterona 5% (1 pump/dia). Paciente queixa-se de cansaço e perda de foco. Próximo retorno com exames de segurança em 6 semanas." 
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full min-h-[120px] rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl h-11 font-semibold border-border">
                    Cancelar
                  </Button>
                  <Button type="submit" className="copper-gradient text-white rounded-xl h-11 font-semibold px-6 shadow-md shadow-accent/10">
                    {editingId ? "Salvar Alterações" : "Salvar Cadastro"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Barra de Busca e Listagem */}
        {!isAdding && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar paciente por nome, queixa ou diagnóstico..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-xl border-border bg-card shadow-sm"
              />
            </div>

            {filteredPacientes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPacientes.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const chartData = p.historicoHormonal || [];
                  
                  return (
                    <Card 
                      key={p.id} 
                      onClick={() => toggleExpand(p.id)}
                      className={`border-border bg-card hover:border-accent/20 hover:shadow-md transition-all duration-200 cursor-pointer md:col-span-2 ${isExpanded ? "border-accent/40 ring-1 ring-accent/10" : ""}`}
                    >
                      <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="space-y-1">
                          <h4 className="text-base font-serif font-bold text-primary">{p.nome}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            Cadastrado em {p.dataCadastro}
                            {p.idade && <span>• {p.idade} anos</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleEdit(p, e)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleDelete(p.id, e)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {p.queixa && (
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-primary uppercase tracking-wider text-[10px]">Diagnóstico / Queixa:</span>
                          <p className="text-foreground/80 leading-relaxed font-medium">{p.queixa}</p>
                        </div>
                      )}

                      {/* Parâmetros Laboratoriais */}
                      <div className="grid grid-cols-3 gap-2.5 bg-secondary/20 p-2.5 rounded-xl border border-border/40 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Testosterona</span>
                          <span className={`text-xs font-bold ${parseFloat(p.testosterona) < 300 ? "text-orange-600" : "text-primary"}`}>
                            {p.testosterona ? `${p.testosterona} ng/dL` : "N/A"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">PSA Total</span>
                          <span className={`text-xs font-bold ${parseFloat(p.psa) > 2.5 ? "text-orange-600" : "text-primary"}`}>
                            {p.psa ? `${p.psa} ng/mL` : "N/A"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Hematócrito</span>
                          <span className={`text-xs font-bold ${parseFloat(p.hematocrito) > 50 ? "text-orange-600" : "text-primary"}`}>
                            {p.hematocrito ? `${p.hematocrito} %` : "N/A"}
                          </span>
                        </div>
                      </div>

                      {p.notas && (
                        <div className="space-y-1 text-xs pt-1.5 border-t border-border/40">
                          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Notas Clínicas:</span>
                          <p className="text-muted-foreground leading-relaxed text-justify line-clamp-3 font-mono">
                            {p.notas}
                          </p>
                        </div>
                      )}

                      {/* Ficha Expandida do Paciente */}
                      {isExpanded && (
                        <div className="space-y-6 pt-4 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                          {/* Gráfico de Evolução Hormonal */}
                          <div className="space-y-3">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-accent animate-pulse" />
                              Curva de Evolução Hormonal (Testosterona Total)
                            </span>
                            
                            {chartData.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl">
                                <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pt-4">
                                  {chartData.map((d, idx) => {
                                    // Cálculo simples de altura para simular um gráfico de barras responsivo
                                    const maxVal = Math.max(...chartData.map(item => item.total), 1000);
                                    const pct = (d.total / maxVal) * 100;
                                    
                                    return (
                                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          {d.total}
                                        </div>
                                        <div 
                                          style={{ height: `${Math.max(pct, 15)}%` }} 
                                          className="w-full max-w-[40px] copper-gradient rounded-t-md relative shadow-sm transition-all duration-300 hover:brightness-110"
                                        >
                                          {/* Tooltip simples */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                            T: {d.total} {d.livre ? `| L: ${d.livre}` : ""} {d.shbg ? `| S: ${d.shbg}` : ""}
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground">{d.data}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Registre pelo menos um valor de testosterona para gerar o gráfico.
                              </div>
                            )}

                            {/* Botão de Exportação de Prontuário Externo (JSON) */}
                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Criar objeto de exportação estruturado
                                  const exportData = {
                                    exportadoEm: new Date().toLocaleString("pt-BR"),
                                    medico: "Dr. Felipe de Bulhões",
                                    paciente: {
                                      id: p.id,
                                      nome: p.nome,
                                      idade: p.idade,
                                      dataCadastro: p.dataCadastro,
                                      queixa: p.queixa,
                                      parametrosLaboratoriais: {
                                        testosteronaTotal: p.testosterona ? `${p.testosterona} ng/dL` : "N/A",
                                        testosteronaLivre: p.testoLivre ? `${p.testoLivre} ng/dL` : "N/A",
                                        shbg: p.shbg ? `${p.shbg} nmol/L` : "N/A",
                                        psa: p.psa ? `${p.psa} ng/mL` : "N/A",
                                        hematocrito: p.hematocrito ? `${p.hematocrito} %` : "N/A"
                                      },
                                      historicoHormonal: p.historicoHormonal || [],
                                      documentosGerados: (p.documentos || []).map(doc => ({
                                        titulo: doc.titulo,
                                        tipo: doc.tipo,
                                        dataGeracao: doc.data,
                                        conteudo: doc.conteudo
                                      })),
                                      notasClinicas: p.notas
                                    }
                                  };

                                  // Gerar arquivo JSON para download
                                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `prontuario_${p.nome.toLowerCase().replace(/\s+/g, "_")}.json`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                  toast.success("Prontuário exportado com sucesso!");
                                }}
                                className="h-9 rounded-xl text-xs font-bold border-border hover:bg-secondary/40 gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-accent" />
                                Exportar para Prontuário (JSON)
                              </Button>
                            </div>

                            {/* Formulário rápido para adicionar ponto no gráfico */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <Input 
                                type="number" 
                                placeholder="Total (ng/dL)" 
                                value={newTotal}
                                onChange={(e) => setNewTotal(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Livre (ng/dL)" 
                                value={newLivre}
                                onChange={(e) => setNewLivre(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="SHBG (nmol/L)" 
                                value={newShbg}
                                onChange={(e) => setNewShbg(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleAddHormonioPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white"
                              >
                                Adicionar Ponto
                              </Button>
                            </div>
                          </div>

                          {/* Histórico de Documentos Vinculados */}
                          <div className="space-y-3 pt-2">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-accent" />
                              Histórico de Documentos Vinculados
                            </span>
                            
                            {p.documentos && p.documentos.length > 0 ? (
                              <div className="space-y-2.5">
                                {p.documentos.map((doc) => (
                                  <div key={doc.id} className="bg-secondary/10 border border-border/50 p-3 rounded-xl flex items-center justify-between gap-4">
                                    <div className="space-y-1 text-left">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary">{doc.titulo}</span>
                                        <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1.5 border-accent/20 text-accent bg-accent/5">
                                          {doc.tipo}
                                        </Badge>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground block">Gerado em {doc.data}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(doc.conteudo);
                                        toast.success("Documento copiado do histórico!");
                                      }}
                                      className="h-8 rounded-lg text-xs font-semibold text-accent hover:text-accent/80 hover:bg-accent/5 shrink-0"
                                    >
                                      Copiar Texto
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Nenhum documento (receita, atestado ou laudo) foi gerado para este paciente ainda.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            ) : (
              <div className="border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-secondary/[0.05]">
                <Users className="w-12 h-12 text-muted-foreground/60 mb-3" />
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Nenhum Paciente Encontrado</h4>
                <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                  {searchQuery ? "Nenhum paciente corresponde aos termos da sua busca." : "Inicie cadastrando os pacientes atendidos no seu consultório."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
