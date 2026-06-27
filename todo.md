
## Melhorias UX/Identidade Visual (Jun 2026)
- [x] Redesenhar AuthScreen em PortalPaciente.tsx com identidade visual da marca (brand-gradient hero, logo landscape, tipografia Callingstone)
- [x] Atualizar PatientBrandHeader para usar logo isotipo SVG real e tipografia Callingstone
- [x] Adicionar botão "Portal do Paciente" com ícone de link copiável no sidebar do médico (Layout.tsx)
- [x] Banner personalizado em PacienteLanding quando acessado via /paciente?token=xxx (exibir "Olá, [Nome] — preencha sua ficha antes da consulta")
- [x] Redirecionar /ficha/:token para /paciente?token=xxx com banner antes de iniciar o formulário

## Melhorias de Notificação e Dashboard (Jun 2026)
- [x] Adicionar URL da ficha (protocolos.felipebulhoes.com/fichas/[id]) na notificação notifyOwner
- [x] Criar job Heartbeat para lembrete automático de fichas pendentes após 24h
- [x] Adicionar card "Taxa de preenchimento" no dashboard (Home.tsx) com % enviadas vs. pendentes

## Heartbeat Jobs Registrados
- Cron "remind-pending-intakes": task_uid = butur6qt4jEYZsfNAdEqLF | Executa diariamente às 12:00 UTC | Path: /api/scheduled/remindPendingIntakes

## Melhorias de Fluxo de Pré-Consulta (Jun 2026)
- [x] Testar fluxo completo: gerar link, preencher ficha, confirmar notificação ao médico (manual após deploy)
- [x] Adicionar upload de exames (PDF/foto) na ficha antes de submeter (já implementado)
- [x] Notificação por e-mail ao paciente após submeter ficha (implementado)

## Gerenciamento de Usuários (Jun 2026)
- [x] Adicionar tabela `team_members` no schema do Drizzle (nome, email, role, status, criado_em)
- [x] Criar tRPC procedures: listTeamMembers, inviteTeamMember, removeTeamMember, updateTeamMemberRole
- [x] Implementar UI em Configurações com tabela de membros + botão "Convidar Membro"
- [x] Adicionar autenticação para usuários convidados (links de convite com token único)
- [x] Criar página de login/cadastro para membros convidados (TeamJoin.tsx)

## Bugs Encontrados (Jun 2026)
- [x] Erro ao fazer upload de exames na ficha de pré-consulta (falha ao enviar arquivo PDF) — corrigido: await faltava em listExamFilesByIntake e listExamFilesByPatient

## Melhorias de Upload (Jun 2026)
- [x] Adicionar validação de tamanho de arquivo no ExamUploader (máx 12MB, erro amigável)
- [x] Adicionar link de download dos exames na notificação ao médico
- [x] Testar fluxo completo de upload de PDF/imagem na ficha de pré-consulta (confirmado via API)

## Novas Tarefas (Jun 2026)
- [x] Testar upload real de PDF via API com token válido da ficha de teste — confirmado: status 200, fileId salvo no banco
- [x] Adicionar campo "agendado" no banco (intakeForms) e card de Taxa de Conversão no dashboard
- [x] Integrar Meta Pixel 1730608694762791 no portal do paciente (/paciente)

## Melhorias de Fichas e Pixel (Jun 2026)
- [x] Filtro de agendados/não-agendados na lista de fichas (/fichas)
- [x] Seção de exames PDF com download/visualização no IntakeDetail
- [x] Evento Meta Pixel 'Lead' ao finalizar e enviar a ficha

## Analytics de Exames (Jun 2026)
- [x] Endpoints tRPC de analytics (distribuição, taxa de alterações, alertas críticos)
- [x] Página ExamAnalytics.tsx com gráficos Recharts
- [x] Rota /exames-analytics no App.tsx e link no sidebar

## Protocolo Espermograma com Fluxograma (Jun 2026)
- [x] Criar JSON do protocolo de espermograma com valores OMS 2021, nomenclatura e interpretação
- [x] Criar página SpermogramFlowchart.tsx com fluxograma interativo de conduta clínica
- [x] Integrar no ProtocolDetail e registrar rota no App.tsx

