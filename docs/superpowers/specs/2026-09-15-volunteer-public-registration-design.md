# Cadastro Público de Voluntários — Especificação de Arquitetura

**Status:** proposta aprovada para especificação; aguardando revisão do documento antes do plano de implementação  
**Data:** 2026-09-15  
**Branch:** `feature/volunteer-public-registration`

## Objetivo

Evoluir o cadastro interno de voluntários da Associação Viralatinhas de Sumaré para que um administrador possa gerar e compartilhar links públicos, permitindo que a pessoa preencha seus dados, envie uma foto pessoal e uma foto de documento, leia e aceite a versão vigente do termo de adesão e deixe um registro auditável para revisão posterior pela ONG.

## Escopo da primeira entrega

Incluído:

- geração administrativa de convites com token aleatório, validade e limite de uso;
- formulário público em rota dedicada, sem expor identificadores do voluntário na URL;
- coleta dos dados cadastrais necessários ao vínculo e dos campos operacionais já existentes;
- upload direto do navegador para objetos privados no Cloudflare R2 usando URLs pré-assinadas de curta duração;
- metadados dos anexos no banco, incluindo finalidade, tipo MIME, tamanho, checksum e chave privada do objeto;
- termo de adesão versionado, hash SHA-256 do conteúdo e aceite declaratório;
- captura de IP, User-Agent, timestamp UTC e hash do termo no aceite;
- status inicial `PENDING_REVIEW`, aprovação/recusa no painel administrativo e bloqueio do convite após submissão;
- consultas administrativas mascaradas, sem disponibilizar CPF ou anexos em endpoints públicos;
- eventos de auditoria para criação/uso do convite, submissão, acesso a anexos e alterações de status.

Fora da primeira entrega:

- disparo transacional de e-mail ou WhatsApp por provedor externo;
- exportação CEE/CGE, assinatura ICP-Brasil e worker assíncrono;
- criptografia de campo com KMS/Vault e recuperação de CPF para exportação;
- portal autenticado do próprio voluntário;
- OCR, validação biométrica ou análise automática de documentos.

O administrador terá um botão para gerar o link e copiá-lo/compartilhá-lo. A integração com um provedor de mensagens será uma etapa posterior, evitando acoplar o cadastro a custos ou credenciais externas.

## Decisões de infraestrutura

### Hospedagem

O Next.js e as rotas de aplicação continuarão na Vercel. As Functions devem permanecer curtas e transacionais: criar convite, iniciar upload, confirmar upload, submeter formulário e registrar auditoria. O arquivo binário não atravessará a Function.

### Banco

Usaremos PostgreSQL gerenciado pelo Neon, conectado pela integração do Marketplace da Vercel e acessado pelo adaptador PostgreSQL já usado pelo Payload. As credenciais serão apenas variáveis de ambiente. A integração de banco não será usada para armazenar binários.

### Arquivos

Usaremos um bucket Cloudflare R2 privado, separado da mídia pública existente. As chaves seguirão o padrão:

```text
volunteer-intake/{invitationId}/{submissionId}/personal-photo.{ext}
volunteer-intake/{invitationId}/{submissionId}/identity-document.{ext}
```

O navegador solicitará uma URL pré-assinada para uma finalidade específica; a API validará token, MIME permitido, tamanho máximo e nome lógico antes de assinar o `PUT`. Como o voluntário ainda não existe durante o upload, a chave temporária usará `invitationId` e `submissionId`; após a submissão, o registro do arquivo será associado ao voluntário criado, sem depender de uma URL pública ou de renomeação do objeto. A API fará `HEAD` no objeto e só aceitará a submissão quando os dois objetos esperados existirem e corresponderem aos metadados registrados.

Arquivos nunca serão gravados no bucket público nem terão URL pública persistida no banco. A visualização administrativa ocorrerá por rota autenticada que emite URL `GET` pré-assinada curta e registra o evento de acesso.

### Limite de upload

Cada arquivo terá limite inicial de 10 MB. Serão aceitos apenas `image/jpeg`, `image/png` e `application/pdf`; a foto pessoal aceitará JPEG/PNG e o documento aceitará JPEG/PNG/PDF. A validação será feita no servidor e no cliente, mas a validação do servidor será autoritativa. O checksum SHA-256 será calculado no navegador e conferido no servidor/R2 quando suportado pelo SDK.

## Modelo de dados

O Payload continuará sendo a camada de administração e persistência. Os nomes abaixo são nomes lógicos; a implementação deverá seguir os padrões de `CollectionConfig` existentes e gerar os tipos Payload.

### `volunteer-invitations`

- `tokenHash`: hash SHA-256 do token bruto; único e nunca exposto no painel;
- `createdBy`: relação com `users`;
- `expiresAt`: data UTC obrigatória;
- `maxUses`: inteiro, padrão 1;
- `usedCount`: inteiro, padrão 0;
- `status`: `ACTIVE`, `EXPIRED`, `EXHAUSTED`, `REVOKED`;
- `lastUsedAt`: data UTC opcional;
- `createdAt`, `updatedAt`.

