const {
  getAllPackages,
  createNewPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/pricing.controller");
const {
  protectedAuth,
  protectedAdmin,
} = require("../middleware/auth.middleware");
const route = require("express").Router();

route.get("/package", protectedAuth, getAllPackages);

route.post("/", protectedAuth, protectedAdmin, createNewPackage);

route.put("/:pricingId/package", protectedAuth, protectedAdmin, updatePackage);

route.delete(
  "/:pricingId/package",
  protectedAuth,
  protectedAdmin,
  deletePackage,
);

module.exports = route;
