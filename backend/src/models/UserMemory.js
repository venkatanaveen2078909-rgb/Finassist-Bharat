import mongoose from "mongoose";

const userMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    income: Number,
    expenses: Number,
    emi: Number,
    goal: String,
    targetAmount: Number,

    chatHistory: [
      {
        role: String,
        message: String,
        agent: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("UserMemory", userMemorySchema);