## Gestão de Usuários — Configurações (Jun 2026)
- [x] Endpoint team.listAllUsers (lista todos os usuários com status de senha)
- [x] Endpoint team.sendSetupLink (gera token + envia email de criação de senha)
- [x] Endpoint team.deleteUser (apaga usuário, regras de segurança via canDeleteUser)
- [x] Página /criar-senha (CreatePassword) reutilizando resetPassword
- [x] UI AdminManagement: enviar link de senha + apagar usuário
- [x] Botão cancelar/remover convite e membro em Configurações
- [x] Função pura shared/userManagement.ts + testes vitest (7 testes)
## Incorporação CPP nos Protocolos — Estruturação de Sections (Jun 2026)
- [x] Diagnóstico: 16 protocolos com sections como lista de strings (conteúdo CPP estava em raw_content)
- [x] Confirmar renderização em ProtocolDetail.tsx (section.title/content + flags is_mev/is_prescription/is_references/is_secretary via Streamdown)
- [x] Parser determinístico (fix_protocols_sections.py): divide raw_content por '## N. TÍTULO', cria objetos {title, content, flags}
- [x] Aplicar parser aos 16 protocolos (16/16 convertidos, 0 seções vazias, contagem 1:1 preservada)
- [x] Validar integridade dos 69: JSON válido, 0 sections-string restantes, 0 content vazio, markdown preservado (tabelas/blockquotes/listas)
- [x] TypeScript sem erros (tsc --noEmit) + 38 testes vitest passando

## Revisão CPP de Todos os Protocolos — Conteúdo + Experiência Premium (Jun 2026)
Rubrica padrão-ouro em /home/ubuntu/cpp_rubrica_padrao_ouro.md (referência: 4_disfuncao_eretil)
### Lote 1 — Lacunas (completar Secretaria/MEV/Prescrição)
- [x] kallmann_hhg_congenito
- [x] dfi_fragmentacao_dna
- [x] torcao_testicular
- [x] cancer_testicular
- [x] litiase_renal_ureteral
- [x] itu_masculina_prostatite_aguda
- [x] iue_feminina
- [x] espermograma_fertilidade
- [x] 17_priapismo_emergencia
- [x] varicocele
- [x] azoospermia_hipospermia
- [x] fratura_peniana
- [x] epididimite_orquite
- [x] liquen_escleroso_peniano
### Lote 2 — Consistência CPP/clínica nos 47 já completos (revisão por amostragem)
- [x] Revisar voz CPP e Acompanhamento Premium nos protocolos clínicos completos
- [x] UroDocx (22): mantidos como descrições operatórias (consistência conferida)
### Validação
- [x] JSON válido, 0 sections-string, 0 content vazio, markdown preservado
- [x] tsc --noEmit + vitest OK (40/40)
- [x] Checkpoint salvo (3666d920)

### Requisito adicional (usuário): Plano de Acompanhamento Premium
- [x] Plano de Acompanhamento Premium (ANTES/DURANTE/DEPOIS) adicionado aos 47 protocolos clínicos — deixa explícito que não é venda de cirurgia isolada, mas jornada de cuidado completo

## Bugs reportados (prioridade alta)
- [x] E-mail com a senha não está sendo enviado → remetente trocado para domínio verificado no Resend (bulhoesurohealth.com); teste de envio real OK (status 200)
- [x] Página de login não abre → getLoginUrl apontava para /doctor-login (inexistente); corrigido para /login/doctor + alias de rota + correção no TeamJoin

## Revisão CPP — Progresso
- [x] Lote 1A: Kallmann, DFI (Rx+MEV+Secretaria+Acompanhamento)
- [x] Lote 1B: câncer testicular, litíase, ITU/prostatite, IUE
- [x] Lote 1C: torção, varicocele, azoospermia, fratura, epididimite, líquen, espermograma, priapismo (Secretaria + Acompanhamento)
- [x] Lote 2A: Acompanhamento Premium em 21 protocolos (Andrologia, Infertilidade, Consultório)
- [x] Lote 2B: Acompanhamento Premium em Hormônios, Urologia Geral/Feminina restantes
- [x] Completar Secretaria no estenose_uretral
- [x] Resultado: 47/47 protocolos clínicos com Secretaria + Acompanhamento Premium; 0 seções vazias
- [x] Modelos UroDocx (22): mantidos como descrições operatórias (já têm Secretaria)
- [x] Validação: TypeScript OK, 40/40 testes passando

