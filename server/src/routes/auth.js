const { login } = require("../controllers/auth.controller");
const route = require("express").Router();

// Login user
route.post("/login", login);

module.exports = route;
