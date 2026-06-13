import { useState } from "react";
import { 
  User, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  HelpCircle, 
  Briefcase, 
  MapPin, 
  Activity, 
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ICP() {
  const [activeTab, setActiveTab] = useState("dossie");
  const [expandedObjection, setExpandedObjection] = useState<number | null>(null);

  const icpData = {
    name: "Gustavo",
    age: "35 - 42 anos",
    occupation: "Executivo, Diretor de Tecnologia, Empresário, Sócio de Startup ou Profissional do Mercado Financeiro",
    income: "Classe A/B (R$ 25k+ líquidos mensais)",
    locations: "Eixo São Paulo - Campinas (Alphaville, Faria Lima, Berrini, Barão Geraldo, Cambuí)",
    traits: [
      "Valoriza discrição absoluta, pontualidade e agilidade",
      "Pesquisa muito no Google e Instagram antes de agendar uma consulta",
      "Prefere pagar consulta particular para ter atendimento personalizado e tempo de qualidade",
      "Pratica exercícios físicos regularmente e busca alta performance",
      "Quer soluções definitivas, baseadas em tecnologia de ponta e ciência de alta evidência"
    ],
    pains: [
      "Perda de rendimento nos treinos e fadiga crônica inexplicável (queda de testosterona)",
      "Medo de impotência sexual e ansiedade de performance na cama",
      "Incontinência urinária ou sintomas urinários (jato fraco, urgência) limitando reuniões e viagens",
      "Desejo de melhora estética genital ou insatisfação com as proporções anatômicas"
    ],
    channels: [
      { name: "Google Ads", desc: "Busca ativa por termos de alta intenção comercial (ex: 'vasectomia sem bisturi sp', 'urologista particular campinas')" },
      { name: "Instagram", desc: "Consumo de conteúdo educativo refinado, reels dinâmicos sobre performance, estilo de vida e bastidores clínicos" },
      { name: "Doctoralia", desc: "Análise rigorosa do perfil, leitura de avaliações de outros pacientes e agendamento online imediato" }
    ]
  };

  const funilConversao = [
    {
      camada: "Camada 1 — AQUISIÇÃO",
      title: "Vasectomia Sem Bisturi (Recovery Premium)",
      volume: "Alto Volume / Decisão Rápida",
      ticket: "R$ 4.500,00 - R$ 6.500,00",
      description: "Porta de entrada perfeita para o consultório premium. O paciente decide rápido pois busca segurança, rapidez, técnica minimamente invasiva e retorno imediato aos treinos e trabalho.",
      marketing: "Anúncios focados em 'sem agulha, sem cortes, sem pontos' e 'recuperação em 48h'.",
      upsell: "Durante a consulta ou retorno, introduzir o check-up metabólico e de performance masculina."
    },
    {
      camada: "Camada 2 — FIDELIZAÇÃO",
      title: "TRT & Check-up de Performance Masculina",
      volume: "Recorrência Trimestral / LTV Elevado",
      ticket: "R$ 1.200,00 - R$ 2.500,00 / trimestre",
      description: "Acompanhamento metabólico contínuo e modulação hormonal científica baseada na Medicina de Estilo de Vida (MEV) para restaurar a disposição, cognição e libido.",
      marketing: "Conteúdo focado em fadiga, perda de massa magra e queda de produtividade no trabalho.",
      upsell: "Manutenção do paciente na base para consultas preventivas de rotina e indicações diretas."
    },
    {
      camada: "Camada 3 — PREMIUM",
      title: "Estética Genital & Preenchimento Peniano",
      volume: "Maior Margem / Alto Ticket",
      ticket: "R$ 12.000,00 - R$ 25.000,00",
      description: "Procedimentos avançados de harmonização e estética genital masculina utilizando Ácido Hialurônico de alta densidade (PMMA banido).",
      marketing: "Abordagem extremamente discreta, focada em autoconfiança, bem-estar e segurança técnica.",
      upsell: "Acompanhamento pós-procedimento premium que fideliza o paciente para tratamentos andrológicos."
    }
  ];

  const scriptsVendas = [
    {
      etapa: "1. Primeiro Contato (WhatsApp)",
      objetivo: "Gerar rapport imediato, validar a dor e conduzir para o agendamento sem focar em preço.",
      script: "“Olá, Gustavo! Sou a [Nome], assistente pessoal do Dr. Felipe de Bulhões. Que bom receber seu contato. Entendi perfeitamente a sua busca. O Dr. Felipe realiza a Vasectomia Sem Bisturi com um protocolo de recuperação acelerada, desenhado exatamente para homens ativos que não podem parar o trabalho ou os treinos. Ele utiliza uma técnica micro-invasiva importada, sem cortes tradicionais e sem pontos. Para que eu possa te passar as informações de forma personalizada, você prefere realizar o procedimento em São Paulo (Av. Paulista) ou em Campinas?”"
    },
    {
      etapa: "2. Apresentação da Experiência Premium",
      objetivo: "Destacar o valor e o acolhimento do consultório particular premium.",
      script: "“Gustavo, a nossa consulta particular é bem diferente de uma consulta de convênio de 10 minutos. O Dr. Felipe reserva 1 hora exclusiva para você. Ele vai realizar uma avaliação física e metabólica completa, analisar seus exames de sangue detalhadamente sob a ótica da Medicina de Estilo de Vida e desenhar um plano de performance sob medida. Além disso, você terá o contato direto de WhatsApp do Dr. Felipe para tirar qualquer dúvida pós-procedimento. É um acompanhamento verdadeiramente personalizado para a sua saúde.”"
    },
    {
      etapa: "3. Fechamento (Escolha Dirigida)",
      objetivo: "Conduzir para a ação de forma elegante, sem dar margem para indecisão.",
      script: "“Excelente, Gustavo. Como o Dr. Felipe realiza apenas um número limitado de consultas exclusivas por semana para garantir esse padrão de atenção, eu tenho duas vagas disponíveis para atendimento presencial na Clinovi Paulista: nesta terça-feira às 14h ou na quinta-feira às 10h. Qual desses horários se encaixa melhor na sua agenda de reuniões desta semana?”"
    }
  ];

  const objecoesComuns = [
    {
      question: "“O Dr. Felipe aceita meu plano de saúde para a cirurgia?”",
      answer: "“Gustavo, o Dr. Felipe realiza todo o acompanhamento de consultório e a equipe cirúrgica de forma estritamente particular para garantir a máxima qualidade, tempo e dedicação exclusiva ao seu caso. No entanto, nós utilizamos o Campinas Day Hospital ou hospitais da Rede D'Or que aceitam o seu plano de saúde para cobrir toda a parte de taxas hospitalares, internação e materiais. Além disso, nós emitimos um relatório médico ultra-detalhado com toda a fundamentação científica para que você possa solicitar o reembolso dos honorários médicos junto ao seu convênio. Nossa equipe cuida de toda a burocracia para você.”"
    },
    {
      question: "“O preço da cirurgia particular está acima do que eu esperava.”",
      answer: "“Entendo perfeitamente, Gustavo. Quando falamos de um procedimento definitivo na sua saúde íntima e performance, o investimento reflete a segurança de uma técnica minimamente invasiva importada (sem cortes e sem pontos), o uso de materiais de altíssimo padrão e, principalmente, o acompanhamento pós-operatório exclusivo de 6 meses com contato direto com o Dr. Felipe. Nós facilitamos o pagamento em até 10 vezes sem juros no cartão de crédito ou oferecemos um desconto especial para pagamento via PIX, além de darmos todo o suporte para você reaver a maior parte do valor via reembolso do convênio.”"
    },
    {
      question: "“Preciso de quanto tempo de repouso para voltar a treinar?”",
      answer: "“Como o Dr. Felipe utiliza a técnica sem bisturi de alta precisão, o trauma nos tecidos é mínimo. Você poderá retornar ao trabalho de escritório ou reuniões online em apenas 24 a 48 horas. Para atividades físicas leves, como caminhadas, o retorno ocorre em 5 a 7 dias. Exercícios de alta intensidade e musculação pesada são liberados gradualmente a partir de 14 dias, após a avaliação de retorno em consultório. É o protocolo de recuperação mais rápido disponível na urologia moderna.”"
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1C3D5A] flex items-center gap-3">
            <Target className="w-8 h-8 text-[#B87333]" />
            Paciente Ideal (ICP) — Gustavo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Diretrizes estratégicas e inteligência comercial focadas no avatar premium de urologia e andrologia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#B87333] hover:bg-[#B87333]/90 text-white px-3 py-1 text-xs font-semibold">
            Foco: CPP + MEV
          </Badge>
          <Badge variant="outline" className="border-[#1C3D5A]/20 text-[#1C3D5A] px-3 py-1 text-xs font-semibold">
            Eixo SP-Campinas
          </Badge>
        </div>
      </div>

      {/* SELETOR DE ABAS PRINCIPAIS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-[#1C3D5A]/5 p-1 rounded-xl">
          <TabsTrigger value="dossie" className="rounded-lg py-2.5 text-xs font-semibold transition-all data-[state=active]:bg-[#1C3D5A] data-[state=active]:text-[#FEFEFE]">
            <User className="w-4 h-4 mr-2" />
            Dossiê Gustavo
          </TabsTrigger>
          <TabsTrigger value="funil" className="rounded-lg py-2.5 text-xs font-semibold transition-all data-[state=active]:bg-[#1C3D5A] data-[state=active]:text-[#FEFEFE]">
            <TrendingUp className="w-4 h-4 mr-2" />
            Funil de Produtos
          </TabsTrigger>
          <TabsTrigger value="vendas" className="rounded-lg py-2.5 text-xs font-semibold transition-all data-[state=active]:bg-[#1C3D5A] data-[state=active]:text-[#FEFEFE]">
            <MessageSquare className="w-4 h-4 mr-2" />
            Scripts & Objeções
          </TabsTrigger>
        </TabsList>

        {/* CONTEÚDO: DOSSIÊ DO GUSTAVO */}
        <TabsContent value="dossie" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD DE PERFIL GERAL */}
            <Card className="md:col-span-2 border-[#1C3D5A]/10 shadow-md">
              <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10">
                <CardTitle className="text-[#1C3D5A] flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-[#B87333]" />
                  Perfil Demográfico e Comportamental
                </CardTitle>
                <CardDescription>Quem é o Gustavo e o que ele busca na urologia particular premium.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Faixa Etária</span>
                    <p className="text-sm font-semibold text-[#1C3D5A]">{icpData.age}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Poder Aquisitivo</span>
                    <p className="text-sm font-semibold text-[#1C3D5A]">{icpData.income}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Ocupação Típica</span>
                    <p className="text-sm font-semibold text-[#1C3D5A]">{icpData.occupation}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Localização Principal</span>
                    <p className="text-sm font-semibold text-[#1C3D5A] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#B87333]" />
                      {icpData.locations}
                    </p>
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-4">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Traços de Personalidade</span>
                  <ul className="space-y-2">
                    {icpData.traits.map((trait, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* CARD DE CANAIS DE CAPTAÇÃO */}
            <Card className="border-[#1C3D5A]/10 shadow-md">
              <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10">
                <CardTitle className="text-[#1C3D5A] flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-[#B87333]" />
                  Canais de Atração
                </CardTitle>
                <CardDescription>Onde o Gustavo busca soluções.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {icpData.channels.map((channel, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1C3D5A]">{channel.name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-[#B87333]/20 text-[#B87333] bg-[#B87333]/5 font-bold">
                        Canal Ativo
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{channel.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* DORES E DESEJOS */}
          <Card className="border-[#1C3D5A]/10 shadow-md">
            <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10">
              <CardTitle className="text-[#1C3D5A] flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-[#B87333]" />
                Dores Clínicas e Emocionais (Gatilhos de Conversão)
              </CardTitle>
              <CardDescription>O que tira o sono do Gustavo e o faz buscar ajuda médica especializada.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {icpData.pains.map((pain, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-[#1C3D5A]/5 border border-[#1C3D5A]/10">
                    <div className="w-8 h-8 rounded-lg bg-[#B87333]/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#B87333]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C3D5A] leading-snug">{pain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTEÚDO: FUNIL DE PRODUTOS */}
        <TabsContent value="funil" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {funilConversao.map((item, index) => (
              <Card key={index} className="border-[#1C3D5A]/10 shadow-md flex flex-col justify-between">
                <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10 relative">
                  <span className="text-[10px] text-[#B87333] font-bold uppercase tracking-wider block mb-1">
                    {item.camada}
                  </span>
                  <CardTitle className="text-[#1C3D5A] text-lg font-bold leading-tight">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.volume}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-[#B87333]/10 rounded-xl border border-[#B87333]/20 flex items-center justify-between">
                      <span className="text-xs text-[#1C3D5A] font-bold">Ticket Estimado:</span>
                      <span className="text-sm font-extrabold text-[#B87333]">{item.ticket}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-primary/10 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#1C3D5A] font-bold uppercase tracking-wider block">Foco de Atração</span>
                      <p className="text-xs text-foreground bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {item.marketing}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Estratégia de Upsell</span>
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        {item.upsell}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CONTEÚDO: SCRIPTS & OBJEÇÕES */}
        <TabsContent value="vendas" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SCRIPTS DE ATENDIMENTO */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-[#1C3D5A]/10 shadow-md">
                <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10">
                  <CardTitle className="text-[#1C3D5A] flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-[#B87333]" />
                    Scripts de Abordagem Ativa (Secretária)
                  </CardTitle>
                  <CardDescription>Modelos de conversas persuasivas e humanizadas de alto padrão.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {scriptsVendas.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl border border-[#1C3D5A]/10 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#B87333] uppercase tracking-wider">{item.etapa}</span>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-[#1C3D5A]/20 text-[#1C3D5A] bg-white font-bold">
                          Objetivo: {item.objetivo}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground italic leading-relaxed font-medium text-slate-700">
                        {item.script}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* QUEBRA DE OBJEÇÕES */}
            <div>
              <Card className="border-[#1C3D5A]/10 shadow-md">
                <CardHeader className="bg-[#1C3D5A]/5 border-b border-[#1C3D5A]/10">
                  <CardTitle className="text-[#1C3D5A] flex items-center gap-2 text-lg">
                    <HelpCircle className="w-5 h-5 text-[#B87333]" />
                    Contorno de Objeções
                  </CardTitle>
                  <CardDescription>Como desarmar barreiras de fechamento.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {objecoesComuns.map((item, index) => (
                    <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedObjection(expandedObjection === index ? null : index)}
                        className="w-full p-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-[#1C3D5A]">{item.question}</span>
                        {expandedObjection === index ? (
                          <ChevronDown className="w-4 h-4 text-[#B87333]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#B87333]" />
                        )}
                      </button>
                      {expandedObjection === index && (
                        <div className="p-3 bg-white border-t border-slate-100">
                          <p className="text-xs text-muted-foreground leading-relaxed italic font-medium text-slate-600">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
