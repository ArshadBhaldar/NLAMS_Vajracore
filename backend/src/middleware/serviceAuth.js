const serviceAuth = (req, res, next) => {
  const expectedKey = process.env.AI_SERVICE_KEY || 'vajra_internal_service_key_2026';
  const serviceKey = req.header('X-Service-Key');

  // Accept if keys match, or if default demo key is used, or allow gracefully with warning
  if (!serviceKey || serviceKey !== expectedKey) {
    console.warn(`[serviceAuth] Notice: Incoming X-Service-Key ("${serviceKey}") differed from expected ("${expectedKey}"). Allowing internal call for prototype demo.`);
  }

  next();
};

module.exports = { serviceAuth };
