import pool from "../config/postgres.js";
import Submission from "../models/Submission.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../error/AppError.js";
import Assignment from "../models/Assignment.js";
import ApiResponse from "../utils/apiResponse.js";

// @desc    Execute SQL and Save/Update Submission

function doesOrderMatter(solutionQuery) {
  const cleaned = solutionQuery.toLowerCase();
  return cleaned.includes("order by");
}
function validateSqlQuery(sql) {
  const cleaned = sql.trim().toLowerCase();

  // Block multi-statements
  if (cleaned.includes(";") && !cleaned.endsWith(";")) {
    throw new Error("Multiple statements are not allowed.");
  }

  // Block dangerous keywords
  const forbidden = ["drop", "truncate", "alter", "create"];

  for (const word of forbidden) {
    if (cleaned.includes(word)) {
      throw new Error(`Keyword "${word}" is not allowed.`);
    }
  }

  return true;
}
export const executeAndSubmit = asyncHandler(async (req, res, next) => {
  const { assignmentId, sqlQuery } = req.body;
  const userId = req.user._id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return next(new AppError("Assignment not found", 404));

  try {
    validateSqlQuery(sqlQuery);
  } catch (err) {
    return next(new AppError(err.message, 400));
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(sqlQuery);
    const solutionResult = await client.query(assignment.solutionQuery);

    await client.query("ROLLBACK");
    const orderMatters = doesOrderMatter(assignment.solutionQuery);
    const isCorrect = compareResultSets(
      userResult.rows,
      solutionResult.rows,
      orderMatters,
    );

    const submission = await Submission.findOneAndUpdate(
      { user: userId, assignment: assignmentId },
      {
        $set: {
          lastQuery: sqlQuery,
          status: isCorrect ? "solved" : "attempted",
          ...(isCorrect && { solvedAt: Date.now() }),
        },
      },
      { upsert: true, new: true },
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          rowCount: userResult.rowCount,
          expectedRows: solutionResult.rowCount,
          isSolved: isCorrect,
          submissionId: submission._id,
          result: userResult.rows,
        },
        isCorrect
          ? "Correct! Assignment solved."
          : "Query executed but results don't match expected output.",
      ),
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return next(new AppError("Invalid or unsafe SQL query.", 400));
  } finally {
    client.release();
  }
});
function compareResultSets(userRows, solutionRows, orderMatters) {
  if (userRows.length !== solutionRows.length) return false;

  if (!orderMatters) {
    const normalize = (rows) => rows.map((r) => JSON.stringify(r)).sort();

    return (
      JSON.stringify(normalize(userRows)) ===
      JSON.stringify(normalize(solutionRows))
    );
  }

  // Order-sensitive
  for (let i = 0; i < userRows.length; i++) {
    if (JSON.stringify(userRows[i]) !== JSON.stringify(solutionRows[i])) {
      return false;
    }
  }

  return true;
}
// @desc    Get user's progress/history for a specific assignment
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    user: req.user._id,
  });
  if (submissions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No submissions found for this user"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, submissions, "Submission history retrieved"));
});