## Auditoria final (verificação de evidência)
- [x] espermograma_fertilidade: adicionada seção MODELO DE PRESCRIÇÃO (estratificada: antioxidante, doxiciclina, clomifeno/anastrozol) reaproveitando doses já citadas — is_prescription=True
- [x] 17_priapismo_emergencia: adicionada seção PRESCRIÇÃO/MEDICAÇÃO DE EMERGÊNCIA (fenilefrina intracavernosa 100–200 mcg, máx 1000 mcg/h) reaproveitando esquema já presente — is_prescription=True
- [x] UroDocx (22/22): auditados — estrutura padronizada em 6 seções, 0 sections-string, 0 vazias, todos com Secretaria, ~7.300 chars cada; consistência confirmada, sem necessidade de reescrita
- [x] Validação final: 69 protocolos, 0 sections-string, 0 vazios, TypeScript OK, 40/40 testes

## Bug: Erro ao aceitar convite (Failed query update team_members)
- [x] Causa: invitation_token é NOT NULL + UNIQUE; o aceite gravava token = "" → 2º aceite colidia no índice único
- [x] Correção no código: aceite agora grava token único (used:{id}:{ts}:{rand}) em vez de ""
- [x] Correção de dados: registro 120001 com token vazio recebeu token used: único (0 tokens vazios restantes)
- [x] Teste de regressão adicionado (acceptInvite.regression.test.ts); 43/43 testes OK

## Limpeza de dados e normalização de e-mail
- [x] Deletados convites duplicados (8 → 4 membros): mantidos apenas os mais recentes de cada e-mail
- [x] Adicionada normalização de e-mail para minúsculas no fluxo de convite (invite): previne duplicatas por variação de maiúsculas
- [x] TypeScript OK, 43/43 testes passando

## Validação de e-mail no frontend
- [x] Adicionada validação de formato de e-mail (regex) antes do envio do convite
- [x] Alerta claro exibido ao usuário se o e-mail for inválido (ex: "E-mail inválido. Verifique o formato")
- [x] TypeScript OK, 43/43 testes passando

## Validação em tempo real com feedback visual
- [x] Adicionado feedback visual de cores enquanto o usuário digita o e-mail
- [x] Borda verde + ícone de checkmark quando e-mail é válido
- [x] Borda vermelha + ícone de alerta quando e-mail é inválido
- [x] Ícones desaparecem quando o campo está vazio (sem feedback visual inicial)
- [x] TypeScript OK, 43/43 testes passando

## Sugestão de correção de domínio de e-mail
- [x] Adicionada detecção de erros comuns de digitação (gmial.com, gmai.com, yahooo.com, hotmial.com, outlok.com, icloud.co)
- [x] Exibição de sugestão com botão "Corrigir" quando domínio inválido é detectado
- [x] Clique no botão aplica a correção automaticamente
- [x] TypeScript OK, 43/43 testes passando

## Bug: Link de reset de senha apontava para domínio de staging
- [x] Corrigido: URL de reset agora força o domínio correto (protocolos.felipebulhoes.com) quando x-forwarded-host é um domínio de staging (railway.app, manus.computer)
- [x] TypeScript OK, 43/43 testes passando

## Otimização dos Blocos de Acompanhamento Premium — Pacote Completo de Transformação (Fase 2)
- [x] Redesenhar bloco com estrutura extensa: Pré-op (vitaminas/suplementos com justificativa científica), Durante, Pós-op (multidisciplinar: fisioterapeuta, nutricionista, educador físico)
- [x] Aplicar novo bloco a todos os protocolos cirúrgicos/procedimentos (10 protocolos: IPP, varicocelectomia, microTESE, reversão vasectomia, vasectomia, circuncisão, Li-ESWT, PRP, HPB)
- [x] Validar integridade e salvar checkpoint (JSON OK, 43/43 testes, TypeScript OK, checkpoint b37aaf31)

