import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import { connectDB } from "./config/database.js";


// Initialize an express app
const app = express();
// Define the PORT
const PORT = process.env.PORT || 3000;

// Establish a Connection to the database 
await connectDB();

// Middleware Setup to Parse JSON request bodies
app.use(express.json());
app.use(cookieParser()); // Cookie parser middleware to parse http cookies
// Define API routes
app.use("/api/auth", authRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});