import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  Play, 
  RefreshCw,
  PhoneCall,
  UserCheck,
  Volume2,
  Square
} from "lucide-react";
import { toast } from "sonner";

// Cenários urológicos de alta conversão para o simulador
const SCENARIOS = [
  {
    id: "protese_inflavel",
    title: "Implante de Prótese Peniana Inflável",
    specialty: "Andrologia & Próteses",
    description: "Paciente interessado, mas assustado com o valor particular e querendo saber se o convênio cobre.",
    difficulty: "Alta",
    objection: "Paciente: 'Entendi, mas o valor da cirurgia particular é muito alto. O meu plano de saúde não cobre nada desse implante inflável?'",
    options: [
      {
        id: "opt_a",
        text: "Infelizmente os planos não cobrem cirurgia particular, o senhor teria que pagar tudo à vista no nosso consultório.",
        score: 30,
        feedback: "Incorreto. Essa resposta gera barreira imediata e afasta o paciente. O CPP ensina a acolher e oferecer soluções de reembolso ou assessoria de liminar.",
        correct: false
      },
      {
        id: "opt_b",
        text: "O Dr. Felipe trabalha com reembolso assistido. Nós fornecemos todo o relatório técnico e nossa equipe jurídica auxilia o senhor a solicitar a cobertura integral ou parcial do implante pelo seu convênio, já que é uma prótese com indicação médica funcional. Vamos agendar uma consulta de avaliação para o Dr. Felipe detalhar esse processo?",
        score: 100,
        feedback: "Excelente! Resposta padrão CPP. Você acolheu a objeção financeira, explicou a legitimidade da cobertura funcional do convênio e ofereceu assessoria ativa, finalizando com uma chamada para ação clara.",
        correct: true
      },
      {
        id: "opt_c",
        text: "Cobre sim, mas o senhor precisa entrar na justiça contra o seu convênio antes de passar em consulta com a gente.",
        score: 50,
        feedback: "Parcial. O plano realmente pode cobrir judicialmente, mas mandar o paciente entrar na justiça antes mesmo da consulta cria um processo burocrático que desestimula o agendamento.",
        correct: false
      }
    ]
  },
  {
    id: "ondas_choque",
    title: "Terapia de Ondas de Choque (Li-ESWT)",
    specialty: "Disfunção Erétil",
    description: "Paciente quer saber se o tratamento regenerativo realmente funciona ou se é apenas marketing de internet.",
    difficulty: "Média",
    objection: "Paciente: 'Vi no Instagram sobre essas ondas de choque para ereção. Isso funciona mesmo ou é só mais uma promessa passageira?'",
    options: [
      {
        id: "opt_a",
        text: "Funciona sim, é muito bom e todo mundo faz. O senhor quer agendar para que horas?",
        score: 40,
        feedback: "Fraco. Falta embasamento científico e autoridade médica. Pacientes premium buscam segurança e evidências.",
        correct: false
      },
      {
        id: "opt_b",
        text: "Diferente dos comprimidos que apenas tratam o sintoma na hora H, as ondas de choque acústicas atuam na causa raiz física, estimulando a neovascularização — que é a criação de novos vasos sanguíneos saudáveis no pênis. É um tratamento regenerativo aprovado pelas diretrizes europeias de urologia. O Dr. Felipe realiza uma avaliação com Doppler antes para garantir que o senhor tem indicação real. Vamos agendar a consulta de avaliação?",
        score: 100,
        feedback: "Perfeito! Você usou argumentos científicos traduzidos para linguagem simples (neovascularização), destacou o diferencial de tratar a causa raiz e usou a autoridade dos guidelines europeus e do Doppler peniano do Dr. Felipe.",
        correct: true
      },
      {
        id: "opt_c",
        text: "Olha, cada corpo reage de um jeito, em alguns funciona e em outros não. O senhor teria que testar para ver.",
        score: 20,
        feedback: "Incorreto. Essa resposta gera extrema insegurança no paciente, reduzindo drasticamente a chance de agendamento de um tratamento de alto valor.",
        correct: false
      }
    ]
  },
  {
    id: "peyronie_medo",
    title: "Doença de Peyronie (Curvatura)",
    specialty: "Andrologia Reconstrutiva",
    description: "Paciente com medo de realizar a cirurgia de curvatura e acabar perdendo tamanho de pênis.",
    difficulty: "Alta",
    objection: "Paciente: 'Tenho muito medo de fazer essa cirurgia de Peyronie e meu pênis diminuir de tamanho. Ouvi falar que a cirurgia encurta o pênis.'",
    options: [
      {
        id: "opt_a",
        text: "A cirurgia realmente encurta um pouco, mas é o único jeito de deixar reto. É pegar ou largar.",
        score: 20,
        feedback: "Incorreto. Extremamente agressivo e sem tato empático. O encurtamento é um medo central que exige acolhimento e explicação técnica geométrica.",
        correct: false
      },
      {
        id: "opt_b",
        text: "Essa é a principal dúvida de quem nos procura, e o senhor tem toda razão em se preocupar. A curvatura em si já causa uma perda visual de tamanho. O Dr. Felipe realiza uma medição milimétrica intraoperatória e utiliza técnicas reconstrutivas avançadas de plicatura geométrica ou enxertos para retificar o pênis preservando o máximo de comprimento e calibre possíveis. O foco é devolver sua capacidade de penetração com segurança. Vamos agendar para o Dr. Felipe analisar o seu caso?",
        score: 100,
        feedback: "Excelente! Você acolheu e validou o sentimento do paciente ('o senhor tem toda razão'), explicou que a curvatura em si já encurta, e introduziu a precisão técnica (medição milimétrica, plicatura geométrica) do Dr. Felipe como garantia de segurança.",
        correct: true
      },
      {
        id: "opt_c",
        text: "Não diminui nada, isso é mito de internet. Pode agendar tranquilo.",
        score: 40,
        feedback: "Incorreto. Negar de forma simplista um fato cirúrgico real (plicaturas podem reduzir milímetros no lado mais longo) quebra a confiança do paciente a longo prazo. A honestidade técnica com foco em preservação é o pilar CPP.",
        correct: false
      }
    ]
  },
  {
    id: "particular_preco",
    title: "Consulta Particular vs Convênio",
    specialty: "Posicionamento Premium",
    description: "Paciente liga querendo agendar consulta, mas reclama que o Dr. Felipe não atende diretamente pelo convênio dele.",
    difficulty: "Média",
    objection: "Paciente: 'Gostaria de agendar, mas vi que o Dr. Felipe não atende pelo meu convênio Bradesco Saúde. Por que a consulta tem que ser particular?'",
    options: [
      {
        id: "opt_a",
        text: "Porque o Dr. Felipe é muito qualificado e convênio paga muito mal aos médicos.",
        score: 40,
        feedback: "Inadequado. Embora seja uma realidade de mercado, reclamar de remuneração de convênio para o paciente soa pouco profissional e não gera valor para a consulta dele.",
        correct: false
      },
      {
        id: "opt_b",
        text: "Para oferecer um atendimento verdadeiramente humanizado e sem pressa, o Dr. Felipe optou por não realizar consultas rápidas de convênio. No consultório, as consultas duram cerca de 1 hora, com avaliação física completa, ultrassom quando necessário e suporte direto pós-consulta. Além disso, nós emitimos toda a documentação necessária para o senhor solicitar o reembolso integral ou parcial junto à Bradesco Saúde de forma simples. Vamos agendar para esta semana?",
        score: 100,
        feedback: "Perfeito! Padrão ouro CPP. Você justificou o valor particular com base no tempo e qualidade de entrega (1 hora, humanizado, ultrassom) e facilitou a barreira financeira oferecendo suporte ativo ao reembolso do convênio.",
        correct: true
      },
      {
        id: "opt_c",
        text: "Infelizmente não atendemos convênio. Se o senhor quiser, o valor é R$ 600,00 em dinheiro ou cartão.",
        score: 30,
        feedback: "Incorreto. Resposta seca que foca apenas no preço e não na proposta de valor ou na facilidade do reembolso.",
        correct: false
      }
    ]
  }
];

