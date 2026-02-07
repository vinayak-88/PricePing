require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const session = require("express-session");
const passport = require("passport");
const authRouter = require("./routes/auth");

require("./passport");

const app = express();
app.use("/", authRouter);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

const PORT = process.env.PORT;
connectDB()
  .then(() => {
    app.use(
      session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set to true if using HTTPS
          httpOnly: true,
          sameSite: "lax", // Allows cookie to be sent on top-level navigation
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.listen(PORT, () => {
      console.log("server running");
    });
  })
  .catch((err) => {
    console.log("error connecting to the database");
  });
