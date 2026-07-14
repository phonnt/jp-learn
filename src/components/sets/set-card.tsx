'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Globe, Lock, User } from 'lucide-react'
import type { TSet } from '@/types'

interface SetCardProps {
  set: TSet
}

export function SetCard({ set }: SetCardProps) {
  return (
    <Link href={`/sets/${set.id}`}>
      <Card className="group transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-ink line-clamp-1">{set.title}</h3>
            {set.is_public ? (
              <Globe className="h-4 w-4 shrink-0 text-mid-gray" />
            ) : (
              <Lock className="h-4 w-4 shrink-0 text-mid-gray" />
            )}
          </div>
          {set.description && (
            <p className="mt-1 text-sm text-mid-gray line-clamp-2">{set.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-mid-gray">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              0 thuật ngữ
            </span>
          </div>
        </CardContent>
        <CardFooter className="border-t border-hairline px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-mid-gray">
            <Badge variant="secondary" className="text-xs">
              {set.lang_term} → {set.lang_definition}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
