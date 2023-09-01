const express = require("express");

const multer = require("multer");
const upload = multer();
const router = express.Router();
const userController = require("../controllers/user_controller");
const authMiddleware = require("../controllers/middlewares/auth_middleware");

// router endpoints
// router.post("/register", userController.register);
router.post(
  "/register",
  upload.single("profilePicture"),
  userController.register
);

router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.viewUserDetails);
router.put("/update", authMiddleware, userController.updateUserDetails);

module.exports = router;
