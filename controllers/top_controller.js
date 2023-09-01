const reviewModel = require("../models/ReviewModel");

const topController = {
  getTopParks: async (req, res) => {
    try {
      // Fetch all reviews
      const reviews = await reviewModel.find();

      // Group reviews by park code and count the number of reviews for each park
      const parkReviewCounts = {};
      reviews.forEach((review) => {
        if (parkReviewCounts[review.parkCode]) {
          parkReviewCounts[review.parkCode]++;
        } else {
          parkReviewCounts[review.parkCode] = 1;
        }
      });

      // Sort parks based on review count in descending order
      const sortedParks = Object.keys(parkReviewCounts).sort(
        (a, b) => parkReviewCounts[b] - parkReviewCounts[a]
      );

      // Get the top 3 parks
      const topParks = sortedParks.slice(0, 5);

      res.json({ topParks });
    } catch (error) {
      console.error("Error getting top parks:", error);
      res.status(500).json({ error: "Error getting top parks" });
    }
  },

  getTopReviews: async (req, res) => {
    try {
      // Fetch the top 3 reviews with the most likes
      const topReviews = await reviewModel
        .find()
        .sort({ likes: -1 }) // Sort in descending order of likes
        .limit(5); // Limit to the top 5 reviews

      res.json({ topReviews });
    } catch (error) {
      console.error("Error fetching top reviews:", error);
      res.status(500).json({ error: "Error fetching top reviews" });
    }
  },
};

module.exports = topController;
