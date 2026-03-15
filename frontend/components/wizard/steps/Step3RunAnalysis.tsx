'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWizard } from '@/lib/wizard-context'
import { createProject, triggerRun, getRunStatus, getReport, setEmailSettings, setSchedule } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Rocket } from 'lucide-react'
import type { RunStatusResponse, WizardFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

type Phase = 'ready' | 'submitting' | 'running' | 'completed' | 'failed'

const FREQUENCY_OPTIONS: { value: WizardFormData['frequency']; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every Monday' },
  { value: 'biweekly', label: 'Biweekly', description: '1st & 15th' },
]

export function Step3RunAnalysis() {
  const { formData, updateFormData } = useWizard()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('ready')
  const [runStatus, setRunStatus] = useState<RunStatusResponse | null>(null)
  const [reportHtml, setReportHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => cleanup, [cleanup])

  const handleSubmit = async () => {
    setPhase('submitting')
    setError(null)

    try {
      const project = await createProject(formData)

      // Configure email & schedule if email provided
      if (formData.emailEnabled && formData.emailAddress.trim()) {
        await Promise.all([
          setEmailSettings(project.id, {
            enabled: true,
            address: formData.emailAddress.trim(),
          }),
          setSchedule(project.id, {
            enabled: true,
            hour: 8,
            frequency: formData.frequency,
          }),
        ])
      }

      const { run_id } = await triggerRun(project.id)

      setPhase('running')

      pollRef.current = setInterval(async () => {
        try {
          const status = await getRunStatus(project.id, run_id)
          setRunStatus((prev) => {
            if (prev?.steps_completed === status.steps_completed && prev?.status === status.status) return prev
            return status
          })

          if (status.status === 'completed') {
            cleanup()
            setPhase('completed')
            if (status.report_id) {
              const report = await getReport(project.id, status.report_id)
              setReportHtml(report.html)
            }
          } else if (status.status === 'failed') {
            cleanup()
            setPhase('failed')
            setError(status.error || 'Pipeline failed')
          }
        } catch {
          cleanup()
          setPhase('failed')
          setError('Lost connection to server')
        }
      }, 3000)
    } catch (err) {
      setPhase('failed')
      setError(err instanceof Error ? err.message : 'Failed to create project')
    }
  }

  // Ready state — show summary, email config, and submit button
  if (phase === 'ready') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Ready to analyze</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your setup, configure email delivery, and launch the intelligence pipeline.
          </p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          <SummaryRow label="Product" value={`${formData.productName} (${formData.productUrl})`} />
          <SummaryRow
            label="Competitors"
            value={formData.competitors.map((c) => c.url).filter(Boolean).join(', ') || 'None'}
          />
          <SummaryRow
            label="GitHub Repos"
            value={formData.githubRepos.map((r) => r.repo).filter(Boolean).join(', ') || 'None'}
          />
        </div>

        {/* Email delivery section */}
        <div className="max-w-lg mx-auto space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Email Reports</p>
              <p className="text-xs text-muted-foreground">Get reports delivered to your inbox</p>
            </div>
            <button
              type="button"
              onClick={() => updateFormData({ emailEnabled: !formData.emailEnabled })}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                formData.emailEnabled ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  formData.emailEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {formData.emailEnabled && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="emailAddress">
                  Email Address
                </label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.emailAddress}
                  onChange={(e) => updateFormData({ emailAddress: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateFormData({ frequency: opt.value })}
                      className={cn(
                        'rounded-lg border-2 p-3 text-left transition-all duration-150',
                        formData.frequency === opt.value
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40',
                      )}
                    >
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <Button onClick={handleSubmit} size="lg">
            <Rocket className="mr-2 h-4 w-4" />
            Run Analysis
          </Button>
        </div>
      </div>
    )
  }

  // Running / submitting state
  if (phase === 'submitting' || phase === 'running') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Analysis in progress</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The intelligence pipeline is running. This may take a few minutes.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              {runStatus?.current_step || 'Initializing…'}
            </p>
          </div>
          {runStatus && (
            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {runStatus.steps_completed} / {runStatus.total_steps}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {runStatus && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${(runStatus.steps_completed / runStatus.total_steps) * 100}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // Completed state — show report
  if (phase === 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold">Analysis Complete</h2>
            <p className="text-sm text-muted-foreground">
              Your competitive intelligence report is ready.
              {formData.emailEnabled && formData.emailAddress && (
                <> Reports will be sent {formData.frequency} to {formData.emailAddress}.</>
              )}
            </p>
          </div>
        </div>

        {reportHtml && (
          <div
            className="rounded-lg border border-border bg-card p-6 prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[600px]"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        )}

        <div className="flex justify-center pt-2">
          <Button onClick={() => router.push('/dashboard')} size="lg">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div>
          <h2 className="text-xl font-semibold">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button onClick={() => setPhase('ready')} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
