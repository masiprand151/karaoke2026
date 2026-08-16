const {
  cancel,
  purchase,
  roomDetail,
} = require("../controllers/report.controller");
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

// -------------------- Laporan Pembatalan --------------------
route.get("/cancel", protectedAuth, protectedAdmin, cancel);
// -------------------- Laporan Pembelian --------------------
route.get("/purchase", protectedAdmin, protectedAdmin, purchase);
// -------------------- Laporan Transaksi Room --------------------
route.get("/room/detail", protectedAuth, protectedAdmin, roomDetail);
module.exports = route;
