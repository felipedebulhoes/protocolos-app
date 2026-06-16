# TODO — Ficha Pré-Consulta Inteligente + Portal do Paciente (protocolos-app)

## Fase 1 — Fundação servidor/banco (reconstrução manual)
- [x] Ajustar package.json (scripts dev/build/db:push, deps)
- [x] Criar server/_core (env, cookies, oauth, context, trpc, sdk, vite, llm, storage, imageGeneration, notification, etc.)
- [x] Criar drizzle.config.ts + drizzle/schema.ts base (users)
- [x] Criar server/db.ts, server/routers.ts, client/src/lib/trpc.ts
- [x] Wire providers em client/src/main.tsx
- [x] Ajustar vite.config.ts (storage proxy, server bridge)
- [x] App compila e dev server roda sem erro
- [x] CHECKPOINT base

## Fase 2 — Schema + protocolos
- [x] Tabelas: patients, intake_forms, exam_files, exam_results (+ extensão users role)
- [x] pnpm db:push
- [x] Catálogo de protocolos com palavras-chave (server/protocolCatalog.ts)
- [x] Estrutura compartilhada da ficha (shared/intakeSchema.ts)
- [x] CHECKPOINT

## Fase 3 — Backend
- [x] Auth do paciente (email/senha, sessão por cookie próprio)
- [x] Geração de link com token (médico)
- [x] Ficha pública por token (submeter sem login)
- [x] Upload de exames base64 -> S3 -> leitura IA multimodal -> exam_results padronizados
- [x] Scoring de protocolo + rapport (server/intelligence.ts)
- [x] Routers (intake, exams, patientAuth)
- [x] CHECKPOINT

## Fase 4 — Frontend público
- [x] /ficha/:token multi-etapas (dados, motivo, sintomas, histórico, expectativas, exames, conclusão)
- [x] Componentes IntakeField + ExamUploader + PatientBrandHeader
- [x] Pós-envio: criação de senha do portal
- [x] Rota registrada no App.tsx (fora do Layout)
- [x] CHECKPOINT

## Fase 5 — Portal do paciente
- [x] /portal login/cadastro de senha
- [x] Histórico de exames padronizados (agrupado por categoria)
- [x] Envio de novos exames
- [x] Lista de arquivos enviados
- [x] CHECKPOINT

## Fase 6 — Painel do médico
- [x] IntakeManager: gerar link + listar fichas
- [x] IntakeDetail: rapport + protocolo sugerido + respostas + exames + anotações
- [x] Item de menu "Fichas Pré-Consulta" no Layout
- [x] Teste vitest do scoring (4 passando) + vitest.config dedicado
- [x] CHECKPOINT

## Fase 7 — Domínio + testes + entrega
- [x] Testes vitest (scoring 4 + categorização 6 = 10 passando)
- [x] Verificação de fluxos (typecheck 0 erros, rotas 200)
- [x] CHECKPOINT final
- [ ] Domínio paciente.felipebulhoes.com: orientar usuário (rota /ficha e /portal já públicas no domínio atual)

## Fase 8 — Consolidação do preportal no protocolos-app (Rota 1 escolhida pelo usuário; preportal só tem testes, sem migração)
- [ ] Auditar Home.tsx atual e roteamento (App.tsx) para rotas públicas do paciente
- [ ] Criar landing page pública do paciente (estilo preportal: Criar Conta / Já tenho conta, "Como funciona")
- [ ] Garantir rotas públicas: /cadastro e /login do paciente (além de /portal e /ficha/:token)
- [ ] Verificar que patientAuth.me NÃO expõe passwordHash (auditar nosso router)
- [ ] Validar fluxo completo no preview (cadastro -> ficha -> upload -> portal)
- [ ] Testes vitest + typecheck
- [ ] CHECKPOINT
- [ ] Orientar usuário: tornar site público (Settings) + revincular paciente.felipebulhoes.com
- [ ] Registrar no cérebro
