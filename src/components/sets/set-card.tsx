'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Globe, Lock } from 'lucide-react'
import type { TSet } from '@/types'

interface SetCardProps {
  set: TSet
}

export function SetCard({ set }: SetCardProps) {
  return (
    <Link href={`/sets/${set.id}`}>
      <Card className="group transition-shadow hover:shadow-subtle">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-body-lg font-medium text-charcoal line-clamp-1">{set.title}</h3>
            {set.is_public ? (
              <Globe className="h-5 w-5 shrink-0 text-fog" />
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-fog" />
            )}
          </div>
          {set.description && (
            <p className="mt-1 text-body text-fog line-clamp-2">{set.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-caption text-fog">
            <span className="flex items-center gap-1">
              <BookOpen className="h-5 w-5" />
              0 thuật ngữ
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-caption">
              {set.lang_term} → {set.lang_definition}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