## Geração de PDF com Identidade Visual (Fase 1 e 2)
- [x] Preparar estrutura de PDF com identidade visual (A4, seções clínicas, logo, cores, tipografia)
- [x] Implementar gerador de PDF no backend (tRPC) com WeasyPrint
- [x] Adicionar botão de download na UI (ProtocolDetail.tsx) com integração tRPC
- [x] Corrigir erros de TypeScript remanescentes (protocol possibly undefined, returnDates possibly null) - guard clauses e non-null assertions aplicadas
- [x] Testar e validar PDF (geração client-side via window.print, identidade visual A4)

## Correção de Bugs Críticos (PDF + Página em branco)
- [x] Investigar página em branco: causa raiz era erro de sintaxe/tipos no ProtocolDetail.tsx
- [x] Corrigir imports quebrados no server/routers.ts (removido procedimento PDF Python)
- [x] Corrigir todos os erros de TypeScript (0 erros, propriedades inexistentes removidas)
- [x] Corrigir falha no PDF: substituído Python/WeasyPrint por geração client-side (funciona em produção)
- [x] Testar: 47/47 testes passando, TypeScript limpo, duplicação de blocos premium removida
- [x] Salvar checkpoint (7d9b292e) e entregar

## Botão Limpar Paciente + Expansão Clínica + Landing Premium
- [x] Adicionar botão "Limpar paciente" no modal de PDF
- [x] Redigir bloco de Acompanhamento Premium clínico (3 meses)
- [x] Identificar protocolos clínicos não-cirúrgicos (7 protocolos)
- [x] Aplicar o bloco clínico aos protocolos não-cirúrgicos no JSON (7 protocolos, sem duplicação)
- [x] Criar landing page "Jornada Premium" (CPP, timeline, depoimentos, CTA) em /jornada-premium
- [x] Testar (47/47), TypeScript limpo, salvar checkpoint

## Grade de Estética Genital Masculina + Saúde Metabólica (Mentoria) — 2026-06-26
- [x] Pesquisar evidência GLP-1/tirzepatida (testosterona/espermograma) — meta-análise Andrology 2025, ECRs 2025
- [x] Pesquisar evidência: toxina botulínica estética genital, glândulas de Tyson a laser, escrotoplastia, preenchimento peniano HA, vasectomia sem bisturi e sem agulha
- [x] Auditar estrutura interna dos 4 protocolos a consolidar (7_HA, 11_circuncisao, 12_lipo, 6_vasectomia)
- [x] Criar NOVO: Síndrome Metabólica & Saúde Masculina (GLP-1/Ozempic/tirzepatida)
- [x] Criar NOVO: Toxina Botulínica na Estética Genital Masculina
- [x] Criar NOVO: Escrotoplastia Estética (Scrotal Lift)
- [x] Criar NOVO: Remoção de Glândulas de Tyson a Laser
- [x] Consolidar/renomear: 11_circuncisao_frenuloplastia -> Postectomia Cosmética com Grampeador
- [x] Expandir: 7_engrossamento_peniano_ha (preenchimento peniano, técnica detalhada)
- [x] Expandir: 12_lipo_suprapubica_webbing (lipectomia e dermolipectomia)
- [x] Atualizar: 6_vasectomia_sem_bisturi -> Vasectomia sem Bisturi e sem Agulha
- [x] Adicionar bloco de Linha de Cuidado Integral aos novos e consolidados
- [x] FOCO CENTRAL: cada protocolo evidencia a LINHA DE CUIDADO INTEGRAL com narrativa "o que voce realmente adquire"
- [x] Validar JSON (73 protocolos, sem duplicação), testes (tsc 0 erros + 53 vitest), salvar checkpoint

