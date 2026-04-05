const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const comment = require("../controllers/commentController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", comment.list);
router.post("/", comment.create);
router.get("/:id", comment.getOne);
router.patch("/:id", comment.update);
router.delete("/:id", comment.remove);

module.exports = router;
