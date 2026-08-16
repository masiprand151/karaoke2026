const {
  cancel,
  purchase,
  roomDetail,
} = require("../controllers/report.controller");
const { protectedAuth } = require("../middleware/auth.middleware");
const route = require("express").Router();

// -------------------- Laporan Pembatalan --------------------
route.get("/cancel", protectedAuth("admin"), cancel);
// -------------------- Laporan Pembelian --------------------
route.get("/purchase", protectedAuth("admin"), purchase);
// -------------------- Laporan Transaksi Room --------------------
route.get("/room/detail", protectedAuth("admin"), roomDetail);
module.exports = route;
