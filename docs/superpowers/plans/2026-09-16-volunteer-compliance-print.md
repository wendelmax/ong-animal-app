# Cadastro Público, Evidências e Impressão do Termo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar cadastro público completo de voluntários, evidências privadas, termo preenchido imprimível com timbre e exportação CSV auditada, compatíveis com Vercel, PostgreSQL, R2 e Upstash.

**Architecture:** O Payload continua sendo CMS e backend. Rotas administrativas sensíveis serão App Router explícitas, autenticadas por `payload.auth`; o cadastro público usa convite com token hash, upload direto para R2 e aceite versionado. O termo imprimível será HTML server-rendered com allowlist de placeholders e CSS de impressão; a exportação regulatória será CSV autenticado e auditado.

**Tech Stack:** Next.js App Router 16, Payload 3, PostgreSQL, Cloudflare R2 via URLs pré-assinadas, Upstash Rate Limit, Vitest/jsdom, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-16-volunteer-compliance-print-design.md`

## Global Constraints

- Trabalhar em worktree e branch próprios; cada PR será revisado e mergeado manualmente pelo usuário.
- Não armazenar token público em claro; persistir apenas SHA-256.
- O CPF será criptografado em repouso, pesquisado por blind index e mascarado por padrão.
- Foto pessoal e documento ficarão em R2 privado, acessíveis somente por URL temporária autorizada.
- A declaração aceita deve ser exatamente `Li e concordo com os termos de adesão e tratamento de dados`.
- Termos `PUBLISHED` ou `RETIRED` não poderão ser editados nem excluídos.
- Placeholders desconhecidos impedirão a publicação do termo.
- A cópia local será HTML imprimível/“Salvar como PDF”; não será declarada assinatura ICP-Brasil nem PDF/A.
- Exportações com CPF completo exigirão `COMPLIANCE_OFFICER`, `LEGAL_DIRECTOR` ou `Admin` e registrarão auditoria.

---

## PR A — Corrigir a geração administrativa do convite

### Task 1: Extrair autenticação administrativa do Payload

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/auth.ts`
- Test: `apps/web/tests/int/volunteer-registration-http.int.spec.ts`

**Interfaces:**
- Produces `authenticatePayloadRequest(request: Request): Promise<{ payload: any; req: any; user: any }>`.
- `req` será o mesmo `Request` enriquecido com `payload`, para que `createInvitation` possa encaminhar cookies, headers e contexto ao Payload.

- [ ] **Step 1: Escrever o teste vermelho**

Adicionar um teste que simule `payload.auth()` retornando `{ user: { id: 'admin-1', role: 'Admin' } }` e verifique que `authenticatePayloadRequest` chama `payload.auth({ headers: request.headers, req })` e retorna o usuário autenticado.

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-registration-http.int.spec.ts --reporter=verbose`  
Expected: FAIL porque o helper ainda não existe.

- [ ] **Step 3: Implementar o helper mínimo**

Usar `getPayload({ config })`, criar `req = Object.assign(request, { payload })` e chamar `payload.auth({ headers: request.headers, req })`. Retornar o triplo `{ payload, req, user }`; não registrar cookies, headers ou PII em logs.

- [ ] **Step 4: Rodar o teste novamente**

Run: o mesmo comando do Step 2.  
Expected: PASS.

- [ ] **Step 5: Commitar**

```bash
git add apps/web/src/lib/volunteer-registration/auth.ts apps/web/tests/int/volunteer-registration-http.int.spec.ts
git commit -m "refactor: centralize payload admin authentication"
```

### Task 2: Expor rota App Router para gerar convite

**Files:**
- Create: `apps/web/src/app/api/volunteer-invitations/generate/route.ts`
- Modify: `apps/web/src/lib/volunteer-registration/http.ts`
- Modify: `apps/web/src/endpoints/volunteerRegistration.ts`
- Modify: `apps/web/src/components/Admin/VolunteerInvitationActions.tsx`
- Test: `apps/web/tests/int/volunteer-registration-routes.int.spec.ts`
- Test: `apps/web/tests/int/volunteer-invitation-endpoint.int.spec.ts`

**Interfaces:**
- Produces `POST /api/volunteer-invitations/generate`.
- The route calls `createInvitationHttp(request)`, which authenticates the Payload user, parses `{ expiresAt: string; maxUses?: number }`, calls `createInvitation`, and returns `{ url, expiresAt }`.
- Authentication or validation errors return `{ error: code }` with the status definido por `VolunteerRegistrationError`.

- [ ] **Step 1: Escrever testes vermelhos da rota explícita**

Adicionar teste que importe `@/app/api/volunteer-invitations/generate/route`, envie `POST` e confirme delegação a `createInvitationHttp`. Adicionar teste HTTP que mocke `payload.auth` e `createInvitation` e confirme que o body é encaminhado com o usuário autenticado.

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-registration-routes.int.spec.ts tests/int/volunteer-invitation-endpoint.int.spec.ts --reporter=verbose`  
Expected: FAIL porque a rota App Router ainda não existe.

