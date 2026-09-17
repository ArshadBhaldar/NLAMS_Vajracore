const serviceAuth = (req, res, next) => {
  const serviceKey = req.header('X-Service-Key');
  if (!serviceKey || serviceKey !== process.env.AI_SERVICE_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Service Key' });
  }
  next();
};

module.exports = { serviceAuth };
