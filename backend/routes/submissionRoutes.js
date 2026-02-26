import express from "express";
import {
  executeAndSubmit,
  getMySubmissions,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All submission routes must be protected
router.use(protect);

router.post("/execute", executeAndSubmit);
router.get("/:assignmentId", getMySubmissions);

export default router;
