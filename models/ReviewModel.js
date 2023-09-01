const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      username: { type: String, required: true },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
    },
    text: { type: String, required: true },
    imageUrl: String,
    location: String,
    parkCode: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
