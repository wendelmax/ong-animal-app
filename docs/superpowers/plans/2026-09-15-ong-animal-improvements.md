# Plano de Implementação: Correções e Melhorias no Viralatinhas Sumaré

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as correções críticas de rotas e adoção (Etapa 1), estabilidade e permissões do CMS com suporte a storage local e Docker Postgres (Etapa 2), e melhorias de UX/UI com menu mobile, filtros na vitrine e PIX copia-e-cola (Etapa 3).

**Architecture:** Next.js 16 (App Router) + Payload CMS 3.0 com PostgreSQL. O frontend consome coleções e globals do Payload via Local API no servidor, expondo rotas públicas funcionais para adoção, notícias, animais e transparência com controle de acesso refinado e componentes responsivos com Tailwind CSS v4.

**Tech Stack:** Next.js 16, React 19, Payload CMS 3.0, PostgreSQL (@payloadcms/db-postgres), Tailwind CSS v4, Lucide Icons, Vercel Blob.

---

## Estrutura de Arquivos e Responsabilidades

### Arquivos Criados:
- `apps/web/src/app/(frontend)/adotar/page.tsx`: Página principal do formulário de adoção acessível via query param `?pet=slug`.
- `apps/web/src/app/(frontend)/noticias/page.tsx`: Listagem pública de notícias e novidades da ONG.
- `apps/web/src/app/(frontend)/noticias/[slug]/page.tsx`: Página de detalhe da notícia.
- `apps/web/src/components/HeaderNav.tsx`: Componente client-side com controle de menu mobile hamburger e links ativos.
- `apps/web/src/components/PixCopyButton.tsx`: Botão interativo para copiar chave PIX com feedback visual.
- `apps/web/src/components/ShareButton.tsx`: Botão com Web Share API e fallback para cópia de link na página do animal.

### Arquivos Modificados:
- `apps/web/src/app/(frontend)/adotar/[slug]/page.tsx`: Redireciona ou serve como alias para `/adotar?pet=${slug}`.
- `apps/web/src/actions/adoption.ts`: Tratamento de erros robusto e validação no cadastro de interesse.
- `apps/web/src/collections/Posts.ts`: Adição do campo `slug` e permissão de leitura pública para posts publicados.
- `apps/web/src/collections/Animals.ts`: Permissão de leitura pública para animais.
- `apps/web/src/collections/Pages.ts`: Permissão de leitura pública para páginas publicadas.
- `apps/web/src/collections/AnimalEvents.ts`: Permissão de leitura pública para eventos com `publico === true`.
- `apps/web/src/collections/Transactions.ts`: Adição de flag `visivelNoSite` para proteger dados financeiros confidenciais.
- `apps/web/src/collections/Users.ts`: Permitir que voluntários/veterinários leiam e atualizem seu próprio perfil.
- `apps/web/src/collections/Media.ts`: Remoção de URL de bucket hardcoded e suporte a storage local em dev.
- `apps/web/src/hooks/blobUpload.ts`: Fallback dinâmico para storage e tratamento de token ausente.
- `apps/web/src/components/Header.tsx`: Suporte a menu mobile e consumo de dados do Global do CMS com fallback.
- `apps/web/src/app/(frontend)/animais/page.tsx`: Filtros funcionais por espécie (Cachorro / Gato / Todos).
- `apps/web/src/app/(frontend)/transparencia/page.tsx`: Filtro por `visivelNoSite` e botão de PIX copia-e-cola.
- `apps/web/.env.example`: Correção de MongoDB para PostgreSQL e variáveis necessárias.
- `apps/web/docker-compose.yml`: Atualização para serviço PostgreSQL.
- `apps/web/package.json`: Ajuste de nome e metadata.
- Remoção do arquivo obsoleto `apps/web/src/lib/storage.ts`.

---

## Tarefas de Execução

### Etapa 1: Correção Imediata de Bugs e Fluxo de Adoção

#### Tarefa 1.1: Corrigir Rota e Formulário de Adoção (`/adotar`)
**Arquivos:**
- Criar: `apps/web/src/app/(frontend)/adotar/page.tsx`
- Modificar: `apps/web/src/app/(frontend)/adotar/[slug]/page.tsx`
- Modificar: `apps/web/src/actions/adoption.ts`

- [ ] **Passo 1.1.1: Criar a página `adotar/page.tsx` com suporte a `useSearchParams` encapsulado em `Suspense`**
Implementar o formulário que recebe o parâmetro `?pet=slug`, busca opcionalmente o nome do animal para exibir ("Formulário de Interesse para [Nome]") e submete o formulário com segurança.

- [ ] **Passo 1.1.2: Ajustar `adotar/[slug]/page.tsx` para compatibilidade**
Fazer a rota dinâmica com slug passar o parâmetro diretamente ou renderizar o formulário associado àquele slug sem depender de query param.

