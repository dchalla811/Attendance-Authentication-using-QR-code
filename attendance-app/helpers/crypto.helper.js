const crypto = require("crypto");
const { hash, compare } = require("bcrypt");

const generateRandomString = (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

const hashString = async (str) => {
  return await hash(str, 10);
};

const compareHash = async (str, hash) => {
  return await compare(str, hash);
};

module.exports = { generateRandomString, hashString, compareHash };
