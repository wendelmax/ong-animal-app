import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { pt } from '@payloadcms/translations/languages/pt'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
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
import { VolunteerInvitations } from './collections/VolunteerInvitations'
import { VolunteerFiles } from './collections/VolunteerFiles'
import { MembershipTermVersions } from './collections/MembershipTermVersions'
import { VolunteerTermAcceptances } from './collections/VolunteerTermAcceptances'
import { AuditEvents } from './collections/AuditEvents'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { volunteerRegistrationEndpoints } from './endpoints/volunteerRegistration'
import { nodepressExportEndpoint } from './endpoints/nodepressExport'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  endpoints: [...volunteerRegistrationEndpoints, nodepressExportEndpoint],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    theme: 'light',
    components: {
      graphics: {
        Logo: '/components/AdminGraphics#AdminLogo',
        Icon: '/components/AdminGraphics#AdminIcon',
      },
      views: {
        dashboard: {
          Component: '/components/Admin/Dashboard',
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    Animals,
    AnimalEvents,
    AdoptionRequests,
    Tenants,
    Transactions,
    Volunteers,
    DocumentTemplates,
    SignedDocuments,
    VolunteerInvitations,
    VolunteerFiles,
    MembershipTermVersions,
    VolunteerTermAcceptances,
    AuditEvents,
    Pages,
    Posts,
    Categories,
  ],
  globals: [Header, Footer],
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    'https://www.viralatinhas.com',
    'https://viralatinhas.com',
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    'https://www.viralatinhas.com',
    'https://viralatinhas.com',
  ].filter(Boolean),
  i18n: {
    supportedLanguages: { pt },
  },
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET || 'viralatinhas-default-payload-secret-key-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  plugins: [
    uploadthingStorage({
      enabled: Boolean(process.env.UPLOADTHING_TOKEN),
      collections: { media: true },
      options: {
        token: process.env.UPLOADTHING_TOKEN || '',
      },
    }),
  ],
})
