import express from "express";
import { getHint } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/hint", protect, getHint);

export default router;
