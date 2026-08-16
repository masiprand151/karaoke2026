const {
  getAllRooms,
  getCurrentRoom,
  moveRoom,
} = require("../controllers/room.controller");
const { protectedAuth } = require("../middleware/auth.middleware");
const route = require("express").Router();

route.get("/", protectedAuth(), getAllRooms);
route.get("/:id", getCurrentRoom);
route.post("/move", protectedAuth(), moveRoom);

module.exports = route;
