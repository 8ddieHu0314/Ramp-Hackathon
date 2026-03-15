'use client'

import { useState, useEffect } from 'react'
import { listProjects } from '@/lib/api'
import type { ProjectResponse } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate, cleanHostname } from '@/lib/utils'

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your projects and competitive intelligence reports.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No projects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sorted.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-lg border border-border bg-card p-5 space-y-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(project.created_at, 'long')}</p>
                </div>
              </div>

              {project.product_description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {project.product_name} — {project.product_description}
                </p>
              )}

              {project.competitors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Competitors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.competitors.map((c) => (
                      <span
                        key={c.url}
                        className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        {cleanHostname(c.url)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.github_repos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">GitHub Repos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.github_repos.map((r) => (
                      <span
                        key={r.repo}
                        className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        {r.repo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.last_run && (
                <p className="text-xs text-muted-foreground">
                  Last run: {formatDate(project.last_run, 'long')}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
