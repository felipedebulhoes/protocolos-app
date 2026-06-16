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
- [ ] /portal login/cadastro de senha
- [ ] Histórico de exames padronizados (timeline)
- [ ] Envio de novos exames
- [ ] CHECKPOINT

## Fase 6 — Painel do médico
- [ ] IntakeManager: gerar link + listar fichas
- [ ] IntakeDetail: rapport + protocolo sugerido + respostas + exames + anotações
- [ ] Menu no Layout
- [ ] CHECKPOINT

## Fase 7 — Domínio + testes + entrega
- [ ] Apontar paciente.felipebulhoes.com para entrada pública
- [ ] Testes vitest (scoring, categorização)
- [ ] Verificação de fluxos
- [ ] CHECKPOINT final + entrega
