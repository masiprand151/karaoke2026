const AppError = require("../helpers/AppError");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum dikonfigurasi");
}

// ==========================================
// AUTH
// ==========================================

const protectedAuth = (req, res, next) => {
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

// ==========================================
// ADMIN
// ==========================================

const protectedAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    if (req.user.role !== "admin") {
      throw new AppError(403, "Akses ditolak");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protectedAuth,
  protectedAdmin,
};
