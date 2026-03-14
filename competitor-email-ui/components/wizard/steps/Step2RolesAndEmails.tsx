'use client'

import { Textarea } from '@/components/ui/textarea'
import { useWizard } from '@/lib/wizard-context'
import { ROLES, type Role } from '@/lib/types'
import { RoleEmailSection } from '../partials/RoleEmailSection'
import { cn } from '@/lib/utils'

const roleDescriptions: Record<Role, string> = {
  'Marketing/PMs': 'Messaging & product strategy',
  'SWEs': 'Tech stack & dev tooling',
  'Sales': 'Deal tactics & pricing moves',
  'HR': 'Hiring & people ops',
}

export function Step2RolesAndEmails() {
  const { formData, updateFormData } = useWizard()

  const toggleRole = (role: Role) => {
    const selected = formData.selectedRoles
    const isSelected = selected.includes(role)
    updateFormData({
      selectedRoles: isSelected ? selected.filter((r) => r !== role) : [...selected, role],
    })
  }

  const updateRoleEmails = (role: Role, emails: string[]) => {
    updateFormData({
      roleEmails: formData.roleEmails.map((re) => (re.role === role ? { ...re, emails } : re)),
    })
  }

  const getRoleEmails = (role: Role): string[] =>
    formData.roleEmails.find((re) => re.role === role)?.emails ?? ['']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Who should receive intel emails?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the roles that should get daily briefings, then add their email addresses.
        </p>
      </div>

      {/* Role toggles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLES.map((role) => {
          const isSelected = formData.selectedRoles.includes(role)
          return (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all duration-150',
                isSelected
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40',
              )}
            >
              <p className="text-sm font-semibold">{role}</p>
              <p className="text-xs mt-0.5">{roleDescriptions[role]}</p>
            </button>
          )
        })}
      </div>

      {/* Email sections for selected roles */}
      {formData.selectedRoles.length > 0 && (
        <div className="space-y-5 rounded-lg border border-border bg-muted/30 p-5">
          <p className="text-sm font-medium">Email addresses per role</p>
          {formData.selectedRoles.map((role) => (
            <RoleEmailSection
              key={role}
              role={role}
              emails={getRoleEmails(role)}
              onChange={(emails) => updateRoleEmails(role, emails)}
            />
          ))}
        </div>
      )}

      {/* Additional focus */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="additionalFocus">
          Additional focus for the agent{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="additionalFocus"
          placeholder="e.g. Focus on enterprise pricing moves and new product launches targeting our core ICP…"
          value={formData.additionalFocus}
          onChange={(e) => updateFormData({ additionalFocus: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )
}
