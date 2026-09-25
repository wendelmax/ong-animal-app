# Runbook de convivência ONG ↔ NodePress

O modo padrão é `legacy`. Nenhuma mudança de tráfego ocorre apenas por fazer
deploy desta configuração.

## Preparação

- [ ] Confirmar backup restaurável do banco legado e dos arquivos.
- [ ] Configurar `NODEPRESS_BRIDGE_TOKEN` somente no legado e no segredo do job NodePress.
- [ ] Configurar `NODEPRESS_BRIDGE_AUDIENCE=nodepress` nos dois lados.
- [ ] Confirmar que NodePress e legado usam bancos e credenciais separados.
- [ ] Definir owner, janela de congelamento e domínio a migrar.

## Shadow migration

1. Manter `NODEPRESS_COEXISTENCE_MODE=legacy`.
2. Executar um run com `runId` único e watermark fixo.
3. Importar páginas, posts, mídia e domínios funcionais sem habilitar escrita NodePress.
4. Comparar contagens, `legacyId`, relacionamentos e checksums.
5. Corrigir itens falhos e repetir o run; replays devem ser idempotentes.

## Cutover

1. Exigir relatório de reconciliação `passed`, sem `blockingErrors`.
2. Alterar o domínio para `ready` e abrir a janela de congelamento.
3. Alterar para `frozen`; bloquear novas escritas no legado.
4. Executar delta final e reconciliar novamente.
5. Ativar `active` no NodePress e só então alterar o modo de roteamento.
6. Validar URLs públicas, formulários, mídia, admin NodePress e auditoria.

## Rollback

- Acionar `NODEPRESS_COEXISTENCE_MODE=legacy` como kill switch público.
- Bloquear escritas NodePress para o domínio ativo.
- Preservar `runId`, logs e eventos de auditoria.
- Não reabrir escrita concorrente no legado sem decisão registrada.
- Reconciliar qualquer escrita pós-cutover antes de uma nova tentativa.

## Deprecação

Só depois de todos os domínios estarem ativos e estáveis: manter o legado em
somente leitura, revogar tokens/jobs, arquivar evidências e validar retenção
LGPD/legal antes de remover infraestrutura ou código.
