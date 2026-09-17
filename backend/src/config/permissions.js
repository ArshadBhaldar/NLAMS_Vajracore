// Centralized RBAC permission map.
// Each permission key is checked by middleware/rbac.js before a route handler runs.
// Keeping this in one file means the entire access model is auditable at a glance.

const PERMISSIONS = {
  REQUIRING_BODY: [
    'proposal:create',
    'proposal:view_own',
    'parcel:create',
    'document:upload',
    'dashboard:view_macro',
  ],
  CALA: [
    'proposal:view_district',
    'proposal:transition_stage',
    'scrutiny:view_report',
    'scrutiny:trigger_run',
    'compensation:approve',
    'objection:resolve',
    'dashboard:view_district',
  ],
  FIELD_SURVEYOR: [
    'document:upload',
    'parcel:view_assigned',
    // Explicitly NOT granted: compensation:*, proposal:transition_stage
  ],
  STATE_MONITOR: [
    'dashboard:view_national',
    'report:generate_mis',
    'risk:view_score',
    // Read-only role: no create/update/approve permissions granted
  ],
  CITIZEN: [
    'parcel:view_own',
    'compensation:view_own',
    'objection:create',
    'objection:view_own',
  ],
};

function roleHasPermission(role, permission) {
  return (PERMISSIONS[role] || []).includes(permission);
}

module.exports = { PERMISSIONS, roleHasPermission };
