const {
  checkin,
  freeMinute,
  editDuration,
  extendDuration,
  preview,
  checkout,
  payment,
  discountRoom,
} = require("../controllers/session.controller");
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

route.post("/checkin", protectedAuth, checkin);
route.post("/free-minute", protectedAuth, freeMinute);
route.put("/duration", protectedAuth, editDuration);
route.post("/extend", protectedAuth, extendDuration);
route.get("/preview/:sessionId", protectedAuth, preview);
route.post("/checkout/:sessionId", protectedAuth, checkout);
route.post("/payment/:transactionId", protectedAuth, payment);
route.post("/discount", protectedAuth, protectedAdmin, discountRoom);

module.exports = route;
