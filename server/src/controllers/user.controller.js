const prisma = require("../configs/prisma");
const bcrypt = require("bcrypt");
const AppError = require("../helpers/AppError");

const getAllUser = async (req, res, next) => {
  try {
    const { search } = req.query || "";
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: search,
        },
        deletedAt: null,
      },
      omit: {
        password: true,
      },
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const createNewUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // cek username unik (hanya user aktif)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    });
    if (existingUser) {
      throw new AppError(400, "User sudah ada!");
    }

    // validasi role
    const validRoles = ["admin", "cashier", "staff"];
    if (!validRoles.includes(role)) {
      throw new AppError(400, "Role tidak valid");
    }

    // hash password
    const hashedPw = await bcrypt.hash(password, 10);

    // simpan user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPw,
        role,
      },
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

const updatedUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, password, role, oldPassword, resetPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      throw new AppError(404, "User tidak di temukan");
    }

    const data = {};
    // if (username) data.username = username;
    if (role) {
      // validasi role
      const validRoles = ["admin", "cashier", "staff"];
      if (!validRoles.includes(role)) {
        throw new AppError(400, "Role tidak valid");
      }
      data.role = role;
    }

    if (resetPassword && oldPassword && password) {
      // priksa password lama
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) {
        throw new AppError(400, "Password lama salah, priksa kembali!");
      }
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== "admin") {
      throw new AppError(401, "Akses di tolak");
    }

    const count = await prisma.user.count({
      where: {
        id: Number(userId),
      },
    });

    if (count === 0) {
      throw new AppError(404, "User tidak di temukan");
    }

    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUser, createNewUser, updatedUser, deleteUser };
