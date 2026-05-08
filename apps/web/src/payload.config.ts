import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Animals } from './collections/Animals'
import { AnimalEvents } from './collections/AnimalEvents'
import { AdoptionRequests } from './collections/AdoptionRequests'
import { Tenants } from './collections/Tenants'
import { Transactions } from './collections/Transactions'
import { Volunteers } from './collections/Volunteers'
import { DocumentTemplates } from './collections/DocumentTemplates'
import { SignedDocuments } from './collections/SignedDocuments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Animals, AnimalEvents, AdoptionRequests, Tenants, Transactions, Volunteers, DocumentTemplates, SignedDocuments],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true, // Auto-cria as tabelas no banco de dados (ideal para início de projeto)
  }),
  sharp,
  plugins: [],
})
