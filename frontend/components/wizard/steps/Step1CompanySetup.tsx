'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWizard } from '@/lib/wizard-context'

export function Step1CompanySetup() {
  const { formData, updateFormData } = useWizard()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Know your competition.</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Set up your product profile and let our AI agent deliver automated competitive intelligence reports.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="productUrl">
            Product URL <span className="text-destructive">*</span>
          </label>
          <Input
            id="productUrl"
            type="url"
            placeholder="https://ramp.com"
            value={formData.productUrl}
            onChange={(e) => updateFormData({ productUrl: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="productDescription">
            Product Description <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="productDescription"
            placeholder="Briefly describe your product and target market…"
            value={formData.productDescription}
            onChange={(e) => updateFormData({ productDescription: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="additionalContext">
            Additional Context{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id="additionalContext"
            placeholder="e.g. Focus on enterprise pricing moves and new product launches…"
            value={formData.additionalContext}
            onChange={(e) => updateFormData({ additionalContext: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
