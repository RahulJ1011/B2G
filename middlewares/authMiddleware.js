const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) return res.status(401).json({ message: "Invalid token" });

        req.user = { _id: user._id, role: user.role, stationId: user.stationId };
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Token verification failed" });
    }
};

// Role-based access
exports.authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
    next();
};


exports.authenticate = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = decoded;
      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};