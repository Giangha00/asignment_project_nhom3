const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const card = require("../controllers/cardController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", card.list);
router.post("/", card.create);
router.get("/:id", card.getOne);
router.patch("/:id", card.update);
router.delete("/:id", card.remove);

module.exports = router;
