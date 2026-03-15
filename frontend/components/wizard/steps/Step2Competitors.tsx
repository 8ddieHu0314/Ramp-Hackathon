'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useWizard } from '@/lib/wizard-context'
import { CompetitorCard } from '../partials/CompetitorCard'
import { AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { generateId } from '@/lib/utils'

const MAX_COMPETITORS = 6
const MAX_REPOS = 6

export function Step2Competitors() {
  const { formData, updateFormData } = useWizard()
  const { competitors, githubRepos } = formData

  // Competitor handlers
  const addCompetitor = () => {
    if (competitors.length >= MAX_COMPETITORS) return
    updateFormData({
      competitors: [...competitors, { id: generateId(), url: '' }],
    })
  }

  const removeCompetitor = (id: string) => {
    updateFormData({ competitors: competitors.filter((c) => c.id !== id) })
  }

  const updateCompetitorUrl = (id: string, url: string) => {
    updateFormData({
      competitors: competitors.map((c) => (c.id === id ? { ...c, url } : c)),
    })
  }

  // GitHub repo handlers
  const addRepo = () => {
    if (githubRepos.length >= MAX_REPOS) return
    updateFormData({
      githubRepos: [...githubRepos, { id: generateId(), repo: '' }],
    })
  }

  const removeRepo = (id: string) => {
    updateFormData({ githubRepos: githubRepos.filter((r) => r.id !== id) })
  }

  const updateRepo = (id: string, repo: string) => {
    updateFormData({
      githubRepos: githubRepos.map((r) => (r.id === id ? { ...r, repo } : r)),
    })
  }

  return (
    <div className="space-y-8">
      {/* Competitor URLs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Competitor Websites</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add competitor website URLs to monitor. The agent will track content changes and surface key moves.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {competitors.length} / {MAX_COMPETITORS} added
          </span>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button
                type="button"
                onClick={addCompetitor}
                disabled={competitors.length >= MAX_COMPETITORS}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add URL
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{competitors.length >= MAX_COMPETITORS ? 'Maximum reached' : 'Add a competitor URL'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {competitors.length === 0 && githubRepos.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center text-muted-foreground text-sm">
            Add at least one competitor URL or GitHub repo to get started.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {competitors.map((c, i) => (
              <CompetitorCard
                key={c.id}
                competitor={c}
                index={i}
                onChangeUrl={updateCompetitorUrl}
                onRemove={removeCompetitor}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* GitHub Repos */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">GitHub Repositories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track competitor open-source repos for stars, releases, commits, and issues.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {githubRepos.length} / {MAX_REPOS} added
          </span>
          <Button
            type="button"
            onClick={addRepo}
            disabled={githubRepos.length >= MAX_REPOS}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Repo
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {githubRepos.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Repo {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRepo(r.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  placeholder="owner/repo-name"
                  value={r.repo}
                  onChange={(e) => updateRepo(r.id, e.target.value)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
