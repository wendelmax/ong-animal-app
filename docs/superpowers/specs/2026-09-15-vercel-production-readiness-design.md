# Vercel Production Readiness Design

## Objetivo

Corrigir os pontos que impedem o cadastro público de voluntários de operar de forma previsível no deployment da Vercel: roteamento HTTP público, schema do Neon e armazenamento de mídia do Payload.

## Decisões

- As operações públicas `GET /public`, `POST /uploads`, `POST /uploads/confirm` e `POST /submit` terão rotas Next explícitas. Elas reutilizarão o serviço existente, o rate-limit Upstash e a mesma resposta de erro, evitando depender exclusivamente do matcher de endpoints customizados do catch-all do Payload.
- O banco será atualizado por migrações versionadas do Payload durante o build de produção. `push` ficará restrito ao desenvolvimento local, e o build da Vercel falhará antes de publicar se a migração não puder ser aplicada.
- A coleção `media` usará o adaptador oficial UploadThing já presente no projeto e no ambiente Vercel. Os arquivos sensíveis do cadastro de voluntário continuarão usando URLs assinadas do Cloudflare R2 e nunca serão publicados pela coleção `media`.
- Nenhum segredo será criado ou inferido no código. As chaves R2, Upstash, CPF e cron serão fornecidas pelo ambiente da Vercel.

## Critérios de aceite

1. As quatro rotas públicas são resolvidas localmente pelo App Router e retornam os códigos do serviço, sem `Route not found`.
2. A migração é idempotente e cobre os campos antigos observados nos logs (`posts.slug`, `posts.excerpt`, `transactions.visivel_no_site`) e o schema novo do cadastro.
3. A configuração de produção não depende de `push: true` nem de armazenamento local efêmero.
4. Testes de rota, migração e build passam no workspace.

