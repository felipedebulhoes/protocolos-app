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
  hematocrito?: number;
}

interface SintomaRegistro {
  data: string;
  iief5?: number;
  ipss?: number;
  adamPositivo?: boolean;
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
  historicoSintomas?: SintomaRegistro[];
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
  const [newHemaPonto, setNewHemaPonto] = useState("");
  const [newDataPonto, setNewDataPonto] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));

  // Estados para inserção de novo ponto de sintomas
  const [newIief, setNewIief] = useState("");
  const [newIpss, setNewIpss] = useState("");
  const [newAdam, setNewAdam] = useState(false);
  const [newDataSintoma, setNewDataSintoma] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));

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
    
    // Alertas clínicos de segurança
    const valHema = newHemaPonto ? parseFloat(newHemaPonto) : 0;
    const valShbg = newShbg ? parseFloat(newShbg) : 0;
    
    if (valHema > 52) {
      toast.warning("Alerta Clínico: Hematócrito crítico (>52%). Considere sangria terapêutica ou ajuste/redução de TRT.", { duration: 6000 });
    }
    if (valShbg > 0 && valShbg < 15) {
      toast.warning("Alerta Clínico: SHBG crítico (<15 nmol/L). Indica alta taxa de testosterona livre e possível clearance acelerado.", { duration: 6000 });
    }

    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoHormonal || [];
        const novoPonto: HormonioRegistro = {
          data: newDataPonto || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          total: parseFloat(newTotal),
          livre: newLivre ? parseFloat(newLivre) : undefined,
          shbg: newShbg ? parseFloat(newShbg) : undefined,
          hematocrito: newHemaPonto ? parseFloat(newHemaPonto) : undefined
        };
        return {
          ...p,
          testosterona: newTotal, // Atualizar valor atual
          testoLivre: newLivre || p.testoLivre,
          shbg: newShbg || p.shbg,
          hematocrito: newHemaPonto || p.hematocrito,
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
    setNewHemaPonto("");
  };

  const handleAddSintomaPonto = (pacienteId: string) => {
    if (!newIief && !newIpss) {
      toast.error("Preencha pelo menos um escore (IIEF-5 ou IPSS).");
      return;
    }
    
    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoSintomas || [];
        const novoPonto: SintomaRegistro = {
          data: newDataSintoma || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          iief5: newIief ? parseInt(newIief) : undefined,
          ipss: newIpss ? parseInt(newIpss) : undefined,
          adamPositivo: newAdam
        };
        return {
          ...p,
          historicoSintomas: [...hist, novoPonto]
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Escores de sintomas registrados com sucesso!");
    setNewIief("");
    setNewIpss("");
    setNewAdam(false);
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

  // Função para criptografar/descriptografar simples (XOR ou Base64 com salt para fins de portabilidade e facilidade de uso local)
  const encryptData = (text: string, key: string): string => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(result));
  };

  const decryptData = (encoded: string, key: string): string => {
    try {
      const decoded = decodeURIComponent(atob(encoded));
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (e) {
      throw new Error("Senha incorreta ou arquivo corrompido.");
    }
  };

  const handleExportBackup = () => {
    const password = prompt("Defina uma senha forte para criptografar o arquivo de backup:");
    if (!password) {
      toast.error("Exportação cancelada. A senha é obrigatória para segurança dos dados.");
      return;
    }

    try {
      const dbData = {
        pacientes: pacientes,
        assinatura: localStorage.getItem("protouro_signature_url") || "",
        useSignature: localStorage.getItem("protouro_use_signature") || "false"
      };

      const jsonStr = JSON.stringify(dbData);
      const encrypted = encryptData(jsonStr, password);
      
      const blob = new Blob([encrypted], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_protouro_${new Date().toISOString().split("T")[0]}.enc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Backup criptografado exportado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar backup.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const password = prompt("Digite a senha do arquivo de backup para descriptografar:");
    if (!password) {
      toast.error("Importação cancelada. A senha é obrigatória.");
      // Limpar input
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const encrypted = event.target?.result as string;
        const decrypted = decryptData(encrypted, password);
        const parsed = JSON.parse(decrypted);

        if (parsed && Array.isArray(parsed.pacientes)) {
          if (confirm(`Deseja realmente importar ${parsed.pacientes.length} pacientes? Isso irá mesclar com seus pacientes atuais.`)) {
            // Mesclar pacientes evitando duplicados por ID
            const existentesMap = new Map(pacientes.map(p => [p.id, p]));
            parsed.pacientes.forEach((p: Paciente) => {
              existentesMap.set(p.id, p);
            });
            const novosPacientes = Array.from(existentesMap.values());
            saveToStorage(novosPacientes);

            // Importar assinatura se houver
            if (parsed.assinatura) {
              localStorage.setItem("protouro_signature_url", parsed.assinatura);
              localStorage.setItem("protouro_use_signature", parsed.useSignature || "true");
            }

            toast.success("Backup importado e mesclado com sucesso!");
          }
        } else {
          toast.error("Formato de arquivo inválido.");
        }
      } catch (err) {
        toast.error("Senha incorreta ou arquivo de backup corrompido.");
      }
      // Limpar input
      e.target.value = "";
    };
    reader.readAsText(file);
  };

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
          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <Button
              onClick={handleExportBackup}
              variant="outline"
              className="border-accent/30 text-primary hover:bg-accent/5 rounded-xl font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#B87333]" />
              Exportar Backup
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 justify-center px-4 h-10 border border-dashed border-accent/30 hover:bg-accent/5 rounded-xl text-sm font-semibold text-primary">
                <Users className="w-4 h-4 text-[#B87333]" />
                Importar Backup
              </span>
              <input
                type="file"
                accept=".enc"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
            {!isAdding && (
              <Button 
                onClick={() => setIsAdding(true)} 
                className="copper-gradient text-white rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-accent/10"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Paciente
              </Button>
            )}
          </div>
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
                          
                          {/* Alertas Clínicos Inteligentes */}
                          {(parseFloat(p.hematocrito) > 52 || (p.shbg && parseFloat(p.shbg) < 15)) && (
                            <div className="space-y-2">
                              <span className="font-bold text-red-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                ⚠️ Alertas de Segurança Clínica (TRT)
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {parseFloat(p.hematocrito) > 52 && (
                                  <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold">Hematócrito Crítico ({p.hematocrito}%)</span>
                                    <span>Valor acima de 52% indica risco aumentado de hiperviscosidade sanguínea e eventos tromboembólicos. Recomenda-se suspender/reduzir TRT e indicar sangria terapêutica.</span>
                                  </div>
                                )}
                                {p.shbg && parseFloat(p.shbg) < 15 && (
                                  <div className="bg-orange-500/10 border border-orange-500/30 text-orange-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold">SHBG Crítico ({p.shbg} nmol/L)</span>
                                    <span>SHBG abaixo de 15 nmol/L aumenta a testosterona livre, acelerando o clearance hepático. Recomenda-se fracionar as doses de testosterona (ex: aplicação subcutânea 2-3x por semana).</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Gráfico de Evolução Hormonal */}
                          <div className="space-y-3">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-accent animate-pulse" />
                              Curva de Evolução Hormonal (Testosterona Total)
                            </span>
                            
                            {chartData.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl space-y-4">
                                <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pt-4">
                                  {chartData.map((d, idx) => {
                                    // Cálculo simples de altura para simular um gráfico multivariado
                                    const maxTotal = Math.max(...chartData.map(item => item.total), 1000);
                                    const pctTotal = (d.total / maxTotal) * 100;
                                    
                                    // SHBG costuma variar de 10 a 80 nmol/L
                                    const pctSHBG = d.shbg ? (d.shbg / 100) * 100 : 0;
                                    
                                    // Hematócrito varia de 35% a 55%
                                    const hemaValor = d.hematocrito || (idx === chartData.length - 1 ? parseFloat(p.hematocrito) : undefined);
                                    const pctHt = hemaValor ? (hemaValor / 60) * 100 : 0;
                                    
                                    return (
                                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                        <div className="flex gap-1 w-full items-end justify-center h-full pb-1">
                                          {/* Barra de Testo Total */}
                                          <div 
                                            style={{ height: `${Math.max(pctTotal, 15)}%` }} 
                                            className="w-3 copper-gradient rounded-t-sm relative shadow-sm transition-all duration-300 hover:brightness-110"
                                          >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                              Testo Total: {d.total} ng/dL
                                            </div>
                                          </div>
                                          
                                          {/* Barra de SHBG */}
                                          {d.shbg !== undefined && (
                                            <div 
                                              style={{ height: `${Math.max(pctSHBG, 10)}%` }} 
                                              className="w-3 bg-blue-500 rounded-t-sm relative shadow-sm transition-all duration-300 hover:brightness-110"
                                            >
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                SHBG: {d.shbg} nmol/L
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Barra de Hematócrito (Ht) */}
                                          {hemaValor !== undefined && (
                                            <div 
                                              style={{ height: `${Math.max(pctHt, 10)}%` }} 
                                              className={`w-3 rounded-t-sm relative shadow-sm transition-all duration-300 hover:brightness-110 ${hemaValor > 52 ? "bg-red-600 animate-pulse" : "bg-red-500"}`}
                                            >
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                Hematócrito: {hemaValor}% {hemaValor > 52 ? "⚠️ CRÍTICO" : ""}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground">{d.data}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Legenda do Gráfico Multivariado */}
                                <div className="flex justify-center gap-4 text-[10px] font-bold border-t border-border/40 pt-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm copper-gradient inline-block"></span>
                                    <span className="text-primary">Testosterona Total (ng/dL)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
                                    <span className="text-blue-500">SHBG (nmol/L)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>
                                    <span className="text-red-500">Hematócrito (%)</span>
                                  </div>
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
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
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
                              <Input 
                                type="number" 
                                placeholder="Hematócrito (%)" 
                                value={newHemaPonto}
                                onChange={(e) => setNewHemaPonto(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleAddHormonioPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white sm:col-span-1 col-span-2"
                              >
                                Adicionar Ponto
                              </Button>
                            </div>
                          </div>

                          {/* Evolução Temporal de Sintomas */}
                          <div className="space-y-3 pt-2 border-t border-border/40">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-accent animate-pulse" />
                              Curva de Evolução de Sintomas (IIEF-5 & IPSS)
                            </span>
                            
                            {p.historicoSintomas && p.historicoSintomas.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl space-y-4">
                                <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pt-4">
                                  {p.historicoSintomas.map((s, idx) => {
                                    // IIEF-5 varia de 1 a 25
                                    const pctIief = s.iief5 ? (s.iief5 / 25) * 100 : 0;
                                    // IPSS varia de 0 a 35
                                    const pctIpss = s.ipss ? (s.ipss / 35) * 100 : 0;
                                    
                                    return (
                                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                        <div className="flex gap-1 w-full items-end justify-center h-full pb-1">
                                          {/* Barra de IIEF-5 */}
                                          {s.iief5 !== undefined && (
                                            <div 
                                              style={{ height: `${Math.max(pctIief, 10)}%` }} 
                                              className="w-3 bg-emerald-500 rounded-t-sm relative shadow-sm transition-all duration-300 hover:brightness-110"
                                            >
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                IIEF-5: {s.iief5} (Disfunção Erétil)
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Barra de IPSS */}
                                          {s.ipss !== undefined && (
                                            <div 
                                              style={{ height: `${Math.max(pctIpss, 10)}%` }} 
                                              className="w-3 bg-indigo-500 rounded-t-sm relative shadow-sm transition-all duration-300 hover:brightness-110"
                                            >
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                IPSS: {s.ipss} (Sintomas Prostáticos)
                                              </div>
                                            </div>
                                          )}

                                          {/* Marcador ADAM */}
                                          {s.adamPositivo && (
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce mb-1" title="ADAM Positivo (Déficit Androgênico)" />
                                          )}
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground">{s.data}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Legenda do Gráfico de Sintomas */}
                                <div className="flex justify-center gap-4 text-[10px] font-bold border-t border-border/40 pt-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                                    <span className="text-emerald-600">IIEF-5 (Ereção - maior é melhor)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span>
                                    <span className="text-indigo-600">IPSS (Sintomas Urinários - menor é melhor)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                    <span className="text-amber-600">ADAM (+)</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Registre pelo menos um escore clínico para gerar o gráfico de evolução de sintomas.
                              </div>
                            )}

                            {/* Formulário rápido para adicionar sintomas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <Input 
                                type="number" 
                                placeholder="Escore IIEF-5 (1-25)" 
                                value={newIief}
                                onChange={(e) => setNewIief(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Escore IPSS (0-35)" 
                                value={newIpss}
                                onChange={(e) => setNewIpss(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <div className="flex items-center gap-2 px-2 h-9 bg-card rounded-lg border border-border/40">
                                <input 
                                  type="checkbox" 
                                  id="adam-check"
                                  checked={newAdam}
                                  onChange={(e) => setNewAdam(e.target.checked)}
                                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                                />
                                <Label htmlFor="adam-check" className="text-xs font-bold text-primary cursor-pointer select-none">ADAM (+)</Label>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddSintomaPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white"
                              >
                                Registrar Sintomas
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
