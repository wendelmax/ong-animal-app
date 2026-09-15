# Cadastro Público de Voluntários Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar cadastro público de voluntários com convite expirável, anexos privados no Cloudflare R2, termos versionados, auditoria e revisão administrativa no Payload hospedado na Vercel.

**Architecture:** O Payload continuará sendo a camada de dados e administração, com endpoints customizados que recebem `PayloadRequest` e usam `req.user`/`req.payload`. O Next.js renderizará a página pública e o formulário; os arquivos irão diretamente do navegador ao R2 por URLs pré-assinadas, enquanto Neon hospeda o PostgreSQL e Upstash fornece rate limiting persistente para as rotas públicas.

**Tech Stack:** Next.js 16, React 19, Payload CMS 3, PostgreSQL/Neon, Cloudflare R2 via AWS SDK S3, Upstash Redis/Ratelimit, Vitest, Testing Library e Playwright.

**Spec:** `docs/superpowers/specs/2026-09-15-volunteer-public-registration-design.md`

## Global Constraints

- O Next.js e as rotas de aplicação continuarão na Vercel.
- Usaremos PostgreSQL gerenciado pelo Neon, conectado pela integração do Marketplace da Vercel.
- Usaremos um bucket Cloudflare R2 privado, separado da mídia pública existente.
- Cada arquivo terá limite inicial de 10 MB.
- Serão aceitos apenas `image/jpeg`, `image/png` e `application/pdf`.
- Tokens públicos serão aleatórios, armazenados somente como hash, com expiração e uso único por padrão.
- CPF não aparecerá em respostas públicas, logs, mensagens de erro ou metadados de arquivo.
- Arquivos de documento e foto pessoal serão privados no R2.
- Não haverá checkbox de opt-out da entrega cadastral prevista pela obrigação legal informada na solicitação.
- A branch é publicada e um PR é aberto com resumo, riscos, migração/configuração e evidências de teste.

---

## File Structure

O código novo ficará concentrado por responsabilidade, sem colocar regras de domínio diretamente nos componentes ou nos handlers:

- `apps/web/src/lib/volunteer-registration/`: tokens, validações, CPF, limites, rate limiting, contratos e serviço de domínio.
- `apps/web/src/lib/storage/r2.ts`: cliente R2 e operações pré-assinadas; nenhum endpoint conhece credenciais S3.
- `apps/web/src/collections/`: cinco coleções legais/operacionais e a extensão da coleção de voluntários.
- `apps/web/src/endpoints/volunteerRegistration.ts`: endpoints Payload públicos e administrativos.
- `apps/web/src/app/(frontend)/voluntarios/cadastro/[token]/`: página pública e formulário cliente.
- `apps/web/src/components/Admin/`: ações administrativas de convite e revisão.
- `apps/web/tests/int/`: testes Vitest compatíveis com o include existente.
- `apps/web/tests/e2e/`: fluxo Playwright com serviços externos substituídos por adapters de teste.
- `apps/web/.env.example`: variáveis obrigatórias e finalidade de cada segredo.

### Task 1: Criar contratos e regras puras de segurança

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/types.ts`
- Create: `apps/web/src/lib/volunteer-registration/tokens.ts`
- Create: `apps/web/src/lib/volunteer-registration/cpf.ts`
- Create: `apps/web/src/lib/volunteer-registration/validation.ts`
- Create: `apps/web/tests/int/volunteer-registration-domain.int.spec.ts`

**Interfaces:**
- Produces `createInvitationSecret(): { rawToken: string; tokenHash: string }`.
- Produces `evaluateInvitation(input: { status: InvitationStatus; expiresAt: string; usedCount: number; maxUses: number; now: Date }): { valid: boolean; publicStatus: 'ACTIVE' | 'INVALID' }`.
- Produces `normalizeCpf(value: string): string`, `maskCpf(value: string): string` and `createCpfBlindIndex(value: string, pepper: string): string`.
- Produces `validateVolunteerFile(input: { purpose: FilePurpose; mimeType: string; sizeBytes: number; sha256: string }): ValidationResult`.
- Consumes only Node `crypto` and constants; não acessa Payload, R2 ou banco.

- [ ] **Step 1: Escrever testes falhando para token, CPF e arquivos**

```ts
it('gera segredo de convite não previsível e guarda somente o hash', () => {
  const result = createInvitationSecret()
  expect(result.rawToken).toHaveLength(64)
  expect(result.tokenHash).toHaveLength(64)
  expect(result.tokenHash).not.toBe(result.rawToken)
})

