const {
  getAllFnbs,
  createNewFnb,
  editFnb,
  deleteFnb,
  orders,
  updateOrder,
  voidOrder,
  purchase,
} = require("../controllers/fnb.controller");
const { protectedAuth } = require("../middleware/auth.middleware");
const route = require("express").Router();

// Ambil daftar F&B
route.get("/", protectedAuth(), getAllFnbs);
// managemen
route.post("/", protectedAuth("admin"), createNewFnb);
route.put("/:fnbId", protectedAuth("admin"), editFnb);
route.delete("/:fnbId", protectedAuth("admin"), deleteFnb);
// Tambah purchase + update stok
route.post("/purchase", protectedAuth("admin"), purchase);
// order
route.post("/order", protectedAuth(), orders);
route.put("/order/:id", protectedAuth(), updateOrder);
// hapus order / void
route.delete("/order/:id", protectedAuth("admin"), voidOrder);

module.exports = route;
