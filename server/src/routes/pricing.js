const {
  getAllPackages,
  createNewPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/pricing.controller");
const { protectedAuth } = require("../middleware/auth.middleware");
const route = require("express").Router();

route.get("/package", protectedAuth(), getAllPackages);

route.post("/", protectedAuth("admin"), createNewPackage);

route.put("/:pricingId/package", protectedAuth("admin"), updatePackage);

route.delete("/:pricingId/package", protectedAuth("admin"), deletePackage);

module.exports = route;
