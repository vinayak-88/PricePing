const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const AppError = require("../utils/Error");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          // Can't create an account without an email
          return done(
            new AppError("No email address returned from Google", 400),
            null,
          );
        }
        let user = await User.findOne({ authId: profile.id });
        if (!user) {
          user = await User.create({
            authId: profile.id,
            name: profile.displayName,
            emailId: email,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Now req.user will be the full DB object
  } catch (err) {
    done(err, null);
  }
});
