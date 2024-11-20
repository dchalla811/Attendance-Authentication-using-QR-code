if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const createError = require("http-errors");
const express = require("express");
const expressSession = require("express-session");
const flash = require("express-flash");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const initializeLocalStrategy = require("./strategies/local.strategy");
const prisma = require("./prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const instructorRouter = require("./routes/instructor");
const apiRouter = require("./routes/api");

const app = express();

// Passport configuration
initializeLocalStrategy(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  expressSession({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // prune expired sessions every 2 minutes
      dbRecordIdIsSessionId: false,
      dbRecordIdFunction: undefined,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/instructor", instructorRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
