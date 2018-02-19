const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: "Please enter a store name!"
        },
        slug: String,
        description: {
            type: String,
            trim: true
        },
        tags: [String],
        created: {
            type: Date,
            default: Date.now
        },
        location: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: [
                {
                    type: Number,
                    required: "You must supply coordinates!"
                }
            ],
            address: {
                type: String,
                required: "You must supply an address!"
            }
        },
        photo: String
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

storeSchema.index({
    location: "2dsphere"
});

storeSchema.pre("save", async function(next) {
    if (!this.isModified("name")) {
        next(); // skip it
        return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if (storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
    // TODO make more resiliant so slugs are unique
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};
storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        { $lookup: { from: "reviews", localField: "_id", foreignField: "store", as: "reviews" } },
        { $match: { "reviews.1": { $exists: true } } },
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" }
            }
        },
        {
            $sort: {
                averageRating: -1
            }
        },
        { $limit: 10 }
    ]);
};

storeSchema.virtual("reviews", {
    ref: "Review", //Model to link
    localField: "_id", //field on the store
    foreignField: "store" //field on the review
});

storeSchema.index({
    name: "text",
    description: "text"
});

function findReviews(next) {
    this.populate("reviews");
    next();
}

storeSchema.pre("find", findReviews);
storeSchema.pre("findOne", findReviews);

module.exports = mongoose.model("Store", storeSchema);
