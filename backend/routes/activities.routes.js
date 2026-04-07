const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const activity = require("../controllers/activityController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", activity.list);
router.post("/", activity.create);
router.get("/:id", activity.getOne);
router.delete("/:id", activity.remove);

module.exports = router;
