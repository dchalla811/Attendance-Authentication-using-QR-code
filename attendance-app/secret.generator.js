const { generateRandomString } = require("./helpers/crypto.helper");

const generateSecret = (length) => {
  const sessionSecret = generateRandomString(length);
  const jwtSecret = generateRandomString(length);

  console.log(`Session secret: ${sessionSecret}`);
  console.log(`JWT secret: ${jwtSecret}`);
};

generateSecret(64);
