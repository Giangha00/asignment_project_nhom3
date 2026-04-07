const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const attachment = require("../controllers/attachmentController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", attachment.list);
router.post("/", attachment.create);
router.get("/:id", attachment.getOne);
router.delete("/:id", attachment.remove);

module.exports = router;
