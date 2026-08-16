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

route.get("/", protectedAuth(), getAllUser);

route.post("/", protectedAuth("admin"), createNewUser);
// update user
route.put("/:userId", protectedAuth("admin"), updatedUser);
// delete user
route.delete("/:userId", protectedAuth("admin"), deleteUser);

module.exports = route;
