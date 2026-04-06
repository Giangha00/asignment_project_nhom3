const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const label = require("../controllers/labelController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", label.list);
router.post("/", label.create);
router.get("/:id", label.getOne);
router.patch("/:id", label.update);
router.delete("/:id", label.remove);

module.exports = router;
