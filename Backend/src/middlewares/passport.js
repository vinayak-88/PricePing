const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try{
        let user = await User.findOne({authId : profile.id});
        if(!user) {
          user = await User.create({
            authId : profile.id,
            name : profile.displayName,
            emailId : profile.emails[0].value
          })
        }
        return done(null, user);
      }
      catch(err){ return done(err, null)};
    }
  )
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
