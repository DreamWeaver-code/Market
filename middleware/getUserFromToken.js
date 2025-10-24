const jwt = require("jsonwebtoken");
const userQueries = require("../db/queries/users");

// Middleware to get user from token (doesn't require authentication)
const getUserFromToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userQueries.getUserById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
          };
        }
      } catch (error) {
        /
      }
    }

    next();
  } catch (error) {
    console.error("getUserFromToken error:", error);
    next(); 
  }
};

module.exports = getUserFromToken;

