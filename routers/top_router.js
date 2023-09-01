const express = require("express");
const router = express.Router();
// const reviewController = require("./controllers/review_controller"); // Import your review controller
const topController = require("../controllers/top_controller");
// Other existing routes...

// Define a new route to get the top parks
router.get("/parks", topController.getTopParks);
router.get("/reviews", topController.getTopReviews);

module.exports = router;
