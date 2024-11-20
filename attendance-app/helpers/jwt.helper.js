const { sign, verify } = require("jsonwebtoken");
const generateToken = async (payload, expiresIn) => {
  return await sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const verifyToken = async (token) => {
  try {
    return await verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("Token expired!");
  }
  return null;
};

module.exports = {
  generateToken,
  verifyToken,
};
