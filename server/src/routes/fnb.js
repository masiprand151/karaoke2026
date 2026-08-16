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
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

// Ambil daftar F&B
route.get("/", protectedAuth, getAllFnbs);
// managemen
route.post("/", protectedAuth, protectedAdmin, createNewFnb);
route.put("/:fnbId", protectedAuth, protectedAdmin, editFnb);
route.delete("/:fnbId", protectedAuth, protectedAdmin, deleteFnb);
// Tambah purchase + update stok
route.post("/purchase", protectedAuth, protectedAdmin, purchase);
// order
route.post("/order", protectedAuth, orders);
route.put("/order/:id", protectedAuth, updateOrder);
// hapus order / void
route.delete("/order/:id", protectedAuth, protectedAdmin, voidOrder);

module.exports = route;
