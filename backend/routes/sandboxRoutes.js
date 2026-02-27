import express from "express";
import { getTableData } from "../controllers/sandboxController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/table/:tableName", getTableData);

export default router;