O token bruto só existirá na resposta de criação, para cópia imediata pelo administrador. O banco guardará apenas o hash.

### `volunteers`

Manteremos os campos atuais compatíveis com o cadastro existente e acrescentaremos:

- `status`: `PENDING_REVIEW`, `ACTIVE`, `REJECTED`, `RESIGNED`, `SUSPENDED`;
- `birthDate`, `rg`, `rgIssuer`, `cpfMasked`, `cpfBlindIndex` e `cpfEncrypted` como campos sensíveis separados;
- telefone, e-mail e endereço estruturados;
- campos operacionais de área, função específica, data de ingresso e estimativa de horas/mês;
- `sourceInvitation`: relação opcional com o convite;
- `submittedAt`, `reviewedAt`, `reviewedBy`, `rejectionReason`.

Na primeira implementação, o serviço de domínio deverá encapsular a criação/consulta de CPF. Se a infraestrutura de KMS não estiver disponível no ambiente, a aplicação não deverá fingir que há proteção de campo: o fluxo será configurável para exigir uma chave de envelope dedicada e falhar fechado quando ela for necessária. O blind index será HMAC-SHA-256 com pepper separado.

### `volunteer-files`

- `volunteer`: relação opcional durante `PENDING` e obrigatória quando o arquivo estiver associado a uma submissão aceita;
- `invitation`: relação obrigatória com o convite que originou o upload;
- `submissionId`: identificador obrigatório da sessão de submissão;
- `purpose`: `PERSONAL_PHOTO` ou `IDENTITY_DOCUMENT`;
- `storageProvider`: `R2`;
- `objectKey`: chave privada única;
- `mimeType`, `sizeBytes`, `sha256`;
- `uploadStatus`: `PENDING`, `UPLOADED`, `REJECTED`, `DELETED`;
- `uploadedAt`, `createdAt`.

Haverá uma restrição lógica de no máximo um arquivo `UPLOADED` por finalidade na submissão vigente. Substituições gerarão novo registro e evento de auditoria; o objeto anterior será marcado para exclusão segura apenas quando não estiver mais referenciado.

### `membership-term-versions`

- `version`: identificador único, por exemplo `2026.1-CGE`;
- `content`: texto completo exibido no formulário;
- `contentHash`: SHA-256 do conteúdo canônico;
- `documentKey`: opcional, para PDF/DOCX privado da versão;
- `effectiveFrom`, `effectiveUntil`;
- `status`: `DRAFT`, `PUBLISHED`, `RETIRED`.

Uma única versão publicada poderá estar vigente para novos aceites. O conteúdo usado na tela será o mesmo conteúdo cujo hash será registrado.

### `volunteer-term-acceptances`

- `volunteer`: relação;
- `termVersion`: relação;
- `acceptedAt`: timestamp UTC;
- `ipAddress`, `userAgent`;
- `contentHashAtAcceptance`;
- `statement`: texto fixo `Li e concordo com os termos de adesão e tratamento de dados`;
- `signedDocument`: opcional, apenas se a organização decidir gerar um PDF de evidência posteriormente.

Não haverá checkbox de opt-out da entrega cadastral prevista pela obrigação legal informada na solicitação. A interface exibirá o termo completo e o botão declaratório; a redação jurídica final deve ser aprovada pela responsável legal da organização.

### `audit-events`

- `eventType`, `occurredAt` UTC;
- `actorType`: `ADMIN`, `PUBLIC_INVITATION`, `SYSTEM`;
- `actorId` opcional;
- `actorRole` opcional;
- `targetType`, `targetId`;
- `ipAddress`, `userAgent`;
- `metadata` JSON sem CPF em claro e sem conteúdo binário;
- `legalGround`, `targetNorm` e `targetEntity` quando aplicável.

O banco será a trilha operacional consultável. A integração com um bucket WORM ou log centralizado será preparada por uma interface, mas fica fora da primeira entrega; nenhum evento de exportação será declarado imutável sem uma implementação real de retenção.

## Fluxos

### Geração e uso do convite

1. Usuário `Admin` abre o painel de voluntários e solicita um convite.
2. A API gera pelo menos 32 bytes aleatórios, calcula `tokenHash`, salva a validade e retorna uma única URL HTTPS.
3. A rota pública valida o hash, a validade, o status e o limite de uso, mas não retorna dados internos.
4. Na submissão válida, o convite é consumido atomicamente e um voluntário `PENDING_REVIEW` é criado.
5. Repetições, tokens expirados ou convites revogados retornam uma página segura de convite inválido sem revelar a razão detalhada.

### Upload

1. O formulário coleta o tipo do arquivo e o tamanho/checksum local.
2. A API autentica o convite e emite URL pré-assinada `PUT` para uma chave não reutilizável.
3. O navegador envia o binário diretamente ao R2.
4. A API confirma o objeto via `HEAD`, grava os metadados e registra auditoria.
5. A submissão só é aceita se os anexos obrigatórios estiverem confirmados e associados ao mesmo convite/submissão.

### Aceite e revisão

