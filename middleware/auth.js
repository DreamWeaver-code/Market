const jwt = require("jsonwebtoken");
const userQueries = require("../db/queries/users");

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token is required",
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await userQueries.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token has expired",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

module.exports = {
  authenticateToken,
};

