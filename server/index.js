import express from "express";
import http from 'http'
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://fest-management-app.vercel.app",
    credentials: true,
  })
);
// console.log(process.env.NODE_ENV)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let isConnected = false;

const connectInServer = async () => {
  try {
    await connectDB();
    // console.log("Database connected successfully");
    isConnected = true;
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectInServer();
    isConnected = true;
  }
  next();
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from the backend!",
    date: new Date(),
    health: "OK",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

server.listen(PORT, () => {
  // connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
