const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const workspaceMember = require("../controllers/workspaceMemberController");

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);
router.get("/", workspaceMember.list);
router.post("/", workspaceMember.add);
router.patch("/:id", workspaceMember.update);
router.delete("/:id", workspaceMember.remove);

module.exports = router;
