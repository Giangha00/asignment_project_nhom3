const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const cardMember = require("../controllers/cardMemberController");

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);
router.get("/", cardMember.list);
router.post("/", cardMember.add);
router.delete("/:id", cardMember.remove);

module.exports = router;
