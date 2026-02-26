import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  question: { type: String, required: true },

  sampleDataViewer: [
    {
      tableName: String,
      columns: [String],
      sampleRows: [Object],
    },
  ],

  solutionQuery: { type: String, required: true },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
