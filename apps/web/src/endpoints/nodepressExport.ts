import type { Endpoint } from 'payload'
import { handleNodepressExport } from '../lib/nodepress-migration/export-service'
import type { PayloadExportClient } from '../lib/nodepress-migration/export-service'

export const nodepressExportEndpoint: Endpoint = {
  path: '/internal/nodepress-export',
  method: 'get',
  handler: async (req) => handleNodepressExport({
    url: req.url || '',
    headers: req.headers,
    payload: req.payload as unknown as PayloadExportClient,
  }),
}
