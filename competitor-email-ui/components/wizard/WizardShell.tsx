'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useWizard } from '@/lib/wizard-context'
import { WizardStepper } from './WizardStepper'
import { Step1CompanySetup } from './steps/Step1CompanySetup'
import { Step2RolesAndEmails } from './steps/Step2RolesAndEmails'
import { Step3Competitors } from './steps/Step3Competitors'
import { Step4AnalysisResults } from './steps/Step4AnalysisResults'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STEPS = [
  Step1CompanySetup,
  Step2RolesAndEmails,
  Step3Competitors,
  Step4AnalysisResults,
]

function useIsNextDisabled(currentStep: number, formData: ReturnType<typeof useWizard>['formData']): boolean {
  if (currentStep === 0) {
    return !formData.companyName.trim() || !formData.companyWebsite.trim()
  }
  if (currentStep === 1) {
    return formData.selectedRoles.length === 0
  }
  return false
}

export function WizardShell() {
  const { currentStep, direction, totalSteps, formData, nextStep, prevStep } = useWizard()
  const isNextDisabled = useIsNextDisabled(currentStep, formData)
  const isLastStep = currentStep === totalSteps - 1
  const StepComponent = STEPS[currentStep]

  return (
    <div className="space-y-8">
      <WizardStepper currentStep={currentStep} totalSteps={totalSteps} />

      <div className="relative min-h-[420px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {!isLastStep && (
        <div className="flex items-center justify-between pt-2">
          {currentStep > 0 && (
            <Button variant="ghost" onClick={prevStep}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep === 0 && <span />}
          <Button onClick={nextStep} disabled={isNextDisabled}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
