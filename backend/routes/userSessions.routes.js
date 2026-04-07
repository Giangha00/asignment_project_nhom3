const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const session = require("../controllers/sessionController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", session.listMine);
router.get("/:id", session.getOne);
router.patch("/:id/revoke", session.revoke);
router.delete("/:id", session.remove);

module.exports = router;
