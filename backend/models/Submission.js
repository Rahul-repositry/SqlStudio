import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    lastQuery: { type: String, required: true }, // The SQL query they wrote [cite: 25]
    status: {
      type: String,
      enum: ["attempted", "solved"],
      default: "attempted",
    },
    attemptsCount: { type: Number, default: 1 },

    // Real-world touch: Track if they used hints to penalize their "score"
    hintsUsed: { type: Number, default: 0 },
    solvedAt: { type: Date },
  },
  { timestamps: true },
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
