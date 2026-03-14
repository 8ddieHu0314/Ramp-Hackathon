'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useWizard } from '@/lib/wizard-context'
import { CompetitorCard } from '../partials/CompetitorCard'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { CompetitorInput } from '@/lib/types'

const MAX_COMPETITORS = 6

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function Step3Competitors() {
  const { formData, updateFormData } = useWizard()
  const { competitors } = formData

  const addCompetitor = () => {
    if (competitors.length >= MAX_COMPETITORS) return
    updateFormData({
      competitors: [...competitors, { id: generateId(), name: '', website: '' }],
    })
  }

  const removeCompetitor = (id: string) => {
    updateFormData({ competitors: competitors.filter((c) => c.id !== id) })
  }

  const updateCompetitor = (id: string, field: keyof Pick<CompetitorInput, 'name' | 'website'>, value: string) => {
    updateFormData({
      competitors: competitors.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  const atMax = competitors.length >= MAX_COMPETITORS

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Add your competitors</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add up to 6 competitors. The agent will monitor their websites and surface key moves daily.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {competitors.length} / {MAX_COMPETITORS} competitors added
        </span>
        <Tooltip>
          <TooltipTrigger render={<span />}>
            <Button
              type="button"
              onClick={addCompetitor}
              disabled={atMax}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Competitor
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{atMax ? 'Maximum of 6 competitors reached' : 'Add a new competitor'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {competitors.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-border p-10 text-center text-muted-foreground text-sm">
          No competitors added yet. Click &ldquo;Add Competitor&rdquo; to get started.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {competitors.map((c, i) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              index={i}
              onChange={updateCompetitor}
              onRemove={removeCompetitor}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
