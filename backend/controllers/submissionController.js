import pool from "../config/postgres.js";
import Submission from "../models/Submission.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../error/AppError.js";
import Assignment from "../models/Assignment.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Execute SQL and Save/Update Submission
export const executeAndSubmit = asyncHandler(async (req, res, next) => {
  const { assignmentId, sqlQuery } = req.body;
  const userId = req.user._id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return next(new AppError("Assignment not found", 404));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(sqlQuery);

    const solutionResult = await client.query(assignment.solutionQuery);

    const snapshot = await client.query(
      `SELECT * FROM ${assignment.targetTable} LIMIT 10`,
    );

    await client.query("ROLLBACK");

    const isCorrect = compareResultSets(userResult.rows, solutionResult.rows);

    const submissionData = {
      lastQuery: sqlQuery,
      status: isCorrect ? "solved" : "attempted",
    };

    if (isCorrect) {
      submissionData.solvedAt = Date.now();
    }

    const submission = await Submission.findOneAndUpdate(
      { user: userId, assignment: assignmentId },
      { $set: submissionData },
      { upsert: true, new: true },
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          rows: snapshot.rows,
          rowCount: userResult.rowCount,
          isSolved: submission.status === "solved",
          submissionId: submission._id,
          expectedRows: solutionResult.rowCount,
        },
        isCorrect
          ? "Correct! Assignment solved."
          : "Query executed but results don't match expected output.",
      ),
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return next(new AppError(`SQL Error: ${err.message}`, 400));
  } finally {
    client.release();
  }
});

function compareResultSets(userRows, solutionRows) {
  if (userRows.length !== solutionRows.length) return false;

  if (userRows.length === 0) return true;

  const userSet = new Set(
    userRows.map((row) => JSON.stringify(row, Object.keys(row).sort())),
  );
  const solutionSet = new Set(
    solutionRows.map((row) => JSON.stringify(row, Object.keys(row).sort())),
  );

  for (const userRow of userSet) {
    if (!solutionSet.has(userRow)) return false;
  }

  return true;
}
// @desc    Get user's progress/history for a specific assignment
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    user: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, submissions, "Submission history retrieved"));
});
