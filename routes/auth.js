var express = require("express");
var passport = require("passport");
var TwitterStrategy = require("passport-twitter");
var FacebookStrategy = require("passport-facebook");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

var db = require("../db");

// passport.use(
//   new TwitterStrategy(
//     {
//       consumerKey: process.env.TWITTER_CONSUMER_KEY,
//       consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//       callbackURL: "/oauth/callback/twitter",
//     },
//     function (token, tokenSecret, profile, cb) {
//       console.log("profile", profile);
//       var user = {
//         id: 1,
//         name: profile.displayName,
//       };
//       return cb(null, user);
//     }
//   )
// );

console.log(process.env.GOOGLE_CLIENT_ID);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log("profile", profile);
      var user = {
        id: profile.id,
        displayName: profile.displayName,
        username: profile.emails[0].value,
        emails: profile.emails,
        photos: profile.photos,
      };
      return cb(null, user);
    }
  )
);
console.log("clientidtest", process.env["FACEBOOK_CLIENT_ID_TEST"]);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env["FACEBOOK_CLIENT_ID"],
      clientSecret: process.env["FACEBOOK_CLIENT_SECRET"],
      callbackURL:
        "https://todos-express-facebook.onrender.com/oauth2/redirect/facebook",
      state: true,
    },
    function verify(accessToken, refreshToken, profile, cb) {
      console.log("profile", profile);
      var user = {
        id: 1,
        name: profile.displayName,
      };
      return cb(null, user);
      // db.get(
      //   "SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?",
      //   ["https://www.facebook.com", profile.id],
      //   function (err, row) {
      //     if (err) {
      //       return cb(err);
      //     }
      //     if (!row) {
      //       db.run(
      //         "INSERT INTO users (name) VALUES (?)",
      //         [profile.displayName],
      //         function (err) {
      //           if (err) {
      //             return cb(err);
      //           }
      //           var id = this.lastID;
      //           db.run(
      //             "INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)",
      //             [id, "https://www.facebook.com", profile.id],
      //             function (err) {
      //               if (err) {
      //                 return cb(err);
      //               }
      //               var user = {
      //                 id: id,
      //                 name: profile.displayName,
      //               };
      //               return cb(null, user);
      //             }
      //           );
      //         }
      //       );
      //     } else {
      //       db.get(
      //         "SELECT * FROM users WHERE id = ?",
      //         [row.user_id],
      //         function (err, row) {
      //           if (err) {
      //             return cb(err);
      //           }
      //           if (!row) {
      //             return cb(null, false);
      //           }
      //           return cb(null, row);
      //         }
      //       );
      //   }
      // }
      // );
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

var router = express.Router();

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/login/federated/facebook", passport.authenticate("facebook"));
router.get(
  "/oauth2/redirect/facebook",
  passport.authenticate("facebook", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

// router.get("/login/federated/twitter", passport.authenticate("twitter"));
// router.get(
//   "/oauth/callback/twitter",
//   passport.authenticate("twitter", {
//     successReturnToOrRedirect: "/",
//     failureRedirect: "/login",
//   })
// );

router.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
