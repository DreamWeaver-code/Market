// Middleware to require request body
const requireBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Request body is required",
    });
  }
  next();
};

module.exports = requireBody;
