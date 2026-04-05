const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const board = require("../controllers/boardController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", board.listByWorkspace);
router.post("/", board.create);
router.get("/:id", board.getOne);
router.patch("/:id", board.update);
router.delete("/:id", board.remove);

module.exports = router;
