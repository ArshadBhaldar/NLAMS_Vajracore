const { roleHasPermission } = require('../config/permissions');

// requirePermission('compensation:approve') returns a middleware that
// blocks the request unless req.user.role is granted that permission.
// Must run AFTER authenticate() so req.user is populated.
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roleHasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: `Role '${req.user.role}' does not have permission '${permission}'`,
      });
    }

    next();
  };
}

// scopeToDistrict ensures a CALA or Field Surveyor can only act on records
// within their assigned district, even if they guess a valid proposal ID.
function scopeToDistrict(getDistrictFromReq) {
  return (req, res, next) => {
    if (req.user.role === 'STATE_MONITOR') return next(); // read-only, national scope
    const targetDistrict = getDistrictFromReq(req);
    if (targetDistrict && req.user.district && targetDistrict !== req.user.district) {
      return res.status(403).json({ error: 'Forbidden: outside your assigned district' });
    }
    next();
  };
}

module.exports = { requirePermission, scopeToDistrict };