1. A página carrega exclusivamente a versão publicada vigente.
2. O usuário precisa visualizar o conteúdo e marcar a declaração fixa.
3. O servidor recalcula/consulta o hash canônico e grava o aceite com IP, User-Agent e UTC.
4. O administrador revisa dados e anexos no painel, usando endpoints autenticados e DTOs mascarados.
5. Aprovação muda o voluntário para `ACTIVE`; rejeição exige motivo e mantém os anexos bloqueados para acesso público.

## Segurança e privacidade

- Tokens públicos serão aleatórios, armazenados somente como hash, com expiração e uso único por padrão.
- Rate limiting por IP e por hash de convite será aplicado às rotas públicas; uma segunda proteção anti-abuso poderá ser adicionada se o volume real exigir.
- CORS e CSRF serão restritos aos domínios oficiais e à origem de preview autorizada durante desenvolvimento.
- CPF não aparecerá em respostas públicas, logs, mensagens de erro ou metadados de arquivo.
- Arquivos de documento e foto pessoal serão privados no R2; nenhum componente utilizará a URL pública atual do Blob para esses dados.
- O painel exibirá `cpfMasked`; descriptografia de CPF será proibida fora de um serviço de domínio explicitamente autorizado.
- MIME, tamanho, extensão, checksum e assinatura da URL serão verificados; nomes originais não serão usados como chave de storage.
- Arquivos não serão executados nem renderizados por HTML; PDFs e imagens serão entregues com `Content-Disposition: attachment` quando apropriado.
- Retenção, exclusão e resposta a solicitações do titular deverão ser definidas pela organização antes da operação em produção.

## Interfaces de aplicação

Rotas públicas:

```text
GET  /voluntarios/cadastro/{token}
POST /api/volunteer-invitations/{token}/uploads
POST /api/volunteer-invitations/{token}/uploads/confirm
POST /api/volunteer-invitations/{token}/submit
```

Rotas administrativas:

```text
POST /api/volunteer-invitations
POST /api/volunteers/{id}/review
GET  /api/volunteers/{id}/files/{fileId}/download
```

As rotas poderão ser implementadas como handlers Next.js ou ações Payload conforme o padrão mais seguro encontrado no repositório. A API pública nunca usará `payload.create` diretamente com dados não validados; um serviço de domínio será responsável por validar convite, anexos, termo e transação.

## Erros e consistência

- Convite inválido/expirado: resposta genérica `404` ou página equivalente, sem diferenciar existência, expiração ou revogação.
- Upload recusado: `400` com campo e regra violada, sem persistir registro `UPLOADED`.
- Falha após upload e antes da submissão: arquivos ficarão `UPLOADED` porém órfãos logicamente; um job de limpeza posterior removerá registros pendentes após a janela de retenção.
- Falha na submissão: transação não criará voluntário nem consumirá definitivamente o convite; uploads confirmados poderão ser reutilizados apenas no mesmo token/submissão.
- Concorrência: consumo do convite e criação do voluntário usarão atualização condicional/transaction para impedir uso acima de `maxUses`.
- Falha do R2 ou Neon: retornar erro transitório genérico e registrar evento técnico sem dados pessoais.

## Testes e critérios de aceite

Testes unitários:

- hash e validação de token sem armazenar o valor bruto;
- regras de expiração, revogação e consumo atômico;
- whitelist de MIME, limites e geração de chaves R2;
- cálculo e persistência do hash do termo;
- mascaramento e proibição de CPF em DTO público;
- autorização por papel para revisar voluntários e baixar anexos.

Testes de integração:

- criar convite, abrir formulário e submeter com dois anexos confirmados;
- impedir submissão sem documento, foto, aceite ou termo publicado;
- rejeitar token reutilizado e upload de tipo/tamanho inválido;
- verificar registros de aceite e auditoria com IP, User-Agent e UTC;
- garantir que acesso não autenticado a qualquer objeto R2 falhe;
- garantir que o download administrativo gere URL temporária e evento de auditoria.

Teste end-to-end:

- administrador gera e copia convite;
- voluntário acessa a rota pública, envia os dois arquivos, aceita o termo e recebe confirmação;
- administrador encontra o cadastro pendente, revisa anexos e aprova/rejeita;
- páginas e respostas públicas não expõem CPF, RG ou URL de storage.

## Critérios de pronto

- Nenhum documento de voluntário é público por URL direta.
- O fluxo completo funciona em preview e produção na Vercel com variáveis separadas por ambiente.
- O cadastro pode ser submetido sem a Function receber o binário.
- Cada aceite contém a evidência mínima definida nesta especificação.
- O painel administrativo não exibe dados sensíveis a usuários sem autorização.
- Testes unitários, integração e E2E relevantes passam em CI.
- A branch é publicada e um PR é aberto com resumo, riscos, migração/configuração e evidências de teste.

## Referências de infraestrutura

- Vercel Marketplace/Storage: https://vercel.com/docs/marketplace-storage
- Vercel Blob privado e URLs temporárias: https://vercel.com/docs/vercel-blob/private-storage
- Limite de payload de Functions: https://vercel.com/docs/errors/function_payload_too_large
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Supabase Free como alternativa: https://supabase.com/pricing
