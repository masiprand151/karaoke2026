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
const { protectedAuth } = require("../middleware/auth.middleware");
const route = require("express").Router();

// get all
route.get("/", protectedAuth(), getAllLadies);
// managemen
// create new lADY
route.post("/", protectedAuth("admin"), createNewLady);
route.put("/:ladyId", protectedAuth("admin"), editLady);
// delete lady
route.delete("/:ladyId", protectedAuth("admin"), deleteLady);
// transactin
// Order Lady untuk session (tanpa tax & service)
route.post("/order", protectedAuth(), order);

route.put("/order/:id", protectedAuth(), updateOrderLady);

route.delete("/order/:id", protectedAuth("admin"), deleteOrderLady);

route.patch("/:ladyId/off", protectedAuth(), stopLady);

module.exports = route;
