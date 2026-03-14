'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CompetitorInput } from '@/lib/types'

interface CompetitorCardProps {
  competitor: CompetitorInput
  index: number
  onChangeUrl: (id: string, url: string) => void
  onRemove: (id: string) => void
}

export function CompetitorCard({ competitor, index, onChangeUrl, onRemove }: CompetitorCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Competitor {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(competitor.id)}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Input
        placeholder="https://competitor.com"
        value={competitor.url}
        onChange={(e) => onChangeUrl(competitor.id, e.target.value)}
      />
    </motion.div>
  )
}
