import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface StudyHeaderProps {
  setId: string
  setTitle: string
  modeLabel: string
}

export function StudyHeader({ setId, setTitle, modeLabel }: StudyHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href={`/sets/${setId}`}
        className="inline-flex items-center gap-1.5 text-sm text-mid-gray hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Về bộ thẻ
      </Link>
      <div className="text-center">
        <h1 className="text-heading-sm font-semibold text-ink">{setTitle}</h1>
        <p className="text-mid-gray">{modeLabel}</p>
      </div>
    </div>
  )
}
