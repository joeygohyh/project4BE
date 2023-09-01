const express = require("express");
const multer = require("multer");

// Set up storage for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/UserModel");
const userRegistrationValidators = require("./validators/userRegistrationValidator");
const userLoginValidators = require("./validators/userLoginValidator");
const editProfileValidators = require("./validators/editProfileValidator");

const userControllers = {
  // register: async (req, res) => {
  //   // get the registration data
  //   const data = req.body;

  //   // validate the registration data
  //   const validationResult =
  //     userRegistrationValidators.registerSchema.validate(data);
  //   if (validationResult.error) {
  //     res.statusCode = 400;

  //     return res.json({
  //       msg: validationResult.error.details[0].message,
  //     });
  //   }

  //   // search for any existing registered email, return err if so
  //   try {
  //     const user = await userModel.findOne({ email: data.email });
  //     if (user) {
  //       res.statusCode = 400;
  //       return res.json({
  //         msg: "user with email exists, use another email",
  //       });
  //     }
  //   } catch (err) {
  //     res.statusCode = 500;
  //     return res.json({
  //       msg: "failed to check for duplicates",
  //     });
  //   }

  //   // apply hashing algo (bcrypt) to given password. Harsh the pw & store in DB
  //   const hash = await bcrypt.hash(data.password, 10);

  //   // use user model to create a new user
  //   try {
  //     await userModel.create({
  //       profilePicture: data.profilePicture,
  //       name: data.name,
  //       username: data.username,
  //       email: data.email,
  //       password: hash,
  //       country: data.country, // Add country field
  //       gender: data.gender, // Add gender field
  //     });
  //   } catch (err) {
  //     res.statusCode = 500;
  //     return res.json({
  //       msg: "failed to create user",
  //     });
  //   }

  //   // return response
  //   res.json();
  // },

  register: async (req, res) => {
    // Get the registration data from the request body
    const data = req.body;

    // Validate the registration data
    const validationResult =
      userRegistrationValidators.registerSchema.validate(data);
    if (validationResult.error) {
      return res.status(400).json({
        msg: validationResult.error.details[0].message,
      });
    }

    try {
      // Check if a user with the same email already exists
      const existingUser = await userModel.findOne({ email: data.email });
      if (existingUser) {
        return res.status(400).json({
          msg: "User with this email already exists. Please use a different email.",
        });
      }

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create a new user object with the registration data
      const newUser = new userModel({
        profilePicture: req.file.buffer, // Store the profile picture data
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        country: data.country, // Add country field
        gender: data.gender, // Add gender field
      });

      // Save the new user to the database
      await newUser.save();

      // Return a success response
      res.json({
        msg: "User registered successfully.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: "Failed to register user.",
      });
    }
  },

  login: async (req, res) => {
    // get the login data
    const data = req.body;

    // validate the login data
    const validationResult = userLoginValidators.loginSchema.validate(data);

    if (validationResult.error) {
      res.statusCode = 400;
      return res.json({
        msg: validationResult.error.details[0].message,
      });
    }

    // check if user exists by the user (email), return login error (status 400) if do not exist

    let user = null;

    try {
      user = await userModel.findOne({ email: data.email });
    } catch (err) {
      res.statusCode = 500;
      return res.json({
        msg: "error occurred when fetching user",
      });
    }

    if (!user) {
      res.statusCode = 401;
      return res.json({
        msg: "login failed, please check login details",
      });
    }

    // use bcrypt to compare given password against DB record, return status 401 (unauthorized) if failed

    const validLogin = await bcrypt.compare(data.password, user.password);

    if (!validLogin) {
      res.statusCode = 401;
      return res.json({
        msg: "login failed, please check login details",
      });
    }
    // Log success
    console.log("Login successful");

    // generate JWT using an external lib
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        username: user.username,
      },
      process.env.APP_KEY,
      {
        expiresIn: "10 days",
        audience: "FE",
        issuer: "BE",
        subject: user._id.toString(), // _id from Mongoose is type of ObjectID,
      }
    );

    // return response with JWT
    res.json({
      msg: "login successful",
      token: token,
    });
  },

  viewUserDetails: async (req, res) => {
    const userId = res.locals.authUserID;

    try {
      const user = await userModel.findById(userId);
      if (!user) {
        res.statusCode = 404;
        return res.json({ msg: "User not found" });
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.json({ msg: "Failed to view user details" });
    }
  },
  updateUserDetails: async (req, res) => {
    const userId = res.locals.authUserID;
    const { name, email, password } = req.body;

    // Validate the request body using the updateSchema from editProfileValidators
    const { error: validationError } =
      editProfileValidators.updateSchema.validate(req.body);

    if (validationError) {
      res.statusCode = 400;
      return res.json({ msg: validationError.details[0].message });
    }

    try {
      const user = await userModel.findById(userId);
      if (!user) {
        res.statusCode = 404;
        return res.json({ msg: "User not found" });
      }

      // Update the user details
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
      }

      await user.save();

      res.json({ msg: "User details updated successfully" });
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.json({ msg: "Failed to update user details" });
    }
  },
};
module.exports = userControllers;
