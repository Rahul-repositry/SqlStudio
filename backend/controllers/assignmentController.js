import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all assignments with user's solved status
export const getAllAssignments = asyncHandler(async (req, res) => {
  const { difficulty } = req.query;
  const filter = difficulty ? { difficulty } : {};

  const assignments = await Assignment.find(filter).select("-solutionHash");

  // Logic to show "Solved" status for the logged-in user
  const userSubmissions = await Submission.find({
    user: req.user._id,
    status: "solved",
  });
  const solvedIds = userSubmissions.map((s) => s.assignment.toString());

  const data = assignments.map((asn) => ({
    ...asn._doc,
    isSolved: solvedIds.includes(asn._id.toString()),
  }));

  res
    .status(200)
    .json(new ApiResponse(200, data, "Assignments fetched successfully"));
});

// @desc    Get single assignment details for the playground
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new AppError("Assignment not found", 404);

  res
    .status(200)
    .json(new ApiResponse(200, assignment, "Assignment details loaded"));
});
