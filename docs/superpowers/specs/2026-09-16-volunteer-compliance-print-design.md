# Cadastro Público, Evidências e Impressão do Termo — Especificação

**Data:** 2026-09-16  
**Status:** proposta aprovada para detalhamento do plano  
**Escopo:** cadastro público de voluntários, aceite, anexos, cópia imprimível e extração regulatória.

## Objetivo

Permitir que a ONG envie um link público de uso controlado para o voluntário preencher seus dados, aceitar a versão vigente do termo e anexar foto pessoal e documento de identidade. Depois do envio, a equipe administrativa deve conseguir revisar o cadastro, baixar anexos por URLs temporárias, imprimir uma cópia completa do termo com o timbre da ONG e gerar uma extração CSV auditada para comunicação com órgãos regulatórios.

## Decisões arquiteturais

### Payload como CMS headless e backend

O Payload continuará sendo o CMS inicial para templates e versões de termos e também o backend proprietário que persiste os dados pessoais. Não haverá sincronização com CMS externo neste marco: isso evita duplicação de PII, webhooks sem necessidade e custo operacional adicional.

As coleções existentes permanecem as fontes de verdade:

- `document-templates`: conteúdo editorial de origem;
- `membership-term-versions`: snapshot publicado, versão, vigência e hash canônico;
- `volunteers`: cadastro pessoal e status de revisão;
- `volunteer-term-acceptances`: evidência do aceite;
- `volunteer-files`: metadados dos arquivos privados no R2;
- `audit-events`: eventos operacionais e de acesso sensível.

### Armazenamento

- PostgreSQL/Vercel: metadados, cadastro, aceite, auditoria e estado do convite.
- Cloudflare R2 privado: foto pessoal e documento de identidade.
- Upstash Redis: rate limit dos endpoints públicos.
- `public/logo.png`: timbre usado na página imprimível. A identidade visual não será carregada de URL externa.

Os arquivos não passam pelo body da Function: o backend emite URL pré-assinada, o navegador envia diretamente ao R2 e o backend confirma o objeto por tamanho, MIME e SHA-256 informado. A validação de magic bytes/antivírus fica registrada como evolução de segurança, não como bloqueio do primeiro marco.

## Fluxo público

1. Administrador autenticado solicita `POST /api/volunteer-invitations/generate` com validade e limite de uso.
2. O backend gera token aleatório, persiste somente seu SHA-256, registra `VOLUNTEER_INVITATION_CREATED` e retorna a URL pública.
3. O voluntário acessa `/voluntarios/cadastro/[token]`.
4. A página carrega somente a versão `PUBLISHED` atualmente vigente e exibe versão/hash.
5. O formulário coleta nome, CPF, nascimento, RG, órgão emissor, contato, endereço e dados operacionais.
6. O voluntário envia duas evidências obrigatórias:
   - `PERSONAL_PHOTO`;
   - `IDENTITY_DOCUMENT`.
7. O voluntário marca o checkbox com o valor literal `Li e concordo com os termos de adesão e tratamento de dados`.
8. O backend valida token, vigência, hash do termo, arquivos confirmados e CPF; grava CPF criptografado, blind index e máscara.
9. O backend grava o aceite com versão, hash, IP, User-Agent, UTC, declaração e relação ao voluntário; consome o convite de forma concorrente e registra `VOLUNTEER_SUBMITTED`.
10. A página informa que o cadastro está pendente de análise, sem expor dados sensíveis na URL ou na resposta pública.

O endpoint de geração será uma rota explícita do App Router. A rota customizada genérica do Payload não será usada para essa ação administrativa, pois a tentativa de subrota do CRUD retornou `404 Route not found` em produção.

## Fluxo administrativo

O administrador acessa o registro do voluntário no Payload e encontra:

- status `PENDING_REVIEW`, `ACTIVE`, `REJECTED` ou equivalente;
- dados cadastrais mascarados conforme o papel;
- histórico de termos aceitos em modo somente leitura;
- anexos listados por finalidade, com download via URL R2 temporária e evento de auditoria;
- ação de aprovar/rejeitar com motivo obrigatório na rejeição;
- ação “Imprimir termo preenchido”;
- ação “Exportar relatório regulatório”.

O `VOLUNTEER_MANAGER` não verá CPF descriptografado. A descriptografia/exportação ampla permanece restrita ao papel de compliance/jurídico já definido pelo sistema. Toda leitura de arquivo e toda exportação não anonimizada gerará evento de auditoria.

## Termo preenchido e impressão

Será criada uma página protegida de impressão, acessível apenas a usuário administrativo autorizado. Ela:

