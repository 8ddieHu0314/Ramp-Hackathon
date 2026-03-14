// ── API Request Types ──

export interface CompetitorInput {
  id: string // local UI id
  url: string
}

export interface GitHubRepoInput {
  id: string // local UI id
  repo: string // "owner/name"
}

export interface WizardFormData {
  productUrl: string
  productDescription: string
  additionalContext: string
  competitors: CompetitorInput[]
  githubRepos: GitHubRepoInput[]
  keywords: string[]
  autoGenerateKeywords: boolean
  emailEnabled: boolean
  emailAddress: string
  frequency: 'daily' | 'weekly' | 'biweekly'
}

// ── API Response Types ──

export interface ProjectResponse {
  id: string
  name: string
  product_name: string
  product_description: string
  additional_context: string
  competitors: { url: string }[]
  github_repos: { repo: string }[]
  keywords: string[]
  email_enabled: boolean
  email_address: string | null
  email_from: string
  schedule_enabled: boolean
  schedule_hour: number
  created_at: string
  last_run: string | null
}

export interface RunStatusResponse {
  run_id: string
  project_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  current_step: string | null
  steps_completed: number
  total_steps: number
  error: string | null
  report_id: string | null
}

export interface ReportSummary {
  report_id: string
  project_id: string
  created_at: string
  is_first_run: boolean
}

export interface ReportDetail {
  report_id: string
  project_id: string
  created_at: string
  is_first_run: boolean
  markdown: string
  html: string
}
