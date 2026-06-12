import validator from "validator";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../config/stream.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const idx = Math.floor(Math.random() * 1000) + 1;
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}&backgroundColor=ffd5dc&style=circle`;

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image: randomAvatar,
    });

    try {
          await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.image || "",
    });

    console.log(`Stream user upserted for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error upserting stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevent XSS Attacks
      sameSite: "strict", //CSRF Protection
      secure: process.env.NODE_ENV === "production", //Use secure cookies in production
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevent XSS Attacks
      sameSite: "strict", //CSRF Protection
      secure: process.env.NODE_ENV === "production", //Use secure cookies in production
    });
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, skill, language, location } = req.body;
    if (!fullName || !bio || !skill || !language || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !skill && "skill",
          !language && "language",
          !location && "location",
        ].filter(Boolean),
      });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true },
    );

    if (!updateUser) {
      return res
        .status(404)
        .json({ message: "User not found" });
    }
        try {
          await upsertStreamUser({
      id: updateUser._id.toString(),
      name: updateUser.fullName,
      image: updateUser.image || "",
    });

    console.log(`Stream user updated for ${updateUser.fullName}`);
    } catch (error) {
      console.log("Error updating stream user:", error);
    }

    res.status(200).json({user: updateUser});
  } catch (error) {
    console.log("Error in onboard controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
