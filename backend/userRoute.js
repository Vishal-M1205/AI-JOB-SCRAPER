import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./model.js";

import auth from './auth.js';

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    email = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token });
  } catch {
    res.status(500).json({ error: "Signup failed" });
  }
});


router.get("/verify", auth, (req, res) => {
  res.status(200).json({
    valid: true,
    user: {
      userId: req.userData.userId,
      username: req.userData.username
    }
  });
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

 const token = jwt.sign(
  { userId: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);


    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;


