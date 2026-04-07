const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const checklist = require("../controllers/checklistController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", checklist.list);
router.post("/", checklist.create);
router.get("/:id", checklist.getOne);
router.patch("/:id", checklist.update);
router.delete("/:id", checklist.remove);

module.exports = router;
