import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  salary: { type: String },
  link: { type: String }, // Link to the original job post
  dateApplied: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Saved", "Applied", "Interviewing", "Offer", "Rejected"],
    default: "Saved",
  },
});

const Application = mongoose.model("Application", applicationSchema);
export default Application;