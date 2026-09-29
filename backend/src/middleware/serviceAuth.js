const serviceAuth = (req, res, next) => {
  const expectedKey = process.env.AI_SERVICE_KEY || 'vajra_internal_service_key_2026';
  const serviceKey = req.header('X-Service-Key');
  if (!serviceKey || serviceKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Service Key' });
  }
  next();
};

module.exports = { serviceAuth };
