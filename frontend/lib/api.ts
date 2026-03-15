import type {
  WizardFormData,
  ProjectResponse,
  RunStatusResponse,
  ReportSummary,
  ReportDetail,
} from './types'
import { cleanHostname } from './utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

// ── Projects ──

export async function createProject(form: WizardFormData): Promise<ProjectResponse> {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: form.productName,
      product_name: form.productName,
      product_description: form.productDescription,
      additional_context: form.additionalContext,
      competitors: form.competitors.map((c) => ({ url: c.url })),
      github_repos: form.githubRepos.map((r) => ({ repo: r.repo })),
      keywords: form.keywords.filter((k) => k.trim()),
      auto_generate_keywords: form.autoGenerateKeywords,
    }),
  })
}

export async function listProjects(): Promise<ProjectResponse[]> {
  return request('/api/projects')
}

export async function getProject(projectId: string): Promise<ProjectResponse> {
  return request(`/api/projects/${projectId}`)
}

export async function deleteProject(projectId: string): Promise<void> {
  await request(`/api/projects/${projectId}`, { method: 'DELETE' })
}

// ── Runs ──

export async function triggerRun(projectId: string): Promise<{ run_id: string; project_id: string; status: string }> {
  return request(`/api/projects/${projectId}/run`, { method: 'POST' })
}

export async function getRunStatus(projectId: string, runId: string): Promise<RunStatusResponse> {
  return request(`/api/projects/${projectId}/runs/${runId}/status`)
}

// ── Reports ──

export async function listReports(projectId: string): Promise<ReportSummary[]> {
  return request(`/api/projects/${projectId}/reports`)
}

export async function getReport(projectId: string, reportId: string): Promise<ReportDetail> {
  return request(`/api/projects/${projectId}/reports/${reportId}`)
}

// ── Email & Schedule ──

export async function setEmailSettings(
  projectId: string,
  settings: { enabled: boolean; address: string | null; from_address?: string },
): Promise<void> {
  await request(`/api/projects/${projectId}/email`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export async function setSchedule(
  projectId: string,
  schedule: { enabled: boolean; hour?: number; frequency?: string },
): Promise<void> {
  await request(`/api/projects/${projectId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(schedule),
  })
}
