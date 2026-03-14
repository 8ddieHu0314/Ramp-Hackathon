# User Inputs / Form Fields — Backend Reference

## Step 1 — Company Setup
| Field | Type | Required | Notes |
|---|---|---|---|
| `companyName` | `string` | Yes | Text input |
| `companyWebsite` | `string` | Yes | Text input (URL) |
| `companyDescription` | `string` | No | Textarea |

## Step 2 — Roles & Emails
| Field | Type | Required | Notes |
|---|---|---|---|
| `selectedRoles` | `Role[]` | Yes | Multi-select toggle; values: `'Marketing/PMs' \| 'SWEs' \| 'Sales' \| 'HR'` |
| `roleEmails` | `{ role: Role; emails: string[] }[]` | Yes | Per selected role, 1+ email addresses |
| `additionalFocus` | `string` | No | Textarea; free-form instructions for the agent |

## Step 3 — Competitors
| Field | Type | Required | Notes |
|---|---|---|---|
| `competitors[].name` | `string` | Yes | Per competitor card |
| `competitors[].website` | `string` | Yes | Per competitor card (URL) |
| *(max 6 competitors)* | | | Array of `CompetitorInput` objects |

---

## Full Payload Shape (WizardFormData)
```ts
{
  companyName: string
  companyWebsite: string
  companyDescription: string        // optional
  selectedRoles: Role[]             // subset of ['Marketing/PMs', 'SWEs', 'Sales', 'HR']
  roleEmails: {
    role: Role
    emails: string[]                // min 1 per selected role
  }[]
  additionalFocus: string           // optional
  competitors: {
    id: string                      // client-generated UUID
    name: string
    website: string
  }[]                               // 1–6 items
}
```
