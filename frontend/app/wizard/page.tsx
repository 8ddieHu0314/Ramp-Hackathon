import { WizardContextProvider } from '@/lib/wizard-context'
import { WizardShell } from '@/components/wizard/WizardShell'

export default function WizardPage() {
  return (
    <WizardContextProvider>
      <WizardShell />
    </WizardContextProvider>
  )
}
