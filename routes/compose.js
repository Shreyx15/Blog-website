const router = require('express').Router();
const { default: mongoose } = require('mongoose');
const { verify } = require('./auth');
const { User, Blog } = require('./db');

router.get("/compose", function (req, res) {
    res.render("compose");
});


router.post("/compose", verify, function (req, res) {
    const composeTitle = req.body.Title;
    const composeContent = req.body.Post;
    let author = req.session.userId;
    author = mongoose.Types.ObjectId(author);
    console.log(composeTitle, composeContent, author);

    const newBlog = new Blog({
        title: composeTitle,
        content: composeContent,
        author: author
    });

    newBlog.save()
        .then(() => {
            console.log("done");
        })
        .catch((er) => {
            console.error(er);
        });
    res.redirect("/home");
});

module.exports = router;