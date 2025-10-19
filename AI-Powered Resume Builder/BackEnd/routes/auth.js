const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
// GET current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});
// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, photo, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, password: hashedPassword, photo: photo || '', gender: gender || 'other' });

    res.status(201).json({ message: "User created", userId: newUser._id });
  } catch (err) {
  console.error("❌ Register error:", err); // FULL log
  res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
}
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});
router.get("/photo/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email }).select("photo");
    if (!user || !user.photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    res.json({ photo: user.photo });
  } catch (err) {
    res.status(500).json({ message: "Error fetching photo" });
  }
});



module.exports = router;
module.exports.authMiddleware = authMiddleware;
