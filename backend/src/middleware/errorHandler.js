// Catches errors thrown/rejected inside async route handlers (via the
// asyncHandler wrapper below) and returns a consistent JSON error shape
// instead of leaking stack traces or crashing the process.

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate record', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference (foreign key)', detail: err.detail });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

// Wraps an async Express handler so thrown errors/rejections are forwarded
// to errorHandler instead of needing a try/catch in every controller.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
