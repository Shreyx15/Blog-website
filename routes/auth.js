const router = require('express').Router();
const { User } = require('./db');
const bcrypt = require('bcryptjs');
const passport = require('passport');
let GoogleStrategy = require('passport-google-oidc').Strategy;


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile']
}, function verify(issuer, profile, cb) {
    User.findOne({ googleID: profile.id })
        .then((user) => {
            if (!user) {
                const newUser = new User({
                    username: profile.displayName,
                    googleID: profile.id,
                    isGoogleLogin: true
                });

                newUser.save()
                    .then(() => cb(null, newUser))
                    .catch((err) => cb(err));

                console.log(profile.displayName);
            } else {
                cb(null, user);
            }
        })
        .catch((err) => {
            console.error(err);
        });
}));


router.get("/login", function (req, res) {
    console.log(process.env.CLIENT_ID);
    res.render("login");
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/login'
}));

router.get("/register", function (req, res) {
    res.render("register");
});

router.post("/login", function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email })
        .then((foundDoc) => {
            bcrypt.compare(password, foundDoc.password, (err, result) => {
                if (!result) {
                    res.send("wrong password");
                } else {
                    req.session.isLoggedin = true;
                    req.session.username = foundDoc.username;
                    req.session.userId = foundDoc._id;
                    req.session.save();
                    res.cookie('sessionId', req.session.id);
                    res.redirect("/home");
                }
            });
        })
        .catch((e) => {
            console.error(e);
        });
});

router.post("/register", function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 10).then(function (hash) {
        const newUser = new User({
            username: username,
            email: email,
            password: hash
        });

        newUser.save()
            .then(() => {
                res.redirect("/login");
            })
            .catch((err) => {
                console.error(err);
            });
    });

});

router.get("/logout", verify, function (req, res) {
    if (!req.session.isGoogleLogin) {
        res.clearCookie('sessionId');
        res.clearCookie('connect.sid');
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
            } else {
                res.redirect("/login");
            }
        });
    } else {
        console.log("here it is");
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('/login');
        });
    }

});


function verify(req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.isAuthenticated());
        req.session.userId = req.user._id;
        req.session.username = req.user.username;
        req.session.isGoogleLogin = true;
        req.session.save();
        next();
    } else if (!isEmpty(req.cookies)) {
        next();
    } else {
        res.redirect("/login");
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = { router, verify };