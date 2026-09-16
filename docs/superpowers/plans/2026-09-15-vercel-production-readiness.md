# Vercel Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o cadastro público de voluntários executável no deployment da Vercel com rotas explícitas, migrações Neon e armazenamento Payload compatível.

**Architecture:** O App Router terá quatro rotas públicas finas que delegam para um único dispatcher HTTP, preservando o serviço de domínio existente. A configuração do Payload apontará para `src/migrations`, usará `push` somente fora de produção e o comando de build aplicará migrações antes do `next build`; `media` será conectado ao adaptador UploadThing, enquanto uploads privados continuam no R2.

**Tech Stack:** Next.js App Router, Payload CMS 3, PostgreSQL/Neon, UploadThing, Cloudflare R2, Upstash Redis, Vitest e Vercel CLI.

**Spec:** `docs/superpowers/specs/2026-09-15-vercel-production-readiness-design.md`

## Global Constraints

- Não inventar nem versionar valores de `R2_*`, `UPSTASH_*`, `VOLUNTEER_CPF_*` ou `CRON_SECRET`.
- `push` do Payload é permitido somente em desenvolvimento local; produção usa migrações versionadas.
- Dados de documento e foto pessoal continuam privados no R2 e acessíveis somente por URL assinada após autorização.
- Cada mudança deve ser acompanhada por teste que falhe antes da implementação.

---

### Task 1: Dispatcher HTTP das operações públicas

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/http.ts`
- Test: `apps/web/tests/int/volunteer-registration-http.int.spec.ts`

**Interfaces:**
- Consumes: `getPayload`, `checkPublicRateLimit` e as funções públicas do serviço de cadastro.
- Produces: `getPublicInvitationHttp`, `createUploadIntentHttp`, `confirmUploadHttp` e `submitRegistrationHttp`, cada uma recebendo `(request: Request, token: string)` e retornando `Promise<Response>`.

- [ ] **Step 1: Write the failing test**

Criar teste com `vi.mock` apenas para `getPayload`, o rate-limit e o serviço, verificando que `getPublicInvitationHttp(request, 'token-123')` extrai o IP/User-Agent, aplica o limite e devolve o JSON do serviço.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --workspace apps/web run test:int -- volunteer-registration-http.int.spec.ts`

Expected: FAIL porque `http.ts` ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Implementar um dispatcher que inicializa Payload, anexa a instância à requisição, calcula o IP como o endpoint atual, aplica os limites por convite/IP, lê JSON somente nas operações POST e converte `VolunteerRegistrationError` em `{ error }` com o status correspondente.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --workspace apps/web run test:int -- volunteer-registration-http.int.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/volunteer-registration/http.ts apps/web/tests/int/volunteer-registration-http.int.spec.ts
git commit -m "fix: centralize public volunteer http handlers"
```

### Task 2: Rotas explícitas do App Router

**Files:**
- Create: `apps/web/src/app/api/volunteer-invitations/[token]/public/route.ts`
- Create: `apps/web/src/app/api/volunteer-invitations/[token]/uploads/route.ts`
- Create: `apps/web/src/app/api/volunteer-invitations/[token]/uploads/confirm/route.ts`
- Create: `apps/web/src/app/api/volunteer-invitations/[token]/submit/route.ts`
- Test: `apps/web/tests/int/volunteer-registration-http.int.spec.ts`

**Interfaces:**
- Consumes: os quatro dispatchers da Task 1.
- Produces: handlers Next `GET` e `POST` com `params: Promise<{ token: string }>` nos caminhos públicos usados pelo frontend.

- [ ] **Step 1: Write the failing test**

Adicionar teste que importe o `GET` de `public/route.ts`, passe `params: Promise.resolve({ token: 'token-123' })` e confirme que o dispatcher é chamado com o token, retornando o status do serviço.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --workspace apps/web run test:int -- volunteer-registration-http.int.spec.ts`

