const {
  getAllUser,
  createNewUser,
  updatedUser,
  deleteUser,
} = require("../controllers/user.controller");
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

route.get("/", protectedAuth, getAllUser);

route.post("/", protectedAuth, protectedAdmin, createNewUser);
// update user
route.put("/:userId", protectedAuth, protectedAdmin, updatedUser);
// delete user
route.delete("/:userId", protectedAuth, protectedAdmin, deleteUser);

module.exports = route;
