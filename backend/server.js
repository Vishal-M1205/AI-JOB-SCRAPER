import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationRoute from "./applicationRoute.js";
import jobRoutes from "./jobRoute.js";
import userRoutes from "./userRoute.js";
import connectDB from "./dbConfig.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors({ origin: "https://ai-job-scraper-vert.vercel.app/" }));
// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);
app.use("/api/applications", applicationRoute);
// Health check
app.get("/", (req, res) => {
  res.send("Working");
});

const PORT = process.env.PORT || 8080;

// Connect DB first, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
