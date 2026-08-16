const AppError = require("../helpers/AppError");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "110498";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum dikonfigurasi");
}

// ==========================================
// AUTH
// ==========================================

const protectedAuth = (role = null) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError(401, "Unauthorized");
      }

      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new AppError(401, "Unauthorized");
      }

      const user = jwt.verify(token, JWT_SECRET);
      if (role) {
        if (user.role !== role) {
          console.log("ok");

          throw new AppError(403, "Akses ditolak");
        }
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new AppError(401, "Token expired"));
      }

      if (error.name === "JsonWebTokenError") {
        return next(new AppError(401, "Token tidak valid"));
      }

      next(error);
    }
  };
};

module.exports = {
  protectedAuth,
};
