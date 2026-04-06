const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const otp = require("../controllers/otpController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", otp.listMine);
router.post("/", otp.create);
router.get("/:id", otp.getOne);
router.patch("/:id", otp.update);
router.delete("/:id", otp.remove);

module.exports = router;
