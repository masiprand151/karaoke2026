const {
  getAllLadies,
  createNewLady,
  editLady,
  deleteLady,
  order,
  updateOrderLady,
  deleteOrderLady,
  stopLady,
} = require("../controllers/lady.controller");
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

// get all
route.get("/", protectedAuth, getAllLadies);
// managemen
// create new lADY
route.post("/", protectedAuth, protectedAdmin, createNewLady);
route.put("/:ladyId", protectedAuth, protectedAdmin, editLady);
// delete lady
route.delete("/:ladyId", protectedAuth, protectedAdmin, deleteLady);
// transactin
// Order Lady untuk session (tanpa tax & service)
route.post("/order", protectedAuth, order);

route.put("/order/:id", protectedAuth, updateOrderLady);

route.delete("/order/:id", protectedAuth, protectedAdmin, deleteOrderLady);

route.patch("/:ladyId/off", protectedAuth, stopLady);

module.exports = route;