- [ ] **Step 3: Implementar rota e dispatcher**

Criar a função `POST(request)` que retorna `createInvitationHttp(request)`. No dispatcher, usar `authenticatePayloadRequest`, chamar `createInvitation`, e reutilizar `errorResponse`; não duplicar geração de token nem regra de RBAC.

- [ ] **Step 4: Remover a rota administrativa duplicada do endpoint Payload**

Retirar o item `POST /volunteer-invitations/generate` de `volunteerRegistrationEndpoints`; manter somente os endpoints públicos e as ações que realmente são resolvidas pelo roteador Payload. O componente administrativo deve continuar usando somente `/api/volunteer-invitations/generate`.

- [ ] **Step 5: Rodar testes e TypeScript**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-registration-routes.int.spec.ts tests/int/volunteer-invitation-endpoint.int.spec.ts --reporter=verbose` e `node node_modules/typescript/bin/tsc --noEmit`.  
Expected: testes PASS e TypeScript exit code 0.

- [ ] **Step 6: Commitar e abrir PR A**

```bash
git add apps/web/src/app/api/volunteer-invitations/generate/route.ts apps/web/src/lib/volunteer-registration/http.ts apps/web/src/endpoints/volunteerRegistration.ts apps/web/src/components/Admin/VolunteerInvitationActions.tsx apps/web/tests/int/volunteer-registration-routes.int.spec.ts apps/web/tests/int/volunteer-invitation-endpoint.int.spec.ts
git commit -m "fix: expose volunteer invitation generation through app router"
git push -u origin fix/volunteer-invitation-app-route
gh pr create --base main --head fix/volunteer-invitation-app-route --title "fix: expor geração de convite pela rota App Router" --body "Corrige o 404 da geração administrativa, preservando RBAC, token hash e auditoria."
```

- [ ] **Step 7: Validar produção após merge**

Com Playwright, autenticar via `/api/users/login`, chamar `POST /api/volunteer-invitations/generate` com `maxUses: 1` e validade de 30 dias, abrir a URL sem autenticação e consultar o registro administrativo por `tokenHash`. Confirmar `generateStatus=200`, `publicStatus=200`, `tokenHash` presente, convite `ACTIVE`, `usedCount=0` e evento `VOLUNTEER_INVITATION_CREATED`. Não criar outro registro se a rota retornar erro.

### Task 3: Fechar o ciclo público do formulário e dos anexos

**Files:**
- Modify: `apps/web/src/components/VolunteerRegistrationForm.tsx`
- Modify: `apps/web/src/components/VolunteerFileUpload.tsx`
- Modify: `apps/web/src/lib/volunteer-registration/service.ts`
- Test: `apps/web/tests/int/volunteer-registration-form.int.spec.ts`
- Test: `apps/web/tests/int/volunteer-registration-payload.int.spec.ts`

- [ ] **Step 1: Confirmar testes de aceite, arquivos e concorrência**

Executar o teste de formulário, o teste de domínio e o teste de integração PostgreSQL/R2. Confirmar que o formulário exige `PERSONAL_PHOTO`, `IDENTITY_DOCUMENT` e o valor literal do aceite; o teste de banco deve confirmar dois arquivos relacionados, aceite e convite `EXHAUSTED`.

- [ ] **Step 2: Adicionar qualquer teste ausente antes de alterar comportamento**

Se não houver cobertura para resposta pública sem PII e reutilização de convite, adicionar testes que verifiquem ausência de CPF completo e erro `INVITATION_INVALID` na segunda submissão.

- [ ] **Step 3: Ajustar somente o necessário**

Manter uploads fora da Function via URL R2 pré-assinada, preservar `contentHashAtAcceptance`, IP, User-Agent e auditoria, e garantir que falhas de upload não criem voluntário parcialmente salvo.

- [ ] **Step 4: Rodar suíte completa e commitar PR A/B conforme escopo**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts` e `node node_modules/typescript/bin/tsc --noEmit`. Registrar como esperado o teste PostgreSQL pulado quando `DATABASE_URL` não estiver configurada.

