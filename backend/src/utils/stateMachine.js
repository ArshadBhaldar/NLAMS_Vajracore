// Defines the legal transitions for a land acquisition proposal.
// DRAFT -> NOTIFIED_3A -> DECLARED_3D -> AWARD -> POSSESSION
// DISPUTED can be entered from NOTIFIED_3A or DECLARED_3D and exited back
// to the stage it came from once resolved.

const TRANSITIONS = {
  DRAFT: ['NOTIFIED_3A'],
  NOTIFIED_3A: ['DECLARED_3D', 'DISPUTED'],
  DECLARED_3D: ['AWARD', 'DISPUTED'],
  AWARD: ['POSSESSION'],
  POSSESSION: [], // terminal state
  DISPUTED: ['NOTIFIED_3A', 'DECLARED_3D'], // resume where it left off
};

// Only CALA can drive stage transitions (per the RBAC matrix). Requiring
// Body can only create the initial DRAFT.
const TRANSITION_ROLE = 'CALA';

function isValidTransition(fromStage, toStage) {
  return (TRANSITIONS[fromStage] || []).includes(toStage);
}

function assertValidTransition(fromStage, toStage) {
  if (!isValidTransition(fromStage, toStage)) {
    const allowed = TRANSITIONS[fromStage] || [];
    throw new Error(
      `Invalid stage transition: ${fromStage} -> ${toStage}. Allowed: [${allowed.join(', ') || 'none (terminal)'}]`
    );
  }
}

module.exports = { TRANSITIONS, TRANSITION_ROLE, isValidTransition, assertValidTransition };
