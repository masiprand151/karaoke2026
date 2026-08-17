const prisma = require("../configs/prisma");
const bcrypt = require("bcrypt");
const AppError = require("../helpers/AppError");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "110498";

const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // validasi
    if (!username || !password) {
      throw new AppError(400, "Username end password required");
    }

    const user = await prisma.user.findFirst({
      where: { username, deletedAt: null },
    });

    // validasi
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "Invalid password");

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
