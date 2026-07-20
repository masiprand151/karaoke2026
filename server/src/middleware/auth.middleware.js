const AppError = require("../helpers/AppError");
const jwt = require("jsonwebtoken");

const protectedAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, "Unauthorized");
    }

    if (authHeader.split(" ")[0] !== "Bearer") {
      throw new AppError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, "110498");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protectedAuth };
