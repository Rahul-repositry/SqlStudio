import express from "express";
import {
  getAllAssignments,
  getAssignmentById,
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // Protect all routes below with authentication middleware

router.get("/", getAllAssignments);

router.get("/:id", getAssignmentById);

export default router;
