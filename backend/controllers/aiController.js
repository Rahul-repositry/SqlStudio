import asyncHandler from "../utils/asyncHandler.js";
import Assignment from "../models/Assignment.js";
import { generateSqlHint } from "../services/aiService.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../error/AppError.js";

// @desc    Get an AI-generated hint for a specific assignment
export const getHint = asyncHandler(async (req, res, next) => {
  const { assignmentId, currentQuery } = req.body;

  if (!currentQuery || currentQuery.trim() === "") {
    return next(
      new AppError(
        "Please write some SQL first before asking for a hint.",
        400,
      ),
    );
  }

  // 1. Fetch the assignment details to give context to the AI
  const assignment = await Assignment.findById(assignmentId);
  console.log("Fetched Assignment for Hint:", assignment);
  if (!assignment) {
    return next(new AppError("Assignment not found.", 404));
  }

  const schemaContext = assignment.sampleDataViewer
    .map((table) => {
      return `Table: ${table.tableName}, Columns: [${table.columns.join(", ")}]`;
    })
    .join(" | ");

  const hintText = await generateSqlHint(
    assignment.question,
    currentQuery,
    schemaContext,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, { hint: hintText }, "Hint generated successfully"),
    );
});
