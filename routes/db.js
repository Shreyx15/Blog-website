const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        required: function () {
            return !this.isGoogleLogin;
        },
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleLogin;
        }
    },
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isGoogleLogin: {
        type: Boolean,
        require: true,
        default: false
    },
    googleID: {
        type: String,
        required: function () {
            return this.isGoogleLogin;
        }
    }
});


const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
});



const Blog = mongoose.model('Blog', blogSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Blog, User };
