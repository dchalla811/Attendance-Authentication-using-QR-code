const loginView = (req, res, next) => {
  res.render("auth/index");
};

module.exports = {
  loginView,
};
