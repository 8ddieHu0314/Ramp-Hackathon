'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { WizardFormData } from './types'

const TOTAL_STEPS = 3

const defaultFormData: WizardFormData = {
  name: '',
  productName: '',
  productDescription: '',
  additionalContext: '',
  competitors: [],
  githubRepos: [],
  keywords: [],
  autoGenerateKeywords: true,
}

interface WizardContextValue {
  formData: WizardFormData
  currentStep: number
  direction: number
  totalSteps: number
  updateFormData: (partial: Partial<WizardFormData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardContextProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const updateFormData = useCallback((partial: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
  }, [])

  const nextStep = useCallback(() => {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }, [])

  const prevStep = useCallback(() => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }, [currentStep])

  return (
    <WizardContext.Provider
      value={{ formData, currentStep, direction, totalSteps: TOTAL_STEPS, updateFormData, nextStep, prevStep, goToStep }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used inside WizardContextProvider')
  return ctx
}
