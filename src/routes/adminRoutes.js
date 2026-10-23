const router = require("express").Router();
const controller = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/users", requireAuth("admin"), controller.listUsers);

module.exports = router;
