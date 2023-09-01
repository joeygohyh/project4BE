const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review_controller");
const authMiddleware = require("../controllers/middlewares/auth_middleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to upload to cloudinary
// router.post("/cloudinary/upload", reviewController.uploadPicture);
router.post(
  "/cloudinary/upload",
  upload.single("image"),
  reviewController.uploadPicture
);

// Endpoint to create a new review
router.post("/create", authMiddleware, reviewController.createReview);
// Endpoint to get a specific review
router.get("/:reviewId", reviewController.getReview);
// Endpoint to get all reviews
router.get("/", reviewController.getAllReviews);
router.post("/:reviewId/like", authMiddleware, reviewController.likeReview);

module.exports = router;
