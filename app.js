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

// array to store the posts(It is an array of objects)


// Home content
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


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

const { router, verify } = require('./routes/auth');
const compose = require("./routes/compose");
const postspage = require("./routes/posts");

app.use("/", router);
app.use("/", compose);
app.use("/", postspage);

app.listen(3000, function () {
    console.log("port is active now!");
});