## Revisão do PDF/Impressão do Paciente — 2026-06-26
- [x] Reforçar filtro: excluir is_secretary, is_references, is_prescription + bloqueio por título (técnica cirúrgica, cálculo de anestésico, script, contorno de objeções, TCLE, modelos de prótese)
- [x] Higienizar a seção CPP: remover rapport/scripts/objeções, manter só a narrativa de acolhimento
- [x] Garantir inclusão da CPP (higienizada), MEV e Linha de Cuidado Integral/Acompanhamento Premium
- [x] Dar destaque visual à seção de Linha de Cuidado Integral (caixa destacada cobre + ✨)
- [x] Adicionar suporte a tabelas Markdown no PDF (equipe multidisciplinar etc.)
- [x] Frase-âncora abaixo do título reforçando "linha de cuidado completa"
- [x] Polir identidade visual do PDF (logo, azul-petróleo #1C3D5A, cobre #B87333)
- [x] Extrair pipeline puro para shared/pdfPatientFilter.ts + 9 testes de regressão contra os 73 protocolos
- [x] Validar (tsc 0 erros + 64/64 vitest), salvar checkpoint

## Capa Premium do PDF — 2026-06-26
- [x] Adicionar página de capa A4 (logo grande, nome do paciente, título/categoria, frase da Linha de Cuidado)
- [x] Garantir quebra de página após a capa (capa ocupa folha inteira)
- [x] Manter identidade visual (faixa azul-petróleo com logo branco + faixas cobre)
- [x] Capa adapta-se quando não há nome do paciente ("Plano de cuidado personalizado")
- [x] Validar visualmente via render WeasyPrint (logo branco visível sobre faixa azul)
- [x] Validar (tsc 0 erros + 64/64 vitest), salvar checkpoint

## Novas demandas — 2026-06-26 (filtro estética + guia GLP-1 + CRM/RQE)
- [x] Auditar categorização atual e identificar protocolos de estética genital
- [x] Criar/atribuir categoria "Estética Genital" (6 protocolos reclassificados) — filtro aparece automaticamente na Home
- [x] Criar guia do paciente sobre GLP-1 (Ozempic/Mounjaro) em linguagem leiga: emagrecimento → testosterona → fertilidade (GuiaGLP1.tsx, rotas /guia-glp1 e /canetas-emagrecedoras)
- [x] Revisar campos CRM/RQE: substituídos 148 "XXXXX" + 3 "[CRM]" + 45 com pontuação divergente -> padrão único CRM-SP 202291 / RQE 146538 (Urologia) em 37 protocolos; corrigido CRM antigo incorreto 241.135
- [x] Adicionados 3 testes de regressão (sem XXXXX, sem 241.135, assinatura usa CRM/RQE reais)
- [x] Validar (tsc 0 erros + 67/67 vitest), salvar checkpoint

## Site 100% interno + Guia GLP-1 como material interno — 2026-06-26
- [x] Proteger rota /configuracoes com DoctorGuard (estava sem login)
- [x] Proteger rotas /guia-glp1 e /canetas-emagrecedoras com DoctorGuard
- [x] Converter Guia GLP-1 em material interno: barra com botão Imprimir/Salvar PDF + @media print que oculta navegação/CTAs
- [x] Adicionar link do Guia GLP-1 no menu interno (sidebar) como "Material: Canetas (GLP-1)"
- [x] Validar (tsc 0 erros + 67/67 vitest)

## Orçamentos PRO (TUSS/OPME/Justificativa/Assinatura) — 2026-06-26
- [x] Finalizar pendências (rotas protegidas + Guia GLP-1) e salvar checkpoint
- [x] Extrair e indexar pacote oficial TUSS/OPME (TISS 202605): 281 procedimentos + 180 OPME curados (~58 KB)
- [x] Processar assinatura PNG transparente (assinatura_felipe_1e22a021.png) e subir como asset webdev
- [x] Schema/backend: tabela document_verifications + helpers + router (criar protegido, consultar público)
- [x] UI Orçamentos: busca TUSS por procedimento, seção OPME (add/remover), campo justificativa clínica
- [x] PDF do orçamento: seções TUSS/OPME/justificativa + autenticação visual (assinatura PNG, CRM/RQE, QR/hash)
- [x] Página pública de verificação do documento (/verificar/:codigo)
- [x] Corrigir CRM/RQE antigos em Budgets.tsx e protocols.json (241.135/112.445 -> 202291/146538)
- [x] Testes de integridade das bases TUSS/OPME (9 testes) — 76/76 vitest no total
- [DECISÃO] ICP-Brasil A1 adiado: caminho de menor custo usa autenticação visual+QR (aceito por convênios); certificado NÃO embarcado (Felipe vai trocar)
- [x] Validar (tsc 0 erros + 76/76 vitest), salvar checkpoint

## Orçamento Financeiro OPME — 2026-06-26
- [x] Campo opcional de preço por item de OPME (e quantidade) na UI do orçamento
- [x] Numeração dos itens + subtotal por item + total geral de OPME
- [x] Refletir valores/subtotais/total no HTML do PDF (seção OPME financeira)
- [x] Validar (tsc 0 erros + 76/76 vitest), salvar checkpoint

## Jornada Premium por Procedimento (12 jornadas) — 2026-06-26
- [x] Pesquisar evidências EAU/AUA para as 12 jornadas (otimização pré-op, cronograma pós-op, acompanhamento 6m)
- [x] Estruturar dados reutilizáveis em shared/jornadas.ts (tipados) com fontes citadas
- [x] Adicionar seção "Jornadas por Procedimento" + seletor (JornadasSelector) na JornadaPremium.tsx + CTA no hero
- [x] 12 jornadas: prótese peniana, varicocelectomia, vasectomia, reversão de vasectomia, MicroTESE, Li-ESWT/PRP, postectomia/frenuloplastia, litíase, HPB, TRT, incontinência (masc+fem), ITU de repetição
- [x] Teste de integridade dos dados (6 testes) movido p/ shared
- [x] Validar (tsc 0 erros + 82/82 vitest), salvar checkpoint

## Integrar Jornadas aos Protocolos (Opção 2 — sem redundância) — 2026-06-26
- [x] Mapear estrutura/lista dos protocolos (protocols.json) e cruzar com as 12 jornadas (17 protocolos cobrem as 12 jornadas)
- [x] Integrar jornadas aos protocolos existentes: seção "📅 Cronograma da Jornada (Resumo) & Sinais de Alerta" inserida (idempotente, sem duplicar) via scripts/integrate_jornadas.py
- [x] Remover página/rota pública da Jornada Premium (App.tsx, Layout.tsx, GuiaGLP1 footer) + arquivos JornadaPremium.tsx/JornadasSelector.tsx
- [x] Manter shared/jornadas.ts como fonte de verdade testada; só o Guia GLP-1 vai para o site público
- [x] Teste de integração (server/jornadasIntegration.test.ts, 4 testes)
- [x] Validar (tsc 0 erros + 86/86 vitest), salvar checkpoint

## PDF da Jornada no Protocolo — 2026-06-26
- [x] Destacar visualmente o cronograma da jornada no PDF do paciente (caixa "journey" azul-petróleo + badge)
- [x] Calcular datas reais das janelas via shared/journeySchedule.ts (Semana/Mês/Dia/h, intervalos pelo limite inicial; idempotente)
- [x] Teste do helper (shared/journeySchedule.test.ts, 9 testes)
- [x] Validar (tsc 0 erros + 95/95 vitest), salvar checkpoint
- [x] Orientar migração do Guia GLP-1 para o site público (pacote pronto; instrução entregue — executar na tarefa do bulhoesurohealth.com)

## Corrigir deploy OOM (exit 137) — 2026-06-27
- [x] Substituir Streamdown por MarkdownLite próprio (remove Mermaid/Shiki/WASM do bundle); dep streamdown removida
- [x] chunkSizeWarningLimit + NODE_OPTIONS=--max-old-space-size=2048 no build (margem de heap)
- [x] Build local: 27,7s→9,5s; JS 5.172→4.258 kB; ~14 chunks pesados eliminados; tsc 0 erros + 95/95 vitest
- [x] Salvar checkpoint e orientar nova publicação

## Botão Imprimir Jornada (linha do tempo) — 2026-06-27
- [x] Botão "Imprimir Jornada" no detalhe do protocolo (condicional: só com seção de jornada)
- [x] PDF A4 enxuto só com a seção Cronograma da Jornada (cabeçalho + paciente/data + linha do tempo + rodapé)
- [x] Reaproveita data do procedimento (datas reais) e estilo da caixa journey
- [x] Validar (tsc 0 erros + 95/95 vitest), salvar checkpoint
- [ ] Despublicar /guia-glp1 (após confirmação de que está ativo no site público)
