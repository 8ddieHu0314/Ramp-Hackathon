'use client'

import { useState, useEffect } from 'react'
import { listProjects, listReports, getReport } from '@/lib/api'
import type { ProjectResponse, ReportDetail } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [reportCache, setReportCache] = useState<Record<string, ReportDetail>>({})
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    listProjects()
      .then((p) => {
        setProjects(p)
        if (p.length > 0) setSelectedProject(p[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    if (reportCache[selectedProject]) return // already cached
    setLoadingReport(true)
    listReports(selectedProject)
      .then(async (reports) => {
        if (reports.length > 0) {
          const latest = reports[reports.length - 1]
          const full = await getReport(selectedProject, latest.report_id)
          setReportCache((prev) => ({ ...prev, [selectedProject]: full }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReport(false))
  }, [selectedProject, reportCache])

  const currentReport = selectedProject ? reportCache[selectedProject] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your competitive intelligence reports.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No projects yet. Complete the wizard to get started.
        </div>
      ) : (
        <Tabs value={selectedProject ?? undefined} onValueChange={setSelectedProject}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex h-auto gap-1 bg-transparent p-0 min-w-max">
              {projects.map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {p.product_name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {projects.map((p) => (
            <TabsContent key={p.id} value={p.id} className="mt-6 space-y-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{p.product_name}</span>
                {' — '}
                {p.competitors.length} competitor{p.competitors.length !== 1 ? 's' : ''}
                {p.github_repos.length > 0 && `, ${p.github_repos.length} repo${p.github_repos.length !== 1 ? 's' : ''}`}
                {p.last_run && ` — Last run: ${formatDate(p.last_run)}`}
              </div>

              {loadingReport && selectedProject === p.id ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : currentReport && selectedProject === p.id ? (
                <div
                  className="rounded-lg border border-border bg-card p-6 prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[700px]"
                  dangerouslySetInnerHTML={{ __html: currentReport.html }}
                />
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No reports yet. Trigger a run from the wizard.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
