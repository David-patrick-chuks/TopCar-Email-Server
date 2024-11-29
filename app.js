const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
const cors = require("cors"); // Import CORS middleware
require("dotenv").config();
const connectDB = require("./config/db"); // Import MongoDB connection

const { acknowledgmentEmailCron, weeklyFollowUpCron } = require("./crons");
const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Localhost (development)
  "https://lease-car.vercel.app", // Production URL
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the origin or handle non-browser requests (like Postman)
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
};

// Apply CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Localhost (development)
      "https://lease-car.vercel.app", // Production URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Connect to MongoDB
connectDB();
app.get("/", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});

app.use("/api/email", require("./routes/api.route"));

// Start cron jobs
acknowledgmentEmailCron();
weeklyFollowUpCron();
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
