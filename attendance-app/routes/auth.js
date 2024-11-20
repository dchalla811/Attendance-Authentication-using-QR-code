const express = require("express");
const { loginView } = require("../controllers/auth/index.controller");
const passport = require("passport");
const { publicRoute } = require("../middlewares/routes.middleware");
const router = express.Router();

router.get("/", publicRoute, loginView);

router.post(
  "/",
  publicRoute,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/auth");
  });
});

module.exports = router;
