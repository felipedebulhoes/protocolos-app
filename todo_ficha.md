# TODO — Ficha Pré-Consulta Inteligente + Portal do Paciente (protocolos-app)

## Fase 1 — Fundação servidor/banco (reconstrução manual)
- [ ] Ajustar package.json (scripts dev/build/db:push, deps)
- [ ] Criar server/_core (env, cookies, oauth, context, trpc, sdk, vite, llm, storage, imageGeneration, notification, etc.)
- [ ] Criar drizzle.config.ts + drizzle/schema.ts base (users)
- [ ] Criar server/db.ts, server/routers.ts, client/src/lib/trpc.ts
- [ ] Wire providers em client/src/main.tsx
- [ ] Ajustar vite.config.ts (storage proxy, server bridge)
- [ ] App compila e dev server roda sem erro
- [ ] CHECKPOINT base

## Fase 2 — Schema + protocolos
- [ ] Tabelas: patients, intake_forms, exam_files, exam_results (+ extensão users role)
- [ ] pnpm db:push
- [ ] Catálogo de protocolos com palavras-chave (server/protocolCatalog.ts)
- [ ] Estrutura compartilhada da ficha (shared/intakeSchema.ts)
- [ ] CHECKPOINT

## Fase 3 — Backend
- [ ] Auth do paciente (email/senha, sessão por cookie próprio)
- [ ] Geração de link com token (médico)
- [ ] Ficha pública por token (submeter sem login)
- [ ] Upload de exames base64 -> S3 -> leitura IA multimodal -> exam_results padronizados
- [ ] Scoring de protocolo + rapport (server/intelligence.ts)
- [ ] Routers (intake, exams, patientAuth)
- [ ] CHECKPOINT

## Fase 4 — Frontend público
- [ ] /ficha/:token multi-etapas (dados, motivo, sintomas, histórico, expectativas, exames, conclusão)
- [ ] Componentes IntakeField + ExamUploader
- [ ] CHECKPOINT

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
