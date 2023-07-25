const router = require('express').Router();
const { User } = require('./db');
const bcrypt = require('bcryptjs');

router.get("/login", function (req, res) {
    res.render("login");
});

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
    res.clearCookie('sessionId');
    res.clearCookie('connect.sid');
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            res.redirect("/login");
        }
    });
});


function verify(req, res, next) {
    if (!isEmpty(req.cookies)) {
        next();
    } else {
        res.redirect("/login");
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = { router, verify };