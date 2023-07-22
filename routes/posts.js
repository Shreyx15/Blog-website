const router = require('express').Router();
const { verify } = require('./auth');
const { Blog, User } = require('./db');
const { default: mongoose } = require('mongoose');

router.get("/home", verify, function (req, res) {
    let author = req.session.userId;
    author = mongoose.Types.ObjectId(author);
    let username = req.session.username;
    console.log(author, username);
    Blog.find({ author: author })
        .then((docs) => {
            res.render("home", { 'dataFromBody': docs, 'username': username });
        })
        .catch((e) => {
            console.error(e);
        });
});

router.get("/search-users", verify, async function (req, res) {
    const searchQuery = req.query.query.toLowerCase().trim();

    if (!searchQuery) {
        return res.json([]);
    }

    try {
        // Find users whose username contains the search query

        const matchedUsers = await User.find({
            username: { $regex: searchQuery, $options: "i" },
        });
        res.json(matchedUsers);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

});


router.post("/add-following", verify, async function (req, res) {
    const currentUserID = req.session.userId;
    const userToFollowID = req.body.userToFollowID;

    try {
        // Find the current user and update their following list
        const currentUser = await User.findByIdAndUpdate(
            currentUserID,
            { $addToSet: { following: userToFollowID } },
            { new: true }
        );

        res.json(currentUser);
    } catch (error) {
        console.error("Error adding user to following list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;