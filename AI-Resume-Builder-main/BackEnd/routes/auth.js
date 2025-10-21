const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({
    message: "No token provided"
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId
    }; // Attach user object
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

// GET current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({
      message: "User not found"
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      photo,
      gender
    } = req.body;

    const existingUser = await User.findOne({
      email
    });

    if (existingUser) {
      // If user exists and is already verified, block registration
      if (existingUser.emailVerified) {
        return res.status(400).json({ message: "User with this email already exists." });
      }

      // If user exists but is not verified, resend verification code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.emailVerificationCode = newVerificationCode;
      // Optionally update other details if you want to allow it
      // existingUser.fullName = fullName;
      // existingUser.password = await bcrypt.hash(password, 10);
      await existingUser.save();

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      const mailOptions = {
        from: `"ResuAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email Address",
        html: `<p>Please use the following new verification code to complete your registration:</p><b>${newVerificationCode}</b>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "User already exists but is not verified. A new verification code has been sent." });
    }

    // If user does not exist, create a new one
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      photo: photo || '',
      gender: gender || 'other',
      emailVerificationCode: verificationCode,
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ResuAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `<p>Please use the following verification code to complete your registration:</p><b>${verificationCode}</b>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User created. Verification code sent to email.",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("❌ Register error:", err); // FULL log
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: err.stack
    });
  }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.emailVerificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    await user.save();

    // After successful verification, generate a token to log the user in
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({ message: "Email verified successfully", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user = await User.findOne({
      email
    });
    if (!user) return res.status(400).json({
      message: "Invalid credentials"
    });

    if (!user.emailVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Invalid credentials"
    });

    const token = jwt.sign({
      userId: user._id
    }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.status(200).json({
      token,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err
    });
  }
});
router.get("/photo/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({
      email
    }).select("photo");
    if (!user || !user.photo) {
      return res.status(404).json({
        message: "Photo not found"
      });
    }
    res.json({
      photo: user.photo
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching photo"
    });
  }
});



module.exports = router;
module.exports.authenticateToken = authenticateToken;
