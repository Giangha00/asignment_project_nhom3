const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const boardList = require("../controllers/boardListController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", boardList.list);
router.post("/", boardList.create);
router.get("/:id", boardList.getOne);
router.patch("/:id", boardList.update);
router.delete("/:id", boardList.remove);

module.exports = router;