---

## PR B — Snapshot do termo e página imprimível com timbre

### Task 4: Preservar snapshot do termo aceito e bloquear mutação publicada

**Files:**
- Modify: `apps/web/src/collections/MembershipTermVersions.ts`
- Modify: `apps/web/src/collections/VolunteerTermAcceptances.ts`
- Modify: `apps/web/src/lib/volunteer-registration/service.ts`
- Create: migration Payload gerada em `apps/web/src/migrations/`
- Test: `apps/web/tests/int/membership-term-immutability.int.spec.ts`
- Test: `apps/web/tests/int/volunteer-registration-payload.int.spec.ts`

**Interfaces:**
- `volunteer-term-acceptances.contentSnapshot: string` contém o texto canônico exato usado no aceite.
- `MembershipTermVersions` rejeita update/delete de registros `PUBLISHED` ou `RETIRED`.
- `contentHash` continua sendo SHA-256 do texto normalizado NFC.

- [ ] **Step 1: Escrever teste vermelho de imutabilidade e snapshot**

Testar que update/delete de termo publicado falham, que termos DRAFT continuam editáveis e que `submitRegistration` grava `contentSnapshot` igual ao conteúdo retornado para o voluntário.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/membership-term-immutability.int.spec.ts --reporter=verbose`  
Expected: FAIL porque não há bloqueio nem campo de snapshot.

- [ ] **Step 3: Implementar hooks/access e campo**

Bloquear mutações depois de `PUBLISHED`/`RETIRED`, manter hash calculado no hook e adicionar o campo somente leitura `contentSnapshot` em `VolunteerTermAcceptances`. Na criação do aceite, salvar `term.content` junto com `term.contentHash`.

- [ ] **Step 4: Gerar e aplicar migration**

Usar o comando de migração Payload do projeto para gerar a alteração de coluna/texto, revisar o SQL e executar localmente com PostgreSQL. Não alterar produção manualmente; o deploy deverá executar a migração prevista pelo fluxo do projeto.

- [ ] **Step 5: Rodar teste, suíte e TypeScript**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/membership-term-immutability.int.spec.ts tests/int/volunteer-registration-payload.int.spec.ts`, `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts` e `node node_modules/typescript/bin/tsc --noEmit`.  
Expected: novo teste PASS; suíte sem regressões; teste PostgreSQL somente pulado sem banco.

- [ ] **Step 6: Commitar**

```bash
git add apps/web/src/collections/MembershipTermVersions.ts apps/web/src/collections/VolunteerTermAcceptances.ts apps/web/src/lib/volunteer-registration/service.ts apps/web/src/migrations apps/web/tests/int/membership-term-immutability.int.spec.ts apps/web/tests/int/volunteer-registration-payload.int.spec.ts
git commit -m "feat: preserve accepted volunteer term snapshots"
```

### Task 5: Criar renderizador seguro de placeholders

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/term-template.ts`
- Modify: `apps/web/src/collections/MembershipTermVersions.ts`
- Test: `apps/web/tests/int/volunteer-term-template.int.spec.ts`

**Interfaces:**
- `TermRenderContext` contém `term`, `volunteer`, `operational` e `acceptance` com strings já formatadas.
- `renderVolunteerTerm(template: string, context: TermRenderContext): string` substitui somente a allowlist definida na especificação e escapa `& < > " '`.
- `validateVolunteerTermTemplate(template: string): { valid: true } | { valid: false; unknownTags: string[] }` rejeita tags desconhecidas antes de publicação.

