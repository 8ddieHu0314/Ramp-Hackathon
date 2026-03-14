'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getProject, listReports, getReport } from '@/lib/api'
import type { ProjectResponse, ReportSummary, ReportDetail } from '@/lib/types'
import { Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    Promise.all([getProject(projectId), listReports(projectId)])
      .then(([p, r]) => {
        setProject(p)
        const sorted = [...r].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        setReports(sorted)
        if (sorted.length > 0) {
          setLoadingReport(true)
          getReport(projectId, sorted[0].report_id)
            .then(setSelectedReport)
            .finally(() => setLoadingReport(false))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  const handleSelectReport = async (reportId: string) => {
    setLoadingReport(true)
    setSelectedReport(null)
    try {
      const report = await getReport(projectId, reportId)
      setSelectedReport(report)
    } catch {}
    setLoadingReport(false)
  }

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

      {reports.length === 0 ? (
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
