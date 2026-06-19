
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
- [ ] Adicionar tabela `team_members` no schema do Drizzle (nome, email, role, status, criado_em)
- [ ] Criar tRPC procedures: listTeamMembers, inviteTeamMember, removeTeamMember, updateTeamMemberRole
- [ ] Implementar UI em Configurações com tabela de membros + botão "Convidar Membro"
- [ ] Adicionar autenticação para usuários convidados (links de convite com token único)
- [ ] Criar página de login/cadastro para membros convidados
