const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const user = require("../controllers/userController");

const router = express.Router();
router.use(authMiddleware);
router.get("/me", user.getMe);
router.patch("/me", user.updateMe);
router.post("/me/password-change/send-otp", user.sendPasswordChangeOtp);
router.patch("/me/password", user.changePasswordWithOtp);
router.get("/", user.list);
router.get("/:id", user.getById);
router.delete("/:id", user.remove);

module.exports = router;
