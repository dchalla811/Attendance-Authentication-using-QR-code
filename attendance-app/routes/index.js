const express = require("express");
const {
  protectedRoute,
  dashboardRoute,
} = require("../middlewares/routes.middleware");
const router = express.Router();

router.get("/", protectedRoute, dashboardRoute);

module.exports = router;