it('mascara e cria blind index determinístico sem retornar CPF', () => {
  expect(maskCpf('12345678909')).toBe('***.456.789-**')
  expect(createCpfBlindIndex('123.456.789-09', 'pepper')).toHaveLength(64)
})

it('aceita foto JPEG até 10 MB e rejeita executável ou excesso', () => {
  expect(validateVolunteerFile({ purpose: 'PERSONAL_PHOTO', mimeType: 'image/jpeg', sizeBytes: 10_000_000, sha256: 'a'.repeat(64) }).valid).toBe(true)
  expect(validateVolunteerFile({ purpose: 'IDENTITY_DOCUMENT', mimeType: 'application/x-msdownload', sizeBytes: 100, sha256: 'a'.repeat(64) }).valid).toBe(false)
  expect(validateVolunteerFile({ purpose: 'PERSONAL_PHOTO', mimeType: 'image/png', sizeBytes: 10_000_001, sha256: 'a'.repeat(64) }).valid).toBe(false)
})
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-domain.int.spec.ts`

Expected: FAIL porque os módulos e funções ainda não existem.

- [ ] **Step 3: Implementar o mínimo necessário**

Usar `randomBytes(32)` para o token, `createHash('sha256')` para o hash, `createHmac('sha256', pepper)` para o blind index e uma normalização que remova tudo que não seja dígito do CPF. A validação deve retornar erros estáveis (`INVALID_MIME`, `FILE_TOO_LARGE`, `INVALID_CHECKSUM`, `WRONG_PURPOSE`) para que a API possa mapear cada erro sem vazar dados.

- [ ] **Step 4: Rodar os testes da tarefa**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-domain.int.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commitar**

```bash
git add apps/web/src/lib/volunteer-registration apps/web/tests/int/volunteer-registration-domain.int.spec.ts
git commit -m "feat: add volunteer registration security primitives"
```

### Task 2: Modelar coleções Payload, papéis e acesso mascarado

**Files:**
- Create: `apps/web/src/collections/VolunteerInvitations.ts`
- Create: `apps/web/src/collections/VolunteerFiles.ts`
- Create: `apps/web/src/collections/MembershipTermVersions.ts`
- Create: `apps/web/src/collections/VolunteerTermAcceptances.ts`
- Create: `apps/web/src/collections/AuditEvents.ts`
- Create: `apps/web/src/lib/volunteer-registration/access.ts`
- Modify: `apps/web/src/collections/Volunteers.ts`
- Modify: `apps/web/src/collections/Users.ts`
- Modify: `apps/web/src/payload.config.ts`
- Test: `apps/web/tests/int/volunteer-collection-access.int.spec.ts`

**Interfaces:**
- Produces collection slugs `volunteer-invitations`, `volunteer-files`, `membership-term-versions`, `volunteer-term-acceptances` and `audit-events`.
- Produces `canManageVolunteerInvitations(user)`, `canReviewVolunteer(user)`, `canReadVolunteerContact(user)` and `canDownloadVolunteerFile(user)`.
- Consumes the existing `Admin` role and preserves existing non-volunteer roles.

- [ ] **Step 1: Escrever testes de acesso e serialização**

```ts
it('permite convite e revisão para Admin e Volunteer Manager', () => {
  expect(canManageVolunteerInvitations({ role: 'Admin' })).toBe(true)
  expect(canManageVolunteerInvitations({ role: 'VOLUNTEER_MANAGER' })).toBe(true)
  expect(canManageVolunteerInvitations({ role: 'Voluntário' })).toBe(false)
})

