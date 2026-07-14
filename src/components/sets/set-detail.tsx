'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { deleteSet, cloneSet } from '@/actions/sets'
import { CollaboratorDialog } from './collaborator-dialog'
import { ImportCsvDialog } from './import-csv-dialog'
import { ExportCsvButton } from './export-csv-button'
import {
  BookOpen,
  FileText,
  Globe,
  Grid3X3,
  Lock,
  Pencil,
  Play,
  Trash2,
  Copy,
  Users,
  FolderPlus,
  AlertTriangle,
  Download,
  Ear,
  ListChecks,
} from 'lucide-react'
import type { TSet, TTerm } from '@/types'

interface SetDetailProps {
  set: TSet
  terms: TTerm[]
  isOwner: boolean
}

export function SetDetail({ set, terms, isOwner }: SetDetailProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-sm font-semibold text-ink">{set.title}</h1>
            {set.is_public ? (
              <Globe className="h-4 w-4 text-mid-gray" />
            ) : (
              <Lock className="h-4 w-4 text-mid-gray" />
            )}
          </div>
          {set.description && (
            <p className="mt-1 text-mid-gray">{set.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm text-mid-gray">
            <span>{terms.length} thuật ngữ</span>
            <Badge variant="secondary" className="text-xs">
              {set.lang_term} → {set.lang_definition}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <ImportCsvDialog />
              <CollaboratorDialog setId={set.id} isOwner={isOwner} />
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/sets/${set.id}/edit`}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Sửa
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteSet(set.id)}>
                <Trash2 className="mr-1 h-4 w-4 text-ember" />
                Xoá
              </Button>
            </>
          )}
          <ExportCsvButton setId={set.id} />
          <Button variant="ghost" size="sm" onClick={() => cloneSet(set.id)}>
            <Copy className="mr-1 h-4 w-4" />
            Sao chép
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/sets/${set.id}/flashcard`}>
            <Play className="mr-1 h-4 w-4" />
            Học flashcard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/learn`}>
            <BookOpen className="mr-1 h-4 w-4" />
            Học
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/quiz`}>
            <FileText className="mr-1 h-4 w-4" />
            Quiz
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/spell`}>
            <Ear className="mr-1 h-4 w-4" />
            Spell
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/test`}>
            <ListChecks className="mr-1 h-4 w-4" />
            Test
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/match`}>
            <Grid3X3 className="mr-1 h-4 w-4" />
            Match
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sets/${set.id}/hard-words`}>
            <AlertTriangle className="mr-1 h-4 w-4" />
            Thẻ khó
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-ink">Danh sách thuật ngữ</h2>
        <div className="divide-y divide-hairline rounded-xl border border-hairline bg-paper">
          {terms.map((term, index) => (
            <div key={term.id} className="flex items-center gap-4 p-4">
              <span className="w-6 text-sm text-mid-gray">{index + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-ink">{term.term}</p>
                {term.reading && (
                  <p className="text-sm text-mid-gray">{term.reading}</p>
                )}
              </div>
              <div className="flex-1 text-right">
                <p className="text-ink">{term.definition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
