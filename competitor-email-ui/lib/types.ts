export type Role = 'Marketing/PMs' | 'SWEs' | 'Sales' | 'HR'
export const ROLES: Role[] = ['Marketing/PMs', 'SWEs', 'Sales', 'HR']

export interface CompetitorInput {
  id: string
  name: string
  website: string
}

export interface RoleEmails {
  role: Role
  emails: string[]
}

export interface WizardFormData {
  companyName: string
  companyWebsite: string
  companyDescription: string
  selectedRoles: Role[]
  roleEmails: RoleEmails[]
  additionalFocus: string
  competitors: CompetitorInput[]
}

export interface CompetitorAnalysis {
  competitorId: string
  competitorName: string
  role: Role
  salesStrategy: string
  marketingStrategy: string
  infrastructure: string
}

export interface CoreDiscovery {
  id: string
  title: string
  detail: string
}

export interface AnalysisResult {
  coreDiscoveries: CoreDiscovery[]
  competitorAnalyses: CompetitorAnalysis[]
}

export interface GeneratedEmail {
  role: Role
  subject: string
  body: string
}

export interface DashboardRun {
  id: string
  date: string
  companyName: string
  jobStatus: 'running' | 'complete' | 'error'
  statusMessages: string[]
  emailsByRole: GeneratedEmail[]
}

export interface HistoryRun {
  id: string
  date: string
  companyName: string
  companyDescription: string
  selectedRoles: Role[]
  competitors: Pick<CompetitorInput, 'name' | 'website'>[]
}