- valida a sessão do Payload no servidor;
- busca o voluntário e a aceitação pelo ID;
- usa o snapshot publicado do termo e o hash salvo no aceite;
- substitui exclusivamente placeholders permitidos, com escape de texto;
- imprime o CPF do voluntário mascarado por padrão; somente `COMPLIANCE_OFFICER` ou `LEGAL_DIRECTOR` poderá solicitar a forma completa, e esse acesso será auditado;
- usa `public/logo.png` no cabeçalho, nome/CNPJ/endereço da ONG e rodapé com versão/hash;
- inclui dados operacionais, declaração de aceite, data, IP/User-Agent e indicação de aceite eletrônico;
- aplica `@media print`, remove navegação/botões no papel e inicia a impressão pelo navegador.

O arquivo gerado será HTML imprimível, permitindo “Imprimir > Salvar como PDF” para cópia local. Não será apresentado como assinatura ICP-Brasil nem como PDF/A. A geração de PDF/A, assinatura digital e armazenamento de snapshot binário são fases posteriores.

Placeholders aceitos no primeiro marco:

```text
term.version
term.content_hash
volunteer.full_name
volunteer.rg
volunteer.rg_issuer
volunteer.cpf_formatted
volunteer.birth_date
volunteer.address_street
volunteer.address_neighborhood
volunteer.address_city
volunteer.address_state
volunteer.address_zipcode
volunteer.phone
volunteer.email
operational.joined_at
operational.activity_area
operational.specific_role
operational.avg_hours_per_month
acceptance.formatted_date
```

Tags desconhecidas serão rejeitadas na validação do template antes de publicação; não haverá interpolação arbitrária de propriedades.

## Exportação regulatória

O primeiro marco produzirá CSV em streaming/arquivo temporário controlado, contendo somente o layout operacional necessário:

- nome completo;
- CPF formatado, apenas para papel autorizado;
- área de atuação;
- função específica;
- data de ingresso;
- data de desligamento, quando houver;
- horas médias por mês;
- status.

O filtro anual considerará vínculos ativos no ano-base. A exportação será acionada por rota autenticada, terá confirmação do ano-base e gravará `LGPD_SENSITIVE_DATA_EXPORT` com ator, papel, fundamento, destino, ano e quantidade de registros. Relatórios públicos nunca conterão CPF completo nem anexos.

O modelo atual ainda concentra os dados operacionais em `volunteers`. A tabela/coleção histórica `volunteer_allocations` será um marco separado antes de prometer histórico anual com múltiplas funções; o primeiro CSV deixará essa limitação explícita.

## Privacidade e retenção

- O termo público não conterá CPF completo de terceiros; dados institucionais desnecessários serão mascarados.
- O CPF do voluntário será criptografado em repouso e pesquisado somente por blind index.
- URLs de R2 serão temporárias e não públicas.
- Tokens nunca serão armazenados em claro.
- Convites de teste inválidos permanecem revogados; novos convites só serão criados após a rota explícita estar `Ready` em produção.
- Política de retenção de anexos e descarte definitivo será documentada antes da operação em escala.

## Critérios de aceite

1. Um administrador consegue gerar um convite válido e recebe URL; o registro possui token hash não nulo e evento de auditoria.
2. Um navegador anônimo consegue abrir o link, preencher o formulário, anexar os dois arquivos e enviar o aceite literal.
3. O backend persiste voluntário, dois arquivos relacionados, aceite com hash e auditoria.
4. O voluntário não consegue reutilizar convite de uso único.
5. O administrador consegue abrir a página protegida, visualizar o termo totalmente preenchido e imprimir/salvar como PDF com logo.
6. A página impressa exibe versão e hash do snapshot aceito e não expõe CPF completo da presidente.
7. A exportação autenticada respeita ano-base, papéis e auditoria; consulta pública continua mascarando/omitindo CPF.
8. Testes automatizados cobrem rotas, autorização, aceite, arquivos, placeholders, impressão e exportação.

## Entregas e separação em PRs

### PR A — Correção do endpoint administrativo

Rota explícita App Router, autenticação Payload, testes HTTP/rota e validação em produção. Este PR desbloqueia a criação segura de convites.

### PR B — Termo imprimível com timbre

Renderizador allowlistado, bloqueio de edição/exclusão de termos publicados, página protegida de impressão, ação no admin, logo local e testes de conteúdo/permissão. O aceite preservará o conteúdo canônico ou snapshot necessário para reconstrução, não somente o hash.

### PR C — Extração regulatória

CSV auditado, filtros por ano/status, RBAC explícito e testes de anonimização. A modelagem histórica de `volunteer_allocations` será PR separado quando a ONG precisar de múltiplos vínculos por voluntário.
