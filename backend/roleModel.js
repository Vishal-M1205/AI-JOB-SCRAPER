import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    suggestedRoles: {
      type: [String],
      required: true
    }
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
