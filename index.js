const { urlencoded } = require('body-parser');
const { application } = require('express');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const { stringify } = require('nodemon/lib/utils');
app.use(bodyParser.urlencoded({ extended: true }))
const ejs = require("ejs");
app.set('view engine', 'ejs');
app.use(express.static('public'));
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
mongoose.set('strictQuery', false);
require('dotenv').config();
const passport = require('passport');
// This section is for mongoDB database
mongoose.connect('mongodb+srv://Shreyx15:shrey2002@cluster0.8cux0ks.mongodb.net/BLOG?retryWrites=true&w=majority'); // connect to mongoDB localhost
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'this is my secret key for the session!!!', // replace with your own secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // set cookie expiration time (1 hour)
}));
app.use(passport.authenticate('session'));


const { router, verify } = require('./routes/auth');
const compose = require("./routes/compose");
const postspage = require("./routes/posts");

app.use("/", router);
app.use("/", compose);
app.use("/", postspage);

app.listen(3000, function () {
    console.log("port is active now!");
});