- [ ] **Passo 1.1.3: Blindar a Server Action `submitAdoptionRequest` em `actions/adoption.ts`**
Envolver toda a lógica em bloco `try / catch`, validando se `animalSlug` existe, verificando se o animal está disponível no banco e retornando mensagens de erro amigáveis em vez de disparar `throw new Error` não capturado.

- [ ] **Passo 1.1.4: Verificar o fluxo de adoção**
Testar a navegação a partir de `/animais/algum-pet` clicando em "Iniciar Adoção", verificando se a página `/adotar?pet=...` abre sem erro 404 e se a submissão responde com sucesso ou erro amigável.

---

#### Tarefa 1.2: Implementar Módulo de Notícias (`/noticias`) e Slug em Posts
**Arquivos:**
- Modificar: `apps/web/src/collections/Posts.ts`
- Criar: `apps/web/src/app/(frontend)/noticias/page.tsx`
- Criar: `apps/web/src/app/(frontend)/noticias/[slug]/page.tsx`
- Modificar: `apps/web/src/app/(frontend)/page.tsx`

- [ ] **Passo 1.2.1: Adicionar campo `slug` na coleção `Posts`**
Adicionar campo `slug` (text, unique, index) com geração amigável ou preenchimento no CMS em `Posts.ts`. Atualizar `access.read` para permitir leitura pública de posts publicados.

- [ ] **Passo 1.2.2: Criar página de listagem `app/(frontend)/noticias/page.tsx`**
Buscar posts da coleção `posts` ordenados por `-publishedAt`, com paginação/grid limpo e cards informativos.

- [ ] **Passo 1.2.3: Criar página de detalhe `app/(frontend)/noticias/[slug]/page.tsx`**
Buscar o post pelo `slug` (com fallback para `id`), renderizar RichText com `@payloadcms/richtext-lexical/react`, data de publicação, imagem de capa e botão de voltar.

- [ ] **Passo 1.2.4: Atualizar links na Home Page (`page.tsx`)**
Ajustar links do feed de notícias para apontar para `/noticias/${post.slug || post.id}` e o botão "Ver todas" para `/noticias`.

---

#### Tarefa 1.3: Adicionar Menu Mobile e Responsividade no Header
**Arquivos:**
- Criar: `apps/web/src/components/HeaderNav.tsx`
- Modificar: `apps/web/src/components/Header.tsx`

- [ ] **Passo 1.3.1: Criar o componente Client `HeaderNav.tsx`**
Criar navegação com suporte a menu hamburger responsivo (abrir/fechar gaveta mobile), links para Adoção, Sobre Nós, Como Ajudar, Transparência e botão de Doação.

- [ ] **Passo 1.3.2: Integrar `HeaderNav` no `Header.tsx`**
Substituir o `<nav className="hidden md:flex">` estático pelo `HeaderNav`, garantindo perfeita usabilidade em dispositivos móveis e desktop.

---

### Etapa 2: Estabilidade, Permissões e Infraestrutura do CMS

#### Tarefa 2.1: Corrigir Controle de Acesso (Access Control) nas Coleções
**Arquivos:**
- Modificar: `apps/web/src/collections/Animals.ts`
- Modificar: `apps/web/src/collections/Pages.ts`
- Modificar: `apps/web/src/collections/AnimalEvents.ts`
- Modificar: `apps/web/src/collections/Transactions.ts`
- Modificar: `apps/web/src/collections/Users.ts`

- [ ] **Passo 2.1.1: Ajustar `Animals.ts` para leitura pública**
Definir `access.read: () => true` para permitir visualização da vitrine em qualquer canal (REST, GraphQL, Client Components).

- [ ] **Passo 2.1.2: Ajustar `Pages.ts` para leitura de páginas publicadas**
Permitir leitura pública onde `status === 'Publicado'` (ou para usuários autenticados).

- [ ] **Passo 2.1.3: Ajustar `AnimalEvents.ts` para leitura de eventos públicos**
Permitir leitura onde `publico === true` ou se o usuário estiver autenticado.

- [ ] **Passo 2.1.4: Ajustar `Transactions.ts` com campo `visivelNoSite`**
Adicionar campo booleano `visivelNoSite: { type: 'checkbox', defaultValue: true, label: 'Exibir no Portal da Transparência' }`.

- [ ] **Passo 2.1.5: Ajustar `Users.ts` para auto-gerenciamento de perfil**
Permitir que usuários autenticados leiam e atualizem seu próprio registro (`user.id === doc.id` ou `user.role === 'Admin'`).

---

#### Tarefa 2.2: Desacoplar URL de Mídia e Permitir Uploads Locais
**Arquivos:**
- Modificar: `apps/web/src/collections/Media.ts`
- Modificar: `apps/web/src/hooks/blobUpload.ts`
- Excluir: `apps/web/src/lib/storage.ts`
- Modificar: `apps/web/next.config.ts`

