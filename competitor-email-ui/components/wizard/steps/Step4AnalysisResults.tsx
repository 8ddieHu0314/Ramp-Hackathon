'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PLACEHOLDER_ANALYSIS_RESULT } from '@/lib/placeholder-data'
import { AnalysisCompetitorCard } from '../partials/AnalysisCompetitorCard'
import { Lightbulb, ArrowRight } from 'lucide-react'

export function Step4AnalysisResults() {
  const router = useRouter()
  const { coreDiscoveries, competitorAnalyses } = PLACEHOLDER_ANALYSIS_RESULT

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Analysis Complete</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what we found. Your daily emails have been scheduled.
          Your agent will have access to such discoveries.
</p>
      </div>

      {/* Core discoveries */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          Core Discoveries
        </h3>
        <div className="space-y-3">
          {coreDiscoveries.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">{d.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor × Role analysis grid */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Competitor × Role Analysis</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {competitorAnalyses.map((a, i) => (
            <AnalysisCompetitorCard key={`${a.competitorId}-${a.role}-${i}`} analysis={a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Button onClick={() => router.push('/dashboard')} size="lg">
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
