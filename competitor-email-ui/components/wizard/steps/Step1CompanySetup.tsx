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
          Set up your company profile and let our AI agent deliver daily, role-targeted competitor intelligence straight
          to your team&apos;s inbox.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="companyName">
            Company Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="companyName"
            placeholder="Ramp"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="companyWebsite">
            Company Website <span className="text-destructive">*</span>
          </label>
          <Input
            id="companyWebsite"
            type="url"
            placeholder="https://ramp.com"
            value={formData.companyWebsite}
            onChange={(e) => updateFormData({ companyWebsite: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="companyDescription">
            Description{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id="companyDescription"
            placeholder="Briefly describe your company, product, and target market…"
            value={formData.companyDescription}
            onChange={(e) => updateFormData({ companyDescription: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
