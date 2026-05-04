const express = require("express");
const cors = require("cors");

const app = express();

const connectDB = require("./config/db");
connectDB();
// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});