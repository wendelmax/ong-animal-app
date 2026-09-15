# Deploy do cadastro público de voluntários

## Serviços

1. Hospedar o Next.js/Payload na Vercel.
2. Conectar um PostgreSQL Neon pelo Marketplace da Vercel e configurar `DATABASE_URL` em Preview e Production.
3. Criar um bucket Cloudflare R2 privado para documentos; não reutilizar o Blob público usado pela coleção `media`.
4. Criar credencial R2 limitada ao bucket e configurar `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`.
5. Criar Redis Upstash e configurar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.

## Desenvolvimento local

O compose em `apps/web/docker-compose.yml` sobe PostgreSQL 15 em `localhost:5432`, banco `ong_animal`, usuário `root` e senha `rootpassword`. Para executar a suíte completa, defina também `PAYLOAD_SECRET`, `VOLUNTEER_CPF_ENCRYPTION_KEY` (32 bytes em Base64), `VOLUNTEER_CPF_HMAC_PEPPER` e `NEXT_PUBLIC_SERVER_URL`, e rode:

`docker compose -f apps/web/docker-compose.yml up -d postgres`

`npm --workspace apps/web run test:int`

## Segredos

Configurar também `PAYLOAD_SECRET`, `VOLUNTEER_CPF_ENCRYPTION_KEY` (32 bytes em Base64), `VOLUNTEER_CPF_HMAC_PEPPER` e `CRON_SECRET`. Os mesmos nomes devem existir separadamente em Preview e Production; nenhum segredo entra no repositório.

## R2 e segurança

- Não habilitar leitura pública no bucket.
- Configurar CORS do bucket para `https://www.viralatinhas.com`, `https://viralatinhas.com` e a URL de Preview necessária durante testes.
- Permitir somente `PUT`, `HEAD` e `GET` assinados para os objetos do prefixo `volunteer-intake/`.
- Rotacionar as credenciais R2 e o pepper conforme a política interna da organização.
- Configurar retenção/eliminação de arquivos conforme a política de privacidade antes de produção.

## Cron

O cron Vercel chama `/api/internal/volunteer-upload-cleanup` diariamente às 03:00 UTC. A rota exige `Authorization: Bearer ${CRON_SECRET}`, remove somente arquivos `UPLOADED` sem voluntário associado e mais antigos que 24 horas, e devolve apenas contagens agregadas.

## Plano Vercel

O plano Hobby possui restrição de uso pessoal/não comercial nos termos da Vercel. A organização deve confirmar elegibilidade ou usar Pro/Enterprise antes de processar dados reais de voluntários. O R2 privado e o PostgreSQL devem ter sua própria análise de retenção, backups e contrato de tratamento de dados.

## Checklist antes do PR

- `npm --workspace apps/web run test:int`
- `npm --workspace apps/web run test:e2e`
- `npm --workspace apps/web exec tsc -- --noEmit`
- `npm --workspace apps/web run build`
- `git diff --check`
