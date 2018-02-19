const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const reviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: "Must supply an author"
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: "Store",
        required: "Must supply a store!"
    },
    text: {
        type: String,
        required: "Must supply review"
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});

function findAuthor(next) {
    this.populate("author");
    next();
}
reviewSchema.pre("find", findAuthor);
reviewSchema.pre("findOne", findAuthor);

module.exports = mongoose.model("Review", reviewSchema);