- [ ] **Step 1: Escrever testes vermelhos**

Cobrir substituição de todas as tags permitidas, escape de valor com HTML, tag desconhecida rejeitada e preservação de quebras de linha do texto legal.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-term-template.int.spec.ts --reporter=verbose`  
Expected: FAIL porque o módulo não existe.

- [ ] **Step 3: Implementar allowlist e escape**

Usar regex para localizar `{{ path }}`, normalizar espaços do path, procurar somente nas chaves tipadas e lançar/retornar erro para qualquer chave fora da allowlist. Não usar `eval`, acesso dinâmico livre ou HTML fornecido pelo voluntário.

- [ ] **Step 4: Validar publicação**

Chamar `validateVolunteerTermTemplate` no ciclo de publicação/antes da mudança para impedir versão `PUBLISHED` com placeholder inválido.

- [ ] **Step 5: Rodar teste e TypeScript**

Run: o teste do Step 2 e `node node_modules/typescript/bin/tsc --noEmit`.  
Expected: PASS e exit code 0.

- [ ] **Step 6: Commitar**

```bash
git add apps/web/src/lib/volunteer-registration/term-template.ts apps/web/src/collections/MembershipTermVersions.ts apps/web/tests/int/volunteer-term-template.int.spec.ts
git commit -m "feat: render volunteer terms with an allowlisted context"
```

### Task 6: Criar página protegida de impressão e ação no admin

**Files:**
- Create: `apps/web/src/app/(frontend)/voluntarios/imprimir/[id]/page.tsx`
- Create: `apps/web/src/components/VolunteerPrintableTerm.tsx`
- Modify: `apps/web/src/components/Admin/VolunteerReviewActions.tsx`
- Modify: `apps/web/src/lib/volunteer-registration/access.ts`
- Test: `apps/web/tests/int/volunteer-print-route.int.spec.ts`
- Test: `apps/web/tests/int/volunteer-printable-term.int.spec.ts`

**Interfaces:**
- `GET /voluntarios/imprimir/[id]` autentica a sessão Payload no servidor e renderiza HTML; usuários sem papel permitido recebem `notFound()`/403 sem dados.
- `VolunteerPrintableTerm` recebe `{ volunteer, acceptance, renderedContent, showFullCpf, logoSrc }` e renderiza cabeçalho, termo, metadados e rodapé de impressão.
- `VolunteerReviewActions` adiciona “Imprimir termo” abrindo a URL em nova aba; não envia PII via query string.

- [ ] **Step 1: Escrever testes vermelhos**

Testar que usuário não autenticado/`VOLUNTEER_MANAGER` não acessa CPF completo nem dados privados; `Admin`, `COMPLIANCE_OFFICER` e `LEGAL_DIRECTOR` conseguem renderizar conforme a regra; o HTML contém `/logo.png`, versão, hash e declaração literal.

- [ ] **Step 2: Rodar testes para confirmar falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-print-route.int.spec.ts tests/int/volunteer-printable-term.int.spec.ts --reporter=verbose`  
Expected: FAIL porque a página e o componente ainda não existem.

- [ ] **Step 3: Implementar consulta autorizada**

Buscar voluntário por ID, aceite correspondente e `contentSnapshot`; usar `contentHashAtAcceptance` e `termVersion` para apresentar a evidência; gerar contexto operacional a partir dos campos atuais de `volunteers`; não reconstruir o texto a partir de uma versão que possa ter sido alterada.

- [ ] **Step 4: Implementar página e CSS de impressão**

Usar `public/logo.png`, cabeçalho institucional, `white-space: pre-wrap` para preservar o texto, seções de assinatura/testemunhas e `@media print` para esconder botões e navegação. Exibir CPF mascarado por padrão e completo somente com papel autorizado, gerando evento de acesso ao documento.

