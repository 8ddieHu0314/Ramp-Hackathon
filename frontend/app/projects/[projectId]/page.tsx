'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getProject, listReports, getReport } from '@/lib/api'
import type { ProjectResponse, ReportDetail } from '@/lib/types'
import { Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    Promise.all([getProject(projectId), listReports(projectId)])
      .then(([p, r]) => {
        setProject(p)
        if (r.length > 0) {
          const sorted = [...r].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          setLoadingReport(true)
          getReport(projectId, sorted[0].report_id)
            .then(setSelectedReport)
            .finally(() => setLoadingReport(false))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Project not found.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/history"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to History
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{project.product_name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {project.product_description}
        </p>
      </div>

      {!selectedReport && !loadingReport ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No reports yet.
        </div>
      ) : (
        <div>
          {loadingReport ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : selectedReport ? (
            <div
              className="rounded-lg border border-border bg-card p-6 prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[700px]"
              dangerouslySetInnerHTML={{ __html: selectedReport.html }}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