Expected: FAIL porque a rota explícita ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Criar handlers finos que aguardam `params` e delegam ao dispatcher correspondente; não duplicar regra de negócio nem autenticação.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --workspace apps/web run test:int -- volunteer-registration-http.int.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/volunteer-invitations apps/web/tests/int/volunteer-registration-http.int.spec.ts
git commit -m "fix: expose volunteer invitation routes on next"
```

### Task 3: Migração e comando de produção

**Files:**
- Modify: `apps/web/src/payload.config.ts`
- Create: `apps/web/src/migrations/20260915_230000_production_schema_compatibility.ts`
- Modify: `apps/web/src/migrations/index.ts`
- Modify: `apps/web/package.json`
- Modify: `package.json`
- Modify: `vercel.json`
- Test: `apps/web/tests/int/volunteer-production-schema.int.spec.ts`

**Interfaces:**
- Consumes: configuração Payload e migrations do PostgreSQL.
- Produces: script `npm --workspace apps/web run migrate` e build Vercel que executa migração antes do build.

- [ ] **Step 1: Write the failing test**

Criar teste que leia a configuração do adapter e a migration registrada, afirmando que `migrationDir` aponta para `src/migrations`, o push de produção é falso e a migration contém `IF NOT EXISTS` para `posts.slug`, `posts.excerpt` e `transactions.visivel_no_site`, além das tabelas do cadastro ausentes no snapshot legado.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --workspace apps/web run test:int -- volunteer-production-schema.int.spec.ts`

Expected: FAIL porque a configuração ainda usa push incondicional e a migration de compatibilidade ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Configurar `migrationDir`, restringir `push` ao desenvolvimento, criar uma migration idempotente baseada no snapshot legado e registrar uma única vez no índice. Adicionar `migrate` ao workspace e `vercel-build` na raiz; apontar `vercel.json.buildCommand` para `npm run vercel-build`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --workspace apps/web run test:int -- volunteer-production-schema.int.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/payload.config.ts apps/web/src/migrations apps/web/package.json package.json vercel.json apps/web/tests/int/volunteer-production-schema.int.spec.ts
git commit -m "fix: migrate payload schema before vercel build"
```

### Task 4: Adaptador de armazenamento do Payload

**Files:**
- Modify: `apps/web/src/payload.config.ts`
- Modify: `apps/web/src/collections/Media.ts`
- Test: `apps/web/tests/int/volunteer-production-schema.int.spec.ts`

**Interfaces:**
- Consumes: `UPLOADTHING_TOKEN` existente no ambiente de produção.
- Produces: adaptador UploadThing para `media`, sem armazenamento local no Vercel; R2 privado não é alterado.

- [ ] **Step 1: Write the failing test**

Adicionar asserções de configuração que exigem `uploadthingStorage` habilitado quando `UPLOADTHING_TOKEN` existe e que a coleção `media` não registra o hook manual de upload Blob simultaneamente.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --workspace apps/web run test:int -- volunteer-production-schema.int.spec.ts`

Expected: FAIL porque `plugins` está vazio e `Media` ainda faz upload manual.

- [ ] **Step 3: Write minimal implementation**

Usar `uploadthingStorage({ collections: { media: true }, options: { token: process.env.UPLOADTHING_TOKEN }, enabled: Boolean(process.env.UPLOADTHING_TOKEN) })`, remover somente o hook manual que duplicaria o upload e preservar compatibilidade de leitura de URLs externas existentes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --workspace apps/web run test:int -- volunteer-production-schema.int.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/payload.config.ts apps/web/src/collections/Media.ts apps/web/tests/int/volunteer-production-schema.int.spec.ts
git commit -m "fix: configure payload media storage for vercel"
```

### Task 5: Verificação local, PR e deploy de validação

**Files:**
- No source changes expected.

- [ ] **Step 1: Run focused tests**

Run: `npm --workspace apps/web run test:int`

Expected: PASS for the existing and new integration suites; database-dependent suites may remain skipped when `DATABASE_URL` is absent.

- [ ] **Step 2: Run typecheck/build**

Run: `npm --workspace apps/web run build`

Expected: PASS without the Payload warning about `media` lacking a storage adapter.

- [ ] **Step 3: Inspect changes and push branch**

Run: `git diff main...HEAD`, `git status --short` and `git push -u origin feature/vercel-production-readiness`.

Expected: only production-readiness changes are present and the branch is published.

- [ ] **Step 4: Open PR**

Run: `gh pr create --base main --head feature/vercel-production-readiness --title "fix: preparar cadastro público para produção na Vercel" --body-file <description-file>`.

Expected: PR criado, sem merge automático.

- [ ] **Step 5: Deploy preview/production only after credentials exist**

Use Vercel CLI after the user supplies the nine missing values, run migrations through the configured build, then smoke-test `/`, `/voluntarios/cadastro/<token>` and `/api/volunteer-invitations/<token>/public`.

