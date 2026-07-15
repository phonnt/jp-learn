import { redirect } from 'next/navigation'

export default async function FlashcardRedirect({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  redirect(`/sets/${setId}`)
}
