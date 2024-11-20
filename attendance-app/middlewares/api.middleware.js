const { verifyToken } = require("../helpers/jwt.helper");
const { getStudentById } = require("../models/user.model");

const publicUrls = ["/auth"];

const apiMiddleware = async (req, res, next) => {
  console.log("API Middleware");

  if (publicUrls.includes(req.url)) {
    return next();
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = req.headers.authorization.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await getStudentById(payload.sub);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  user.student = { ...user.student[0] };
  delete user.password;
  req.user = user;

  next();
};

module.exports = {
  apiMiddleware,
};
