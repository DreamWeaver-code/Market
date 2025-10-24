// Middleware to require user authentication
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
  next();
};

module.exports = requireUser;

