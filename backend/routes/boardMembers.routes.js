const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const boardMember = require("../controllers/boardMemberController");

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);
router.get("/", boardMember.list);
router.post("/", boardMember.add);
router.patch("/:id", boardMember.update);
router.delete("/:id", boardMember.remove);

module.exports = router;
