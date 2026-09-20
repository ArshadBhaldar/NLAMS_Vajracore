// ============================================================
// Shared TypeScript types matching the backend DB schema
// and API response shapes. This is the contract between
// the Next.js frontend and the Express backend.
// ============================================================

// --- Roles ---

export type UserRole =
  | 'REQUIRING_BODY'
  | 'CALA'
  | 'FIELD_SURVEYOR'
  | 'STATE_MONITOR'
  | 'CITIZEN'

/** Human-readable labels for each backend role enum */
export const ROLE_LABELS: Record<UserRole, string> = {
  REQUIRING_BODY: 'Requiring Body',
  CALA: 'CALA / Collector',
  FIELD_SURVEYOR: 'Field Surveyor',
  STATE_MONITOR: 'State Monitor',
  CITIZEN: 'Citizen',
}

/** Default dashboard route for each role after login */
export const ROLE_HOME: Record<UserRole, string> = {
  STATE_MONITOR: '/dashboard',
  REQUIRING_BODY: '/submit-proposal',
  CALA: '/workbench',
  FIELD_SURVEYOR: '/field-survey',
  CITIZEN: '/my-land',
}

// --- Proposal stages ---

export type ProposalStage =
  | 'DRAFT'
  | 'NOTIFIED_3A'
  | 'DECLARED_3D'
  | 'AWARD'
  | 'POSSESSION'
  | 'DISPUTED'

export const STAGE_LABELS: Record<ProposalStage, string> = {
  DRAFT: 'Draft',
  NOTIFIED_3A: '3A Notified',
  DECLARED_3D: '3D Declared',
  AWARD: 'Award',
  POSSESSION: 'Possession',
  DISPUTED: 'Disputed',
}

/** Ordered stages for the linear stepper (excludes DISPUTED which is a branch) */
export const STAGE_ORDER: ProposalStage[] = [
  'DRAFT',
  'NOTIFIED_3A',
  'DECLARED_3D',
  'AWARD',
  'POSSESSION',
]

/** Valid transitions — mirrors backend/src/utils/stateMachine.js */
export const TRANSITIONS: Record<ProposalStage, ProposalStage[]> = {
  DRAFT: ['NOTIFIED_3A'],
  NOTIFIED_3A: ['DECLARED_3D', 'DISPUTED'],
  DECLARED_3D: ['AWARD', 'DISPUTED'],
  AWARD: ['POSSESSION'],
  POSSESSION: [],
  DISPUTED: ['NOTIFIED_3A', 'DECLARED_3D'],
}

// --- Entities ---

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  district: string | null
}

export interface Proposal {
  id: string
  project_name: string
  requiring_body_id: string
  district: string
  state: string
  area_hectares: number
  stage: ProposalStage
  justification: string | null
  litigation_risk_score: number | null
  litigation_risk_band: string | null
  assigned_cala_id: string | null
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  area_notified_hectares: number
  area_acquired_hectares: number
  total_proposals: number
  disputed_count: number
  possession_count: number
  compensation_assessed: number
  compensation_paid: number
  rr_completion_pct: number
  families_displaced: number
  stage_breakdown: { stage: string; count: number }[]
}

export interface Parcel {
  id: string
  proposal_id: string
  ulpin: string | null
  owner_name: string | null
  citizen_id: string | null
  claimed_area_sqm: number | null
  geometry: object | null
  restricted_zone_overlap: boolean
  overlap_details: object | null
  created_at: string
}

export interface Compensation {
  id: string
  proposal_id: string
  parcel_id: string
  assessed_amount: number
  paid_amount: number
  status: 'ASSESSED' | 'PENDING' | 'PAID'
  approved_by: string | null
  approved_at: string | null
  paid_at: string | null
  transaction_ref: string | null
}

export interface Objection {
  id: string
  proposal_id: string
  parcel_id: string | null
  filed_by: string
  reason: string
  status: 'OPEN' | 'REVIEWING' | 'HEARING_SCHEDULED' | 'RESOLVED' | 'REJECTED'
  filed_at: string
  resolved_at: string | null
  resolution_notes: string | null
  filed_by_name?: string
}

export interface ScrutinyReport {
  id?: string
  proposal_id: string
  overall_status: 'PASS' | 'FLAGGED'
  legal_result: {
    status: 'PASS' | 'FLAGGED'
    flags?: string[]
    details?: string
  }
  geospatial_result: {
    status: 'PASS' | 'FLAGGED'
    reason?: string
    summary?: string
    overlapping_parcels?: any[]
    overlaps?: any[]
  }
  rr_result: {
    status: 'PASS' | 'FLAGGED'
    policy_notes?: string
    summary?: string
    total_proposal_compensation?: number
    parcel_breakdown?: any[]
  }
  generated_at: string
}

export interface DocumentRecord {
  id: string
  proposal_id: string
  parcel_id: string | null
  doc_type: string
  filename: string
  storage_path: string
  version: number
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'FLAGGED'
  uploaded_by: string
  uploaded_at: string
  uploaded_by_name?: string
}

export interface AuditEntry {
  id: number
  entity_type: string
  entity_id: string
  action: string
  performed_by: string | null
  performed_by_role: UserRole | null
  performed_by_name?: string
  details: object | null
  performed_at: string
}

export interface LoginResponse {
  token: string
  user: User
}
