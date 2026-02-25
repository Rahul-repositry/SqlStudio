import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    lastQuery: { type: String, required: true },
    status: {
      type: String,
      enum: ["attempted", "solved"],
      default: "attempted",
    },
    solvedAt: { type: Date },
  },
  { timestamps: true },
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
