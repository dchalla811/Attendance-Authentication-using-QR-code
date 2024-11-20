const createError = require("http-errors");

const protectedRoute = (req, res, next) => {
  console.log("Protected Route");

  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth");
};

const publicRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
};

const dashboardRoute = (req, res) => {
  console.log("Dashboard Route");

  switch (req.user.roleId) {
    case 1:
      res.redirect("/admin");
      break;
    case 2:
      res.redirect("/instructor");
      break;
    default:
      next(createError(401));
  }
};

const adminRoute = (req, res, next) => {
  console.log("Admin Route");

  if (req.user.roleId === 1) {
    return next();
  }

  next(createError(401));
};

const instructorRoute = (req, res, next) => {
  console.log("Instructor Route");

  if (req.user.roleId === 2) {
    return next();
  }

  next(createError(401));
};

module.exports = {
  protectedRoute,
  publicRoute,
  dashboardRoute,
  adminRoute,
  instructorRoute,
};
