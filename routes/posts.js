const router = require('express').Router();
const { verify } = require('./auth');
const { Blog, User } = require('./db');
const { default: mongoose, mongo } = require('mongoose');
const passport = require('passport');

router.get("/home", verify, async function (req, res) {
    let author = req.session.userId;
    author = typeof author === 'object' ? author : mongoose.Types.ObjectId(author);
    let username = req.session.username;

    const followingUserIDs = await User.findById(author);
    const followingList = followingUserIDs.following;

    const followingBlogsArr = [];
    const myBlogs = [];
    // Fetch the blogs of the users whom the current user is following
    const followingBlogs = await Blog.find({ author: { $in: followingList } })
        .sort({ timestamp: -1 }) // Sort the blogs by timestamp in descending order
        .populate("author"); //


    // Push the blogs of the users whom the current user is following into the array
    followingBlogs.forEach(blog => {
        followingBlogsArr.push({
            _id: blog.author,
            title: blog.title,
            content: blog.content,
            author: blog.author.username,
            timestamp: blog.timestamp
        });
    });
    const myBlog = await Blog.find({ author: author })
        .sort({ timestamp: -1 }) // Sort the blogs by timestamp in descending order
        .populate("author");

    myBlog.forEach(blog => {
        myBlogs.push({
            _id: blog._id,
            title: blog.title,
            content: blog.content,
            author: blog.author.username,
            timestamp: blog.timestamp
        });
    });

    res.render("home", { 'followingBlogs': followingBlogsArr, 'myBlogs': myBlogs, 'username': username });
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

router.get('/delete-blog/:blogId', verify, (req, res) => {
    const blogId = req.params.blogId;

    // Perform the deletion operation in your MongoDB using Mongoose
    Blog.findByIdAndDelete(blogId)
        .then(() => {
            // If the deletion is successful, send a success response
            res.json({ success: true, message: 'Blog deleted successfully' });
        })
        .catch((err) => {
            // If an error occurs, send an error response
            res.status(500).json({ success: false, message: 'Error deleting blog', error: err });
        });
});

router.get("/unfollow/:personId", verify, async function (req, res) {
    try {
        let personData = req.params.personId;
        const userId = req.session.userId;
        const start = personData.indexOf('ObjectId("') + 'ObjectId("'.length;
        const end = personData.indexOf('")', start);
        const objectIdString = personData.substring(start, end);
        const user = await User.findById(userId);

        personId = mongoose.Types.ObjectId(objectIdString);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already following the person
        if (user.following.includes(personId)) {
            // Remove the personId from the following array
            user.following.pull(personId);

            // Save the updated user
            await user.save();

            res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            res.status(400).json({ error: "User is not following the person" });
        }
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ error: "An error occurred while unfollowing user" });
    }
});


module.exports = router;