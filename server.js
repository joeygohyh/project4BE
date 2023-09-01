// backend/server.js
const express = require("express");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
// const session = require("express-session");
// const upload = multer();
// const upload = multer({ storage: multer.memoryStorage() });

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const userRouter = require("./routers/user_router");
const reviewRouter = require("./routers/review_router");
const topRouter = require("./routers/top_router");
// const { default: TopParks } = require("../fe/fe/src/components/top");

// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: "dnhp6vxxw",
//   api_key: "628253972245848",
//   api_secret: "Cf8gMmBqfLi5CK_7gb5qVkLyyT0",
// });

const app = express();
const port = 3005;

// app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);
app.options("*", cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("uploads"));

// API endpoint routes
app.use("/api/user", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/top", topRouter);

// app.post("/api/cloudinary/upload", upload.single("image"), async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "auto" },
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         }
//       );

//       stream.write(file.buffer);
//       stream.end();
//     });

//     res.json({ imageUrl: result.secure_url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// Listener
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("DataBase connected");

    // boot up app
    app.listen(port, () => {
      console.log("GitPub running on port: ", port);
    });
  })
  .catch((err) => {
    console.log("error when connecting: " + err);
  });
