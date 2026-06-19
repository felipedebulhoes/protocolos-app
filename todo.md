
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
