import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    question: { type: String, required: true },

    // This helps React render the "Sample Data Viewer" table [cite: 21]
    sampleDataViewer: [
      {
        tableName: String,
        columns: [String],
        sampleRows: [Object],
      },
    ],

    solutionHash: { type: String, required: true }, // Optional: To verify the result without hardcoding
    hintsCount: { type: Number, default: 3 },
  },
  { timestamps: true },
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