- [ ] **Passo 2.2.1: Remover host hardcoded em `Media.ts`**
Ajustar o hook `afterRead` para priorizar a URL já existente no doc (`doc.url`), ou construir a partir de variável de ambiente `BLOB_STORAGE_URL` sem fixar o bucket no código.

- [ ] **Passo 2.2.2: Ativar suporte a storage local quando sem Vercel Blob**
No `Media.ts`, habilitar `disableLocalStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN)`, permitindo que o Payload salve imagens localmente em disco na pasta `media` durante o desenvolvimento local.

- [ ] **Passo 2.2.3: Configurar `remotePatterns` no `next.config.ts`**
Adicionar o padrão de hostname `*.public.blob.vercel-storage.com` em `images.remotePatterns` para que imagens otimizadas do Next.js funcionem.

- [ ] **Passo 2.2.4: Remover código morto `apps/web/src/lib/storage.ts`**
Excluir o arquivo não utilizado.

---

#### Tarefa 2.3: Atualizar Configurações de Ambiente, Docker e Metadados
**Arquivos:**
- Modificar: `apps/web/.env.example`
- Modificar: `apps/web/docker-compose.yml`
- Modificar: `apps/web/package.json`

- [ ] **Passo 2.3.1: Atualizar `apps/web/.env.example`**
Definir PostgreSQL como padrão:
```env
DATABASE_URL=postgresql://root:rootpassword@127.0.0.1:5432/ong_animal
PAYLOAD_SECRET=coloque_uma_chave_secreta_longa_aqui
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Passo 2.3.2: Atualizar `apps/web/docker-compose.yml`**
Remover configuração de Mongo e padronizar com PostgreSQL 15 Alpine conectado ao Payload.

- [ ] **Passo 2.3.3: Ajustar `apps/web/package.json`**
Alterar nome de `"blank"` para `"ong-animal-web"` e descrição correspondente.

---

### Etapa 3: Funcionalidades, Conexão ao CMS e Polimento de UX

#### Tarefa 3.1: Conectar Header e Footer aos Globals do CMS
**Arquivos:**
- Modificar: `apps/web/src/components/Header.tsx`
- Modificar: `apps/web/src/components/Footer.tsx`

- [ ] **Passo 3.1.1: Ler global `Header` do Payload**
Fazer o Server Component do Header buscar `header` via `payload.findGlobal({ slug: 'header' })` com fallback resiliente para os itens padrão caso ainda não configurado no CMS.

- [ ] **Passo 3.1.2: Ler dados do `Footer` do Payload**
Fazer o Server Component do Footer buscar links e informações institucionais com fallback para as informações existentes.

---

#### Tarefa 3.2: Filtros Interativos na Vitrine de Animais
**Arquivos:**
- Modificar: `apps/web/src/app/(frontend)/animais/page.tsx`

- [ ] **Passo 3.2.1: Suportar `searchParams` para filtro de espécie e porte**
Ler `searchParams: Promise<{ especie?: string }>` na página de animais e filtrar a consulta `payload.find` por `where: { status: { equals: 'Disponível' }, ...(especie ? { especie: { equals: especie } } : {}) }`.

- [ ] **Passo 3.2.2: Transformar botões de filtro em links ou botões ativos**
Criar botões funcionais para "Todos", "Cachorros", "Gatos" aplicando estilo visual ativo de acordo com a opção selecionada.

---

#### Tarefa 3.3: Chave PIX Copia-e-Cola e Compartilhamento
**Arquivos:**
- Criar: `apps/web/src/components/PixCopyButton.tsx`
- Criar: `apps/web/src/components/ShareButton.tsx`
- Modificar: `apps/web/src/app/(frontend)/transparencia/page.tsx`
- Modificar: `apps/web/src/app/(frontend)/animais/[slug]/page.tsx`

- [ ] **Passo 3.3.1: Criar `PixCopyButton.tsx`**
Componente interativo com ícone de cópia, chave PIX da ONG (`viralatinhas@viralatinhas.com` / CNPJ) e feedback visual animado ("Chave copiada!").

- [ ] **Passo 3.3.2: Integrar botão PIX na página de Transparência**
Adicionar card de doação rápida com o botão de PIX copia-e-cola na página de prestação de contas.

- [ ] **Passo 3.3.3: Criar `ShareButton.tsx` e integrar na página do animal**
Implementar compartilhamento nativo via `navigator.share` (título, descrição, url) e fallback para cópia de link na área de transferência com notificação visual.

---

## Verificação e Testes Finais
- [ ] Executar `npm run build --workspace=apps/web` ou `npx payload generate:types` para garantir consistência de tipos TypeScript.
- [ ] Testar navegação em todas as rotas principais: `/`, `/animais`, `/animais/[slug]`, `/adotar?pet=...`, `/noticias`, `/transparencia`.
- [ ] Verificar ausência de erros de hidratação ou links quebrados no console.
