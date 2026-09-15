import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdoptionSlugPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/adotar?pet=${encodeURIComponent(slug)}`)
}