it('restringe download de documento a compliance, jurídico e Admin', () => {
  expect(canDownloadVolunteerFile({ role: 'Admin' })).toBe(true)
  expect(canDownloadVolunteerFile({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
  expect(canDownloadVolunteerFile({ role: 'VOLUNTEER_MANAGER' })).toBe(false)
})
```

- [ ] **Step 2: Rodar a tarefa antes da implementação**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-collection-access.int.spec.ts`

Expected: FAIL porque os helpers e coleções novas ainda não existem.

- [ ] **Step 3: Criar as cinco coleções e registrar no config**

Definir os campos da especificação com `access` fechado por padrão. `VolunteerInvitations.tokenHash` terá `unique: true` e `admin.read: false`; `VolunteerFiles.objectKey` e `VolunteerFiles.sha256` serão somente leitura no admin; `MembershipTermVersions.content` será `textarea` para que o hash seja calculado sobre texto canônico estável; `VolunteerTermAcceptances` e `AuditEvents` não poderão ser editados por usuários administrativos comuns.

- [ ] **Step 4: Estender `Volunteers` e `Users` sem quebrar dados atuais**

Manter `nome`, `whatsapp`, `isLT`, `capacidadeLT`, `endereco`, `cidade`, `funcao`, `disponibilidade` e `ativo`. Acrescentar `status`, `dataNascimento`, `rg`, `orgaoEmissor`, `cpfEncrypted`, `cpfBlindIndex`, `cpfMasked`, `email`, endereço estruturado, `areaAtuacao`, `funcaoEspecifica`, `dataIngresso`, `horasMediasMes`, `sourceInvitation`, `submittedAt`, `reviewedAt`, `reviewedBy` e `rejectionReason`. Adicionar papéis `VOLUNTEER_MANAGER`, `COMPLIANCE_OFFICER` e `LEGAL_DIRECTOR`, mantendo `Admin` com acesso total.

- [ ] **Step 5: Rodar testes e validar tipos**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-collection-access.int.spec.ts`  
Run: `npm --workspace apps/web exec tsc -- --noEmit`

Expected: PASS nos testes e zero erros TypeScript.

- [ ] **Step 6: Commitar**

```bash
git add apps/web/src/collections apps/web/src/lib/volunteer-registration/access.ts apps/web/src/payload.config.ts apps/web/tests/int/volunteer-collection-access.int.spec.ts
git commit -m "feat: add volunteer registration collections and roles"
```

### Task 3: Configurar R2 privado, URLs pré-assinadas e rate limiting

**Files:**
- Modify: `apps/web/package.json`
- Modify: `package-lock.json`
- Create: `apps/web/src/lib/storage/r2.ts`
- Create: `apps/web/src/lib/volunteer-registration/rate-limit.ts`
- Create: `apps/web/tests/int/r2-storage.int.spec.ts`
- Create: `apps/web/.env.example`

**Interfaces:**
- Produces `createPrivateUploadUrl(input: { objectKey: string; contentType: AllowedMime; maxSizeBytes: number }): Promise<{ url: string; expiresAt: string }>`.
- Produces `headPrivateObject(objectKey: string): Promise<{ exists: boolean; sizeBytes?: number; contentType?: string; etag?: string }>`.
- Produces `createPrivateDownloadUrl(objectKey: string): Promise<{ url: string; expiresAt: string }>`.
- Produces `checkPublicRateLimit(input: { key: string; limit: number; windowSeconds: number }): Promise<{ success: boolean; remaining: number }>`.

- [ ] **Step 1: Adicionar dependências e escrever testes com adapters falsos**

Instalar `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@upstash/redis` e `@upstash/ratelimit`. Os testes devem injetar `R2StoragePort` e `RateLimitPort` falsos, verificando que uma URL é emitida com o método `PUT`, content type permitido, expiração máxima de 15 minutos e que a chave/credenciais não aparecem na resposta da aplicação.

- [ ] **Step 2: Rodar os testes antes da implementação**

Run: `npm --workspace apps/web run test:int -- tests/int/r2-storage.int.spec.ts`

Expected: FAIL porque os adapters ainda não existem.

- [ ] **Step 3: Implementar cliente R2 privado**

Configurar `S3Client` com `R2_ACCOUNT_ID`, endpoint `https://{accountId}.r2.cloudflarestorage.com`, região `auto` e credenciais somente no servidor. `PutObjectCommand` será assinado por `getSignedUrl`; `HeadObjectCommand` confirmará tamanho e MIME; `GetObjectCommand` será assinado por no máximo cinco minutos. O objeto sempre usará bucket privado e chave gerada pelo serviço, nunca nome enviado pelo navegador.

- [ ] **Step 4: Implementar rate limiting persistente**

Criar cliente Upstash com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. Aplicar janelas separadas para `invite:{tokenHash}` e `ip:{normalizedIp}`. Em produção, ausência dessas variáveis deve retornar erro de configuração e bloquear as rotas públicas; em testes e desenvolvimento, o adapter falso será usado explicitamente.

- [ ] **Step 5: Documentar variáveis sem segredos reais**

Incluir no `.env.example`: `DATABASE_URL`, `PAYLOAD_SECRET`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `VOLUNTEER_CPF_ENCRYPTION_KEY`, `VOLUNTEER_CPF_HMAC_PEPPER`, `NEXT_PUBLIC_SERVER_URL` e `CRON_SECRET`, com comentários indicando quais entram somente em Vercel Production/Preview.

- [ ] **Step 6: Rodar testes e commit**

Run: `npm --workspace apps/web run test:int -- tests/int/r2-storage.int.spec.ts`  
Run: `npm --workspace apps/web exec tsc -- --noEmit`

Expected: PASS e zero erros TypeScript.

```bash
git add apps/web/package.json package-lock.json apps/web/src/lib/storage/r2.ts apps/web/src/lib/volunteer-registration/rate-limit.ts apps/web/tests/int/r2-storage.int.spec.ts apps/web/.env.example
git commit -m "feat: add private R2 storage and public rate limiting"
```

### Task 4: Implementar serviço de domínio e endpoints Payload

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/service.ts`
- Create: `apps/web/src/endpoints/volunteerRegistration.ts`
- Modify: `apps/web/src/payload.config.ts`
- Create: `apps/web/tests/int/volunteer-registration-api.int.spec.ts`

**Interfaces:**
- Produces `createInvitation(ctx: AdminContext, input: { expiresAt: string; maxUses: number }): Promise<{ url: string; expiresAt: string }>`.
- Produces `getPublicInvitation(ctx: PublicContext, rawToken: string): Promise<PublicInvitationView>`.
- Produces `createUploadIntent(ctx: PublicContext, rawToken: string, input: UploadIntentInput): Promise<UploadIntentView>`.
- Produces `confirmUpload(ctx: PublicContext, rawToken: string, input: ConfirmUploadInput): Promise<VolunteerFileView>`.
- Produces `submitRegistration(ctx: PublicContext, rawToken: string, input: VolunteerRegistrationInput): Promise<{ volunteerId: string; status: 'PENDING_REVIEW' }>`.
- Produces `reviewVolunteer(ctx: AdminContext, volunteerId: string, input: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string }): Promise<VolunteerReviewView>`.
- Produces `createFileDownload(ctx: AdminContext, volunteerId: string, fileId: string): Promise<{ url: string; expiresAt: string }>`.

- [ ] **Step 1: Escrever testes falhando para os cinco fluxos**

Cobrir: convite retorna somente token bruto dentro da URL; convite inválido retorna `404`; upload exige MIME/tamanho válidos; confirmação exige `HEAD` compatível; submissão exige foto, documento, termo e declaração exata; consumo concorrente só permite uma submissão; revisão rejeitada exige motivo; download sem papel autorizado retorna `403` e não chama R2.

- [ ] **Step 2: Rodar a suíte de API para confirmar a falha**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-api.int.spec.ts`

Expected: FAIL antes de existir o serviço.

- [ ] **Step 3: Implementar criação/uso de convite e rate limit**

Usar `tokenHash` nas consultas, `evaluateInvitation` para respostas genéricas, e atualização condicional baseada em `status`, `usedCount < maxUses` e `expiresAt > now`. O serviço deve gerar `submissionId` no primeiro upload e nunca incluir CPF, RG ou chaves R2 em resposta pública.

- [ ] **Step 4: Implementar upload e confirmação**

Validar o token, finalidade, MIME, tamanho e checksum antes de assinar. Salvar `PENDING` antes do `PUT`; depois do `HEAD` compatível, atualizar para `UPLOADED`. Registrar `VOLUNTEER_UPLOAD_INTENT` e `VOLUNTEER_UPLOAD_CONFIRMED` sem conteúdo binário.

- [ ] **Step 5: Implementar submissão transacional, aceite e auditoria**

Carregar a versão `PUBLISHED` vigente, calcular o hash do texto canônico, comparar com o hash persistido e aceitar apenas a declaração `Li e concordo com os termos de adesão e tratamento de dados`. Dentro da transação criar o voluntário `PENDING_REVIEW`, vincular os arquivos, criar `volunteer-term-acceptances`, incrementar/consumir o convite e criar `VOLUNTEER_SUBMITTED`. Capturar IP pelo primeiro valor confiável de `x-forwarded-for` apenas quando a infraestrutura estiver configurada para confiar no proxy; sempre capturar User-Agent e `new Date().toISOString()`.

- [ ] **Step 6: Implementar revisão e download administrativo**

`reviewVolunteer` só aceita papéis de revisão; `APPROVE` muda para `ACTIVE`; `REJECT` exige motivo e muda para `REJECTED`. `createFileDownload` exige papel de download, cria URL GET por cinco minutos com `ResponseContentDisposition: attachment` no comando assinado e registra `LGPD_SENSITIVE_FILE_ACCESS`.

- [ ] **Step 7: Registrar endpoints customizados**

Adicionar em `payload.config.ts` o array importado de `volunteerRegistrationEndpoints`, usando as rotas:

```text
POST /api/volunteer-invitations
GET  /api/volunteer-invitations/:token/public
POST /api/volunteer-invitations/:token/uploads
POST /api/volunteer-invitations/:token/uploads/confirm
POST /api/volunteer-invitations/:token/submit
POST /api/volunteers/:id/review
GET  /api/volunteers/:id/files/:fileId/download
```

Cada handler deve ler `await req.json()` quando necessário, usar `req.payload`, respeitar `req.user` e retornar respostas JSON com status explícito. Os endpoints públicos devem aplicar CORS configurado e rate limiting antes de acessar o banco.

- [ ] **Step 8: Rodar a suíte e commit**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-api.int.spec.ts`  
Run: `npm --workspace apps/web exec tsc -- --noEmit`

Expected: PASS e zero erros TypeScript.

```bash
git add apps/web/src/lib/volunteer-registration/service.ts apps/web/src/endpoints/volunteerRegistration.ts apps/web/src/payload.config.ts apps/web/tests/int/volunteer-registration-api.int.spec.ts
git commit -m "feat: add volunteer registration API flows"
```

### Task 5: Construir página pública e formulário de submissão

**Files:**
- Create: `apps/web/src/app/(frontend)/voluntarios/cadastro/[token]/page.tsx`
- Create: `apps/web/src/components/VolunteerRegistrationForm.tsx`
- Create: `apps/web/src/components/VolunteerFileUpload.tsx`
- Create: `apps/web/src/app/(frontend)/voluntarios/cadastro/[token]/invalid/page.tsx`
- Create: `apps/web/tests/int/volunteer-registration-form.int.spec.ts`

**Interfaces:**
- Consumes `GET /api/volunteer-invitations/:token/public`, the upload intent/confirm endpoints and `POST /submit`.
- Produces a form that sends only JSON metadata to Vercel Functions and binary data directly to the returned R2 URL.

- [ ] **Step 1: Escrever testes falhando para renderização e validação**

Testar termo completo, declaração exata, campos obrigatórios, preview local dos dois arquivos, mensagens de erro, ausência de CPF/RG no HTML público e confirmação após submissão.

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-form.int.spec.ts`

Expected: FAIL porque os componentes ainda não existem.

- [ ] **Step 3: Implementar página server-side sem cache**

Buscar somente `PublicInvitationView`, marcar `dynamic = 'force-dynamic'` e usar `notFound()`/página inválida quando a API retornar 404. Exibir nome da organização, validade do convite, termo completo e indicação clara de que os anexos serão usados para análise interna.

- [ ] **Step 4: Implementar upload cliente direto para R2**

Calcular SHA-256 com `crypto.subtle.digest`, validar tamanho/MIME antes da API, pedir uma URL por finalidade, fazer `fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })`, e confirmar pelo endpoint. Nunca enviar `FormData` com o binário à Function.

- [ ] **Step 5: Implementar submissão e estados de erro**

Enviar dados cadastrais, `submissionId`, ids dos arquivos, id da versão do termo e a declaração fixa em JSON. Desabilitar o botão durante a operação, preservar uploads confirmados em erro transitório e mostrar apenas mensagens de negócio sem token, CPF, chave de storage ou motivo interno de convite inválido.

- [ ] **Step 6: Rodar teste, lint e commit**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-registration-form.int.spec.ts`  
Run: `npm --workspace apps/web run lint`

Expected: PASS e lint sem novos erros.

```bash
git add apps/web/src/app apps/web/src/components/VolunteerRegistrationForm.tsx apps/web/src/components/VolunteerFileUpload.tsx apps/web/tests/int/volunteer-registration-form.int.spec.ts
git commit -m "feat: add public volunteer registration form"
```

### Task 6: Adicionar ações administrativas de convite e revisão

**Files:**
- Create: `apps/web/src/components/Admin/VolunteerInvitationActions.tsx`
- Create: `apps/web/src/components/Admin/VolunteerReviewActions.tsx`
- Modify: `apps/web/src/collections/VolunteerInvitations.ts`
- Modify: `apps/web/src/collections/Volunteers.ts`
- Modify: `apps/web/src/app/(payload)/admin/importMap.js`
- Create: `apps/web/tests/int/volunteer-admin-actions.int.spec.ts`

**Interfaces:**
- Consumes the admin endpoints from Task 4 and Payload admin `req.user` permissions.
- Produces button “Gerar link de cadastro”, campo de validade, cópia/compartilhamento da URL, lista de convites e ações “Aprovar”/“Rejeitar”.

- [ ] **Step 1: Escrever testes de ações autorizadas**

Verificar que `Admin`/`VOLUNTEER_MANAGER` conseguem gerar convite, que usuário `Voluntário` não consegue, que rejeição sem motivo é bloqueada e que o componente não renderiza CPF em claro nem URLs R2.

- [ ] **Step 2: Rodar os testes antes da implementação**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-admin-actions.int.spec.ts`

Expected: FAIL antes dos componentes e callbacks existirem.

- [ ] **Step 3: Implementar geração e cópia de link**

Usar formulário de validade padrão de sete dias, permitir ajuste entre uma hora e 30 dias, chamar o endpoint autenticado, exibir o link apenas após resposta bem-sucedida e usar `navigator.clipboard.writeText` com fallback de compartilhamento quando disponível. O token não será persistido no estado além da tela necessária para cópia.

- [ ] **Step 4: Implementar revisão e download controlado**

Exibir apenas dados permitidos pelo papel. Managers verão contato, área, função e CPF mascarado; documentos e fotos só terão botão para `Admin`, `COMPLIANCE_OFFICER` e `LEGAL_DIRECTOR`. Ações de revisão devem exigir motivo para rejeição e atualizar a lista sem expor detalhes de auditoria ao voluntário.

- [ ] **Step 5: Registrar componentes no import map e validar admin**

Adicionar os paths dos componentes ao import map e aos slots da coleção. Testar abertura no painel, autenticação Payload e respostas 403/200 sem depender de acesso direto ao banco.

- [ ] **Step 6: Rodar suíte, build e commit**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-admin-actions.int.spec.ts`  
Run: `npm --workspace apps/web run build`

Expected: PASS e build concluído.

```bash
git add apps/web/src/components/Admin apps/web/src/collections/VolunteerInvitations.ts apps/web/src/collections/Volunteers.ts apps/web/src/app/'(payload)'/admin/importMap.js apps/web/tests/int/volunteer-admin-actions.int.spec.ts
git commit -m "feat: add volunteer invitation and review actions"
```

### Task 7: Limpeza de órfãos, migração, E2E e documentação de deploy

**Files:**
- Create: `apps/web/src/lib/volunteer-registration/cleanup.ts`
- Create: `apps/web/src/app/api/internal/volunteer-upload-cleanup/route.ts`
- Modify: `vercel.json`
- Create: `apps/web/tests/int/volunteer-cleanup.int.spec.ts`
- Create: `apps/web/tests/e2e/volunteer-registration.spec.ts`
- Modify: `apps/web/playwright.config.ts`
- Create: `docs/superpowers/deploy/2026-09-15-volunteer-registration-vercel.md`

**Interfaces:**
- Produces `cleanupOrphanedVolunteerFiles(now: Date, retentionHours: number): Promise<{ deleted: number; failed: number }>`.
- Produces cron route protegida por `Authorization: Bearer ${CRON_SECRET}` que só chama a limpeza e retorna contagens técnicas.

- [ ] **Step 1: Escrever teste de limpeza e rota protegida**

Testar que somente arquivos `UPLOADED` sem voluntário associado e mais antigos que 24 horas são removidos, que arquivos vinculados nunca são removidos, que erro de um objeto não interrompe os demais e que a rota sem `CRON_SECRET` retorna 401.

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm --workspace apps/web run test:int -- tests/int/volunteer-cleanup.int.spec.ts`

Expected: FAIL até existirem cleanup e route handler.

- [ ] **Step 3: Implementar limpeza e cron**

Consultar somente registros `VolunteerFiles` `UPLOADED` sem voluntário e `createdAt` anterior a 24 horas, chamar `DeleteObject` no R2, marcar `DELETED` e registrar contagem agregada. Configurar no `vercel.json` uma execução diária; a rota não retornará nomes de arquivo, chaves, CPF ou conteúdo de erro.

- [ ] **Step 4: Criar E2E com adapters controlados**

O teste Playwright deve navegar por `/voluntarios/cadastro/{token}`, preencher dados, interceptar endpoints R2 pré-assinados para simular PUT/HEAD, marcar o aceite e validar confirmação. Um segundo caso deve confirmar que convite reutilizado, ausência de aceite e documento inválido são rejeitados.

- [ ] **Step 5: Documentar Vercel, Neon, R2 e secrets**

Registrar criação do projeto Vercel, integração Neon, bucket R2 privado, CORS do bucket, variáveis por ambiente, configuração do domínio oficial, `CRON_SECRET`, rotação de credenciais e a exigência de não usar o bucket público atual para documentos. Incluir aviso de que o plano Hobby da Vercel tem restrição de uso não comercial e que a organização deve escolher um plano compatível antes da produção.

- [ ] **Step 6: Rodar a verificação completa**

Run: `npm --workspace apps/web run test:int`  
Run: `npm --workspace apps/web run test:e2e`  
Run: `npm --workspace apps/web run lint`  
Run: `npm --workspace apps/web run build`  
Run: `git diff --check`

Expected: todos os testes, lint, build e verificação de whitespace passam; registrar as saídas no PR.

- [ ] **Step 7: Commitar, publicar branch e abrir PR**

```bash
git add apps/web/src/lib/volunteer-registration/cleanup.ts apps/web/src/app/api/internal/volunteer-upload-cleanup/route.ts vercel.json apps/web/tests/int/volunteer-cleanup.int.spec.ts apps/web/tests/e2e/volunteer-registration.spec.ts apps/web/playwright.config.ts docs/superpowers/deploy/2026-09-15-volunteer-registration-vercel.md
git commit -m "chore: add volunteer registration cleanup and deployment docs"
git push -u origin feature/volunteer-public-registration
gh pr create --base main --head feature/volunteer-public-registration --title "feat: cadastro público de voluntários" --body-file docs/superpowers/deploy/2026-09-15-volunteer-registration-vercel.md
```

O corpo final do PR deverá incluir resumo funcional, modelo de dados, variáveis novas, instruções de storage, riscos de privacidade, evidência de cada comando de validação e a observação de que o termo jurídico precisa de aprovação da responsável legal.

## Self-Review Checklist

- [ ] A criação de convite, expiração, uso único e rate limit está coberta nas Tasks 1, 3 e 4.
- [ ] Upload privado, MIME/tamanho/checksum, confirmação HEAD e download temporário estão cobertos nas Tasks 3, 4 e 5.
- [ ] Termo completo, hash canônico, aceite declaratório, IP, User-Agent e UTC estão cobertos nas Tasks 2 e 4.
- [ ] CPF criptografado/blind index/mascarado e RBAC estão cobertos nas Tasks 1, 2, 4 e 6.
- [ ] Auditoria operacional está coberta na Task 4; WORM permanece explicitamente fora do primeiro escopo.
- [ ] Limpeza de objetos órfãos e configuração Vercel estão cobertas na Task 7.
- [ ] Nenhuma tarefa usa instruções incompletas, referências vagas ou erro genérico sem regra concreta.
- [ ] As assinaturas produzidas nas Tasks 1, 3, 4 e 7 são consistentes entre si.
