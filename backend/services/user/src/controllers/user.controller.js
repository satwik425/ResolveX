const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Fields cannot be empty"
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Either email or password is wrong or both"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Either email or password is wrong or both"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.name,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET ,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "Strict" });
    return res.status(200).json({
      message: "User logged in successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error in logging in",
      error: err.message
    });
  }
};

const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Fields cannot be empty"
      });
    }

    const usercheck = await userModel.findOne({ email });
    if (usercheck) {
      return res.status(409).json({
        message: "User exists with current email"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashPassword
    });

    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.name,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET ,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "Strict" });
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error registering user",
      error: err.message
    });
  }
};

const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching profile",
      error: err.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name:  { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await userModel.find(filter, "name email createdAt");
    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  profileController,
  getAllUsers,
  getUserById
};
