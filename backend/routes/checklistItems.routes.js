const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const checklistItem = require("../controllers/checklistItemController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", checklistItem.list);
router.post("/", checklistItem.create);
router.get("/:id", checklistItem.getOne);
router.patch("/:id", checklistItem.update);
router.delete("/:id", checklistItem.remove);

module.exports = router;
