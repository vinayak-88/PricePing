const express = require("express");
const authRouter = express.Router();
const passport = require("passport");

const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 403 Forbidden or 400 Bad Request if it's an API-style call
    // Or just redirect them to the dashboard
    return res.redirect('http://localhost:3000'); 
  }
  next();
};

authRouter.get(
  "/auth/google",redirectIfAuthenticated,
  passport.authenticate("google", { scope: ["openid","profile", "email"] })
);

authRouter.get(
  "/auth/google/callback",redirectIfAuthenticated,
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Always go back to main page
    res.redirect("/");
  }
);


authRouter.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = authRouter;
