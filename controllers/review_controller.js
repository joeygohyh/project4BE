const reviewModel = require("../models/ReviewModel");
const userModel = require("../models/UserModel");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnhp6vxxw",
  api_key: "628253972245848",
  api_secret: "Cf8gMmBqfLi5CK_7gb5qVkLyyT0",
});

const reviewController = {
  uploadPicture: async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.write(file.buffer);
        stream.end();
      });

      res.json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error("Error uploading picture:", error);
      res
        .status(500)
        .json({ error: "An error occurred while uploading the picture" });
    }
  },

  createReview: async (req, res) => {
    const userID = res.locals.authUserID;
    try {
      const { text, imageUrl, location, parkCode } = req.body;
      const user = await userModel.findById(userID);

      // Assuming you've set the user information in req.user during authentication
      const username = user.username; // Get the authenticated user's username from req.user
      const gender = user.gender; // Get the authenticated user's gender from req.user

      const review = await reviewModel.create({
        user: { username, gender }, // Set the username and gender in the user field
        text,
        imageUrl,
        location,
        parkCode,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },

  getReview: async (req, res) => {
    const reviewId = req.params.reviewId;

    try {
      const review = await reviewModel
        .findById(reviewId)
        .populate("user", "username country gender")
        .exec();

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Error fetching review" });
    }
  },

  getAllReviews: async (req, res) => {
    try {
      const reviews = await reviewModel
        .find()
        .populate("user", "username country gender")
        .exec();

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Error fetching reviews" });
    }
  },
  likeReview: async (req, res) => {
    // const reviewId = req.params.reviewId;
    const reviewId = req.params.reviewId;
    // const userId = res.locals.authUserID;

    try {
      // console.log("Review ID:", reviewId);
      const review = await reviewModel.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      const userId = res.locals.authUserID;

      if (review.likedBy.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You have already liked this review." });
      }

      review.likes++; // Increment the number of likes
      review.likedBy.push(userId);
      // review.likedBy.push(res.locals.authUserID);
      const updatedReview = await review.save();

      res.json(updatedReview);
    } catch (error) {
      console.error("Error liking review:", error);
      res.status(500).json({ message: "Error liking review" });
    }
  },
};

module.exports = reviewController;
