import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationRoute from "./applicationRoute.js";
import jobRoutes from "./jobRoute.js";
import userRoutes from "./userRoute.js";
import connectDB from "./dbConfig.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
