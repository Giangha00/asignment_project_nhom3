const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const cardLabel = require("../controllers/cardLabelController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", cardLabel.list);
router.post("/", cardLabel.create);
router.delete("/:id", cardLabel.remove);

module.exports = router;
