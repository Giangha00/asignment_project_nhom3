const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const workspace = require("../controllers/workspaceController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", workspace.listMine);
router.post("/", workspace.create);
router.get("/:id", workspace.getOne);
router.patch("/:id", workspace.update);
router.delete("/:id", workspace.remove);

module.exports = router;