- [ ] **Step 5: Adicionar ação administrativa e teste visual básico**

Adicionar botão em `VolunteerReviewActions`; testar que a URL usa somente o ID e que o componente não inclui token/CPF na URL. Validar em Playwright que a página abre com login e que o botão de impressão está oculto no modo print.

- [ ] **Step 6: Rodar suíte, TypeScript e build**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts`, `node node_modules/typescript/bin/tsc --noEmit` e `node node_modules/next/dist/bin/next build`.  
Expected: testes e TypeScript PASS; investigar antes do merge qualquer falha de build, incluindo a dependência preexistente `@payloadcms/translations/languages/pt`.

- [ ] **Step 7: Commitar e abrir PR B**

```bash
git add apps/web/src/app/'(frontend)'/voluntarios/imprimir apps/web/src/components/VolunteerPrintableTerm.tsx apps/web/src/components/Admin/VolunteerReviewActions.tsx apps/web/src/lib/volunteer-registration/access.ts apps/web/tests/int/volunteer-print-route.int.spec.ts apps/web/tests/int/volunteer-printable-term.int.spec.ts
git commit -m "feat: add printable volunteer term with organization letterhead"
git push -u origin feat/volunteer-printable-term
gh pr create --base main --head feat/volunteer-printable-term --title "feat: imprimir termo de voluntário preenchido" --body "Adiciona snapshot renderizado, página protegida de impressão e timbre local."
```

---

## PR C — Exportação regulatória auditada

### Task 7: Implementar consulta anual e serializador CSV

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/compliance-export.ts`
- Test: `apps/web/tests/int/volunteer-compliance-export.int.spec.ts`

**Interfaces:**
- `buildVolunteerCgeCsv(rows, options): { csv: string; recordsCount: number }` recebe linhas normalizadas e `includeCpf`.
- O cabeçalho CSV será `Nome Completo,CPF,Área de Atuação,Função Específica,Data de Ingresso,Data de Desligamento,Horas/Mês,Status`.
- Campos serão escapados conforme CSV, inclusive aspas, vírgulas e quebras de linha; o CSV será UTF-8 com BOM para abrir corretamente no Excel.

- [ ] **Step 1: Escrever testes vermelhos**

Cobrir cabeçalho, escape de vírgula/aspas, CPF mascarado quando `includeCpf=false`, CPF completo quando `includeCpf=true` e zero registros.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-compliance-export.int.spec.ts --reporter=verbose`  
Expected: FAIL porque o serializador não existe.

- [ ] **Step 3: Implementar serializador puro**

Manter o serializador sem acesso a Payload, R2 ou variáveis de ambiente para permitir teste determinístico. Receber CPF já formatado/descriptografado somente do serviço autorizado.

- [ ] **Step 4: Rodar teste e commitar**

Run: teste do Step 2.  
Expected: PASS.

```bash
git add apps/web/src/lib/volunteer-registration/compliance-export.ts apps/web/tests/int/volunteer-compliance-export.int.spec.ts
git commit -m "feat: serialize volunteer compliance csv"
```

### Task 8: Criar rota autenticada, filtro anual e auditoria

**Files:**
- Create: `apps/web/src/app/api/v1/compliance/cge/export-volunteers/route.ts`
- Modify: `apps/web/src/lib/volunteer-registration/auth.ts`
- Modify: `apps/web/src/lib/volunteer-registration/access.ts`
- Modify: `apps/web/src/lib/volunteer-registration/service.ts`
- Test: `apps/web/tests/int/volunteer-compliance-export-route.int.spec.ts`

**Interfaces:**
- `GET /api/v1/compliance/cge/export-volunteers?year=2026&includeCpf=false` retorna `text/csv; charset=utf-8` e `Content-Disposition: attachment`.
- `year` deve ser inteiro entre 2000 e o ano atual + 1; `includeCpf=true` exige papel autorizado.
- Filtro: `dataIngresso <= 31/12/year` e `dataDesligamento` nulo ou `>= 01/01/year`.
- Cada exportação cria `LGPD_SENSITIVE_DATA_EXPORT` com ano, destino `CGE_SP_CEE`, contagem e `includeCpf`.

- [ ] **Step 1: Escrever testes vermelhos**

Testar 401/403, ano inválido, filtragem de vínculo ativo, CSV sem CPF para gerente, CSV com CPF somente para jurídico/compliance e evento de auditoria com contagem.

- [ ] **Step 2: Rodar testes para confirmar falha**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts tests/int/volunteer-compliance-export-route.int.spec.ts --reporter=verbose`  
Expected: FAIL porque a rota não existe.