export default function SecretaryTraining() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<"objection" | "correct_option" | null>(null);

  // Parar qualquer áudio em reprodução ao desmontar ou mudar de cenário
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [activeScenario]);

  const speakText = (text: string, type: "objection" | "correct_option") => {
    if (!window.speechSynthesis) {
      toast.error("O seu navegador não suporta síntese de voz.");
      return;
    }

    if (isPlayingAudio === type) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Extrair apenas o texto limpo sem prefixos de identificação (ex: "Paciente: '...'")
    const cleanText = text.replace(/^Paciente:\s*['"]?|['"]\s*$/g, "").trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    
    // Tentar selecionar uma voz em português de alta qualidade
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt")) || voices[0];
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    // Configurações de tom e velocidade para soar natural e profissional
    utterance.rate = type === "objection" ? 0.95 : 1.05; // Paciente fala ligeiramente mais lento/hesitante, secretária fala dinâmica e confiante
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(type);
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartScenario = (index: number) => {
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(null);
    setActiveScenario(index);
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || activeScenario === null) return;
    
    const scenario = SCENARIOS[activeScenario];
    const option = scenario.options.find(opt => opt.id === selectedOption);
    
    if (option) {
      setHasSubmitted(true);
      setScore(option.score);
      setTotalScore(prev => prev + option.score);
      
      if (!completedScenarios.includes(scenario.id)) {
        setCompletedScenarios(prev => [...prev, scenario.id]);
      }

      if (option.correct) {
        toast.success(`Excelente! Pontuação máxima: +${option.score} pontos!`);
      } else if (option.score >= 50) {
        toast.warning(`Bom esforço! Pontuação: +${option.score} pontos.`);
      } else {
        toast.error(`Atenção! Pontuação baixa: +${option.score} pontos. Leia o feedback.`);
      }
    }
  };

  const handleNextScenario = () => {
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(null);
    setActiveScenario(null);
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const handleResetTraining = () => {
    setActiveScenario(null);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setTotalScore(0);
    setCompletedScenarios([]);
    toast.info("Treinamento reiniciado com sucesso!");
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Cabeçalho da Página */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg shadow-primary/5">
          <div className="absolute inset-0 brand-pattern opacity-[0.04] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-amber-500" />
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/5 font-semibold text-xs">
                  Módulo de Capacitação CPP
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-primary">
                Área de Treinamento da Secretária
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Treine a abordagem comercial premium, scripts de atendimento e contorno de objeções urológicas comuns para elevar as taxas de conversão de consultas e cirurgias particulares.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 shrink-0">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pontuação Acumulada</p>
                <p className="text-2xl font-bold text-primary">{totalScore} <span className="text-xs text-muted-foreground font-normal">pts</span></p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3 h-3" />
                  {completedScenarios.length} de {SCENARIOS.length} cenários concluídos
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeScenario === null ? (
          /* LISTAGEM DE CENÁRIOS */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Cenários Práticos de Atendimento (Roleplay)
              </h2>
              {completedScenarios.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleResetTraining} className="text-muted-foreground hover:text-destructive h-8 gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reiniciar Progresso
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SCENARIOS.map((scenario, index) => {
                const isCompleted = completedScenarios.includes(scenario.id);
                return (
                  <Card key={scenario.id} className={`border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${isCompleted ? "border-emerald-500/20 bg-emerald-500/[0.01]" : ""}`}>
                    {isCompleted && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Concluído
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                          {scenario.specialty}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${scenario.difficulty === "Alta" ? "border-red-500/20 text-red-600 bg-red-500/5" : "border-amber-500/20 text-amber-600 bg-amber-500/5"}`}>
                          Dificuldade: {scenario.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="font-serif text-lg text-primary">{scenario.title}</CardTitle>
                      <CardDescription className="text-xs">{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="bg-secondary/40 p-3 rounded-lg border border-border/40">
                        <p className="text-xs font-semibold text-primary italic truncate">
                          {scenario.objection}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleStartScenario(index)}
                        className={`w-full gap-2 rounded-xl text-xs font-bold ${isCompleted ? "bg-secondary text-primary hover:bg-secondary/80" : "bg-[#B87333] text-white hover:bg-[#B87333]/90"}`}
                      >
                        {isCompleted ? (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Refazer Simulação
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Iniciar Simulação
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* SIMULADOR ATIVO (ROLEPLAY) */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Button variant="ghost" size="sm" onClick={handleNextScenario} className="text-muted-foreground hover:text-foreground">
                ← Voltar aos Cenários
              </Button>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Cenário {activeScenario + 1} de {SCENARIOS.length}
              </span>
            </div>

            <Card className="border border-amber-500/20 bg-card shadow-md">
              <CardHeader className="border-b border-border/40 bg-amber-500/[0.02] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                    {SCENARIOS[activeScenario].specialty}
                  </Badge>
                  <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/5 text-[10px] font-bold uppercase tracking-wider">
                    Dificuldade: {SCENARIOS[activeScenario].difficulty}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl text-primary">{SCENARIOS[activeScenario].title}</CardTitle>
                <CardDescription className="text-sm mt-1">{SCENARIOS[activeScenario].description}</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Balão de Fala do Paciente (Objeção) */}
                <div className="flex gap-3 items-start bg-secondary/50 p-4 rounded-2xl border border-border/60 relative group">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <PhoneCall className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="space-y-1 flex-1 pr-12">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Objeção do Paciente</p>
                    <p className="text-sm font-serif font-semibold text-primary leading-relaxed italic">
                      {SCENARIOS[activeScenario].objection}
                    </p>
                  </div>
                  <Button
                    onClick={() => speakText(SCENARIOS[activeScenario].objection, "objection")}
                    variant="outline"
                    size="sm"
                    className={`absolute right-4 top-4 h-8 w-8 rounded-full p-0 border-amber-500/20 hover:bg-amber-500/10 ${isPlayingAudio === "objection" ? "bg-amber-500/10 border-amber-500 text-amber-600 animate-pulse" : "text-amber-600"}`}
                    title={isPlayingAudio === "objection" ? "Parar Áudio" : "Ouvir Objeção em Áudio"}
                  >
                    {isPlayingAudio === "objection" ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {/* Opções de Resposta da Secretária */}
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-1">Escolha a Resposta Alinhada com a Essência CPP:</p>
                  {SCENARIOS[activeScenario].options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                      <button
                        key={option.id}
                        disabled={hasSubmitted}
                        onClick={() => setSelectedOption(option.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                          isSelected 
                            ? "border-amber-500 bg-amber-500/[0.03] ring-1 ring-amber-500" 
                            : "border-border bg-card hover:bg-secondary/20"
                        } ${hasSubmitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-muted-foreground/30"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs text-foreground leading-relaxed font-medium">
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Resultado e Feedback após Enviar */}
                {hasSubmitted && (
                  <div className={`p-5 rounded-xl border space-y-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 relative ${
                    SCENARIOS[activeScenario].options.find(o => o.id === selectedOption)?.correct 
                      ? "bg-emerald-500/[0.03] border-emerald-500/20" 
                      : "bg-amber-500/[0.03] border-amber-500/20"
                  }`}>
                    <div className="flex items-center gap-2">
                      {SCENARIOS[activeScenario].options.find(o => o.id === selectedOption)?.correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-amber-500" />
                      )}
                      <h4 className="text-sm font-bold text-primary">
                        {SCENARIOS[activeScenario].options.find(o => o.id === selectedOption)?.correct 
                          ? "Resposta Alinhada com o CPP! (+100 pts)" 
                          : `Resposta Parcial/Incorreta! (+${score} pts)`}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium pr-12">
                      {SCENARIOS[activeScenario].options.find(o => o.id === selectedOption)?.feedback}
                    </p>

                    {/* Botão de Áudio para ouvir a resposta perfeita (correta) do CPP */}
                    <div className="border-t border-border/40 pt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Treinamento de Entonação</span>
                      </div>
                      <Button
                        onClick={() => {
                          const correctOpt = SCENARIOS[activeScenario].options.find(o => o.correct);
                          if (correctOpt) speakText(correctOpt.text, "correct_option");
                        }}
                        variant="outline"
                        size="sm"
                        className={`h-8 rounded-xl text-[10px] font-bold gap-1.5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 ${isPlayingAudio === "correct_option" ? "bg-emerald-500/10 border-emerald-500 animate-pulse" : ""}`}
                      >
                        {isPlayingAudio === "correct_option" ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            Parar Áudio
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            Ouvir Resposta Perfeita (CPP)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
                  {!hasSubmitted ? (
                    <Button 
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOption}
                      className="bg-[#B87333] text-white hover:bg-[#B87333]/90 rounded-xl text-xs font-bold px-6 gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Enviar Resposta
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextScenario}
                      className="bg-secondary text-primary hover:bg-secondary/80 rounded-xl text-xs font-bold px-6 gap-1"
                    >
                      Avançar para Próximo Cenário
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
