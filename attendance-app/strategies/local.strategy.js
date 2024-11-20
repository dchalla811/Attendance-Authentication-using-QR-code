const LocalStrategy = require("passport-local").Strategy;
const { compareHash } = require("../helpers/crypto.helper");

const { getByEmail, getById } = require("../models/user.model");

module.exports = (passport) => {
  const authenticateUser = async (email, password, done) => {
    const user = await getByEmail(email);
    if (!user) {
      return done(null, false, { message: "No user found with that email." });
    }

    if (user.roleId === 3) {
      return done(null, false, {
        message: "Use attendance android app to login.",
      });
    }

    try {
      if (await compareHash(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password." });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => done(null, await getById(id)));
};
