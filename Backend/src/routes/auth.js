const express = require("express");
const authRouter = express.Router();
const passport = require("passport");
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: 'Too many authentication attempts, please try again later'
});

const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 403 Forbidden or 400 Bad Request if it's an API-style call
    // Or just redirect them to the dashboard
    return res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
  }
  next();
};

authRouter.get(
  "/auth/google",authLimiter,
  redirectIfAuthenticated,
  passport.authenticate("google", { scope: ["openid", "profile", "email"] }),
);

authRouter.get(
  "/auth/google/callback",authLimiter,
  redirectIfAuthenticated,
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Always go back to main page
    res.redirect("/");
  },
);

authRouter.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = authRouter;
