const express = require("express");
const { loginController, registerController, profileController, getAllUsers, getUserById } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();




router.post("/login", loginController);
router.post("/register", registerController);
router.get("/profile", authMiddleware, profileController);
router.get("/internal/users/:id", getUserById);
// Already exists, works as-is
router.get("/", authMiddleware, getAllUsers);

module.exports = router;

