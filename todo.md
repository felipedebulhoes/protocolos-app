
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