- [ ] **Step 3: Implementar consulta e RBAC**

Usar `authenticatePayloadRequest`, consultar `volunteers` com `overrideAccess: true`, descriptografar CPF somente quando `includeCpf=true` e o papel permitir, montar linhas normalizadas e chamar `buildVolunteerCgeCsv`. Nunca incluir `cpfEncrypted` ou `cpfBlindIndex` no CSV mascarado.

- [ ] **Step 4: Registrar auditoria e resposta**

Criar evento com `eventType: 'LGPD_SENSITIVE_DATA_EXPORT'`, ator, papel, fundamento `LEGAL_OBLIGATION_ART_7_II_LGPD`, norma `RESOLUCAO_CGE_15_2026_ANEXO_II_D`, destino `CGE_SP_CEE`, ano, quantidade e inclusão de CPF. Retornar CSV somente depois de persistir a auditoria.

- [ ] **Step 5: Rodar testes, TypeScript e build**

Run: `node node_modules/vitest/vitest.mjs run --config ./vitest.config.mts`, `node node_modules/typescript/bin/tsc --noEmit` e `node node_modules/next/dist/bin/next build`.  
Expected: todos os testes aplicáveis PASS; qualquer teste de integração PostgreSQL sem `DATABASE_URL` deve ser explicitamente reportado como pulado.

- [ ] **Step 6: Adicionar ação no admin e abrir PR C**

Adicionar botão “Exportar relatório regulatório” em `apps/web/src/components/Admin/VolunteerInvitationActions.tsx` ou componente administrativo dedicado, solicitando ano-base e iniciando download da rota. Não incluir CPF completo no texto da interface nem na URL quando a opção não estiver marcada.

```bash
git add apps/web/src/app/api/v1/compliance/cge/export-volunteers/route.ts apps/web/src/lib/volunteer-registration/auth.ts apps/web/src/lib/volunteer-registration/access.ts apps/web/src/lib/volunteer-registration/service.ts apps/web/src/components/Admin apps/web/tests/int
git commit -m "feat: add audited volunteer compliance export"
git push -u origin feat/volunteer-compliance-export
gh pr create --base main --head feat/volunteer-compliance-export --title "feat: exportar voluntários para compliance" --body "Adiciona CSV anual auditado com RBAC e mascaramento de CPF."
```

---

## Verificação final e operação em produção

### Task 9: Verificar cada PR antes de afirmar conclusão

- [ ] Rodar `git diff --check` e confirmar worktree limpa após commit.
- [ ] Rodar suíte Vitest completa; registrar contagem exata de testes e skips.
- [ ] Rodar `node node_modules/typescript/bin/tsc --noEmit`.
- [ ] Rodar build Vercel/Next; se `@payloadcms/translations/languages/pt` continuar ausente, abrir diagnóstico separado antes de classificar o recurso como pronto.
- [ ] Conferir no Vercel CLI que o deployment de cada merge está `Ready` e possui alias `www.viralatinhas.com`.
- [ ] Criar apenas um convite de produção após a rota estar `Ready`; se qualquer chamada falhar, parar e não criar registros adicionais.
- [ ] Testar link anônimo, upload de duas evidências, aceite, convite exaurido, revisão administrativa e página imprimível.
- [ ] Baixar CSV mascarado e, em sessão autorizada, CSV regulatório com auditoria; verificar que endpoints públicos não expõem CPF completo.
- [ ] Informar ao usuário PRs, deployments, convite final e limitações restantes: PDF/A/ICP-Brasil, `volunteer_allocations`, antivírus/magic bytes e WORM.

