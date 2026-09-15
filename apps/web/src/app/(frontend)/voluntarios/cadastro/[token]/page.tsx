import { VolunteerRegistrationForm } from '@/components/VolunteerRegistrationForm'

export const dynamic = 'force-dynamic'

export default async function VolunteerRegistrationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <VolunteerRegistrationForm token={token} />
}